// POST /triagem/analisar
//
// Recebe o que o paciente relatou (texto livre + sintomas + intensidade +
// duração), pede uma recomendação de especialidade à IA e grava a pré-triagem.
//
// Ponto importante de arquitetura: o APLICATIVO fala com ESTA rota, e esta rota
// fala com a IA. A chave da IA nunca sai do servidor.

const Especialidade = require('../models/Especialidade');
const Triagem = require('../models/Triagem');
const { UUID_REGEX } = require('../utils/validacao');
const { classificarTriagem } = require('../services/classificacaoTriagem');
const { analisarSintomas } = require('../services/iaService');

const LIMITE_DESCRICAO = 500;

// Mapeia a orientação de segurança (TELECONSULTA / PRESENCIAL / POSSIVEL_URGENCIA)
// para a especialidade mais provável. Usado SÓ quando a IA não respondeu.
const ESPECIALIDADE_POR_CATEGORIA = {
  'Sintomas respiratórios': 'Clínica Geral',
  'Dor de cabeça e sintomas neurológicos': 'Clínica Geral',
  'Sintomas gastrointestinais': 'Clínica Geral',
  'Dores musculares e articulares': 'Ortopedia',
  'Sintomas urinários': 'Clínica Geral',
  'Problemas de pele': 'Dermatologia',
  'Febre e mal-estar geral': 'Clínica Geral',
  'Sintomas de ouvido, nariz e garganta': 'Otorrino',
  'Sintomas oculares': 'Oftalmologia',
  'Outros sintomas': 'Clínica Geral'
};

function normalizarNome(nome) {
  return String(nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function validarInteiros(corpo) {
  const { intensidade, duracao_dias: duracaoDias } = corpo;

  // Ambos são opcionais: a triagem antiga continua funcionando sem eles.
  if (intensidade !== undefined && intensidade !== null) {
    if (!Number.isInteger(intensidade) || intensidade < 0 || intensidade > 10) {
      return 'A intensidade deve ser um número inteiro de 0 a 10.';
    }
  }

  if (duracaoDias !== undefined && duracaoDias !== null) {
    if (!Number.isInteger(duracaoDias) || duracaoDias < 0 || duracaoDias > 365) {
      return 'A duração deve ser um número inteiro de dias entre 0 e 365.';
    }
  }

  return null;
}

// Modo seguro: usa a classificação por regras que JÁ EXISTE no projeto.
function recomendacaoPorRegras(categoria, perguntas, respostas, especialidades) {
  let classificacao = null;

  try {
    classificacao = classificarTriagem(categoria, perguntas, respostas);
  } catch (erro) {
    // A classificação por regras exige perguntas específicas por nome.
    // Se a categoria não estiver mapeada, seguimos sem orientação.
    console.warn('Classificação por regras indisponível:', erro.message);
  }

  const nomeSugerido = ESPECIALIDADE_POR_CATEGORIA[categoria?.nome_categoria];
  const alvo = normalizarNome(nomeSugerido);

  const encontrada = (especialidades || []).find(
    (e) => normalizarNome(e.nome) === alvo
  );

  return {
    classificacao,
    especialidades: encontrada
      ? [{ id: encontrada.id, nome: encontrada.nome, confianca: null }]
      : [],
    justificativa: 'Orientação definida pelas regras fixas de segurança do sistema.',
    modelo: null,
    origem: 'regras',
    aviso: 'Recomendação orientativa. Não é diagnóstico e não substitui avaliação médica.'
  };
}

async function analisar(req, res) {
  try {
    const idPaciente = req.usuario?.id;

    if (!UUID_REGEX.test(idPaciente || '')) {
      return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
    }

    const corpo = req.body || {};
    const { id_categoria: idCategoria, respostas, descricao } = corpo;
    const intensidade = corpo.intensidade ?? null;
    const duracaoDias = corpo.duracao_dias ?? null;

    if (typeof idCategoria !== 'string' || !UUID_REGEX.test(idCategoria)) {
      return res.status(400).json({ error: 'Informe uma categoria válida.' });
    }

    if (!Array.isArray(respostas) || respostas.length === 0) {
      return res.status(400).json({ error: 'Informe pelo menos uma resposta.' });
    }

    if (descricao !== undefined && typeof descricao !== 'string') {
      return res.status(400).json({ error: 'A descrição deve ser um texto.' });
    }

    if (typeof descricao === 'string' && descricao.length > LIMITE_DESCRICAO) {
      return res.status(400).json({
        error: `A descrição deve ter até ${LIMITE_DESCRICAO} caracteres.`
      });
    }

    const erroInteiros = validarInteiros(corpo);
    if (erroInteiros) {
      return res.status(400).json({ error: erroInteiros });
    }

    const categoria = await Triagem.getCategoriaPorId(idCategoria);

    if (!categoria) {
      return res.status(404).json({ error: 'Categoria de triagem não encontrada.' });
    }

    const perguntas = await Triagem.getPerguntasPorCategoria(idCategoria);
    const idsPerguntas = new Set(perguntas.map((p) => p.id));

    for (const resposta of respostas) {
      if (!resposta || typeof resposta.id_pergunta !== 'string') {
        return res.status(400).json({ error: 'Uma das perguntas informadas é inválida.' });
      }

      if (!idsPerguntas.has(resposta.id_pergunta)) {
        return res.status(400).json({
          error: 'Há perguntas que não pertencem à categoria selecionada.'
        });
      }
    }

    const especialidades = await Especialidade.getAtivas();

    // 1ª tentativa: IA. Se voltar null, cai para as regras.
    let resultado = await analisarSintomas({
      categoria: categoria.nome_categoria,
      perguntas,
      respostas,
      especialidades,
      descricao,
      intensidade,
      duracaoDias
    });

    if (!resultado || resultado.especialidades.length === 0) {
      resultado = recomendacaoPorRegras(categoria, perguntas, respostas, especialidades);
    }

    // Persiste a triagem junto com a recomendação.
    // A gravação dos campos novos depende da migration (intensidade / duracao /
    // especialidades_recomendadas). Enquanto ela não existir, gravamos só o
    // básico e seguimos — a recomendação continua sendo devolvida ao app.
    let triagem = null;

    try {
      triagem = await Triagem.salvarTriagem(
        idPaciente,
        idCategoria,
        'Pre_triagem_registrada',
        respostas,
        {
          intensidade,
          duracaoDias,
          descricao: typeof descricao === 'string' ? descricao.trim() : null,
          especialidadesRecomendadas: resultado.especialidades.map((e) => e.id)
        }
      );
    } catch (erro) {
      console.error('Erro ao gravar pré-triagem com recomendação:', erro.message);
      return res.status(500).json({ error: 'Não foi possível registrar a pré-triagem.' });
    }

    return res.status(201).json({
      message: 'Pré-triagem analisada com sucesso.',
      triagem,
      classificacao: resultado.classificacao || null,
      recomendacao: {
        especialidades: resultado.especialidades,
        justificativa: resultado.justificativa,
        origem: resultado.origem,
        modelo: resultado.modelo
      },
      aviso: resultado.aviso
    });
  } catch (erro) {
    console.error('Erro ao analisar pré-triagem:', erro.message);
    return res.status(500).json({ error: 'Erro ao analisar a pré-triagem.' });
  }
}

module.exports = { analisar };
