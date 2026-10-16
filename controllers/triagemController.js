const Triagem = require('../models/Triagem');
const { UUID_REGEX } = require('../utils/validacao');

const TAMANHO_MAXIMO_TEXTO = 1000;

async function listarCategorias(req, res) {
  try {
    const categorias = await Triagem.getCategorias();
    return res.json(categorias);
  } catch (error) {
    console.error('Erro ao listar categorias:', error.message);
    return res.status(500).json({
      error: 'Erro ao buscar categorias de triagem.'
    });
  }
}

async function listarPerguntas(req, res) {
  try {
    const { idCategoria } = req.params;

    if (!UUID_REGEX.test(idCategoria)) {
      return res.status(400).json({
        error: 'O identificador da categoria é inválido.'
      });
    }

    const categoria = await Triagem.getCategoriaPorId(idCategoria);

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoria de triagem não encontrada.'
      });
    }

    const perguntas =
      await Triagem.getPerguntasPorCategoria(idCategoria);

    return res.json(perguntas);
  } catch (error) {
    console.error('Erro ao listar perguntas:', error.message);
    return res.status(500).json({
      error: 'Erro ao buscar perguntas da triagem.'
    });
  }
}

async function registrarTriagem(req, res) {
  try {
    const idPaciente = req.usuario?.id;
    const { id_categoria, respostas } = req.body || {};

    if (!UUID_REGEX.test(idPaciente || '')) {
      return res.status(401).json({
        error: 'Usuário não autenticado corretamente.'
      });
    }

    if (
      typeof id_categoria !== 'string' ||
      !UUID_REGEX.test(id_categoria)
    ) {
      return res.status(400).json({
        error: 'Informe uma categoria válida.'
      });
    }

    const categoria = await Triagem.getCategoriaPorId(id_categoria);

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoria de triagem não encontrada.'
      });
    }

    if (!Array.isArray(respostas) || respostas.length === 0) {
      return res.status(400).json({
        error: 'Informe pelo menos uma resposta.'
      });
    }

    const idsPerguntas = [];

    for (const resposta of respostas) {
      if (
        !resposta ||
        typeof resposta !== 'object' ||
        Array.isArray(resposta) ||
        typeof resposta.id_pergunta !== 'string' ||
        !UUID_REGEX.test(resposta.id_pergunta)
      ) {
        return res.status(400).json({
          error: 'Uma das perguntas informadas é inválida.'
        });
      }

      if (idsPerguntas.includes(resposta.id_pergunta)) {
        return res.status(400).json({
          error: 'A mesma pergunta não pode ser respondida duas vezes.'
        });
      }

      idsPerguntas.push(resposta.id_pergunta);

      const temBoolean =
        resposta.resposta_bool !== undefined &&
        resposta.resposta_bool !== null;

      const temTexto =
        resposta.resposta_texto !== undefined &&
        resposta.resposta_texto !== null;

      if (temBoolean === temTexto) {
        return res.status(400).json({
          error: 'Cada resposta deve conter apenas um tipo de valor.'
        });
      }

      if (temBoolean && typeof resposta.resposta_bool !== 'boolean') {
        return res.status(400).json({
          error: 'A resposta booleana deve ser true ou false.'
        });
      }

      if (
        temTexto &&
        (
          typeof resposta.resposta_texto !== 'string' ||
          resposta.resposta_texto.trim().length === 0
        )
      ) {
        return res.status(400).json({
          error: 'A resposta em texto não pode estar vazia.'
        });
      }

      if (
        temTexto &&
        resposta.resposta_texto.length > TAMANHO_MAXIMO_TEXTO
      ) {
        return res.status(400).json({
          error: `A resposta em texto deve ter até ${TAMANHO_MAXIMO_TEXTO} caracteres.`
        });
      }
    }

    const perguntasValidas =
      await Triagem.getPerguntasDaCategoriaPorIds(
        id_categoria,
        idsPerguntas
      );

    if (perguntasValidas.length !== idsPerguntas.length) {
      return res.status(400).json({
        error: 'Há perguntas que não pertencem à categoria selecionada.'
      });
    }

    // O front já exige todas as respostas; aqui o servidor garante o mesmo.
    const perguntasDaCategoria =
      await Triagem.getPerguntasPorCategoria(id_categoria);

    if (perguntasDaCategoria.length !== idsPerguntas.length) {
      return res.status(400).json({
        error: 'Responda todas as perguntas da categoria selecionada.'
      });
    }

    const perguntasPorId = new Map(
      perguntasValidas.map(pergunta => [
        pergunta.id,
        String(pergunta.tipo_resposta || '').toUpperCase()
      ])
    );

    for (const resposta of respostas) {
      const tipo = perguntasPorId.get(resposta.id_pergunta);

      if (tipo === 'BOOLEAN') {
        if (typeof resposta.resposta_bool !== 'boolean') {
          return res.status(400).json({
            error: 'Esta pergunta exige uma resposta de sim ou não.'
          });
        }
      } else if (tipo === 'TEXT') {
        if (
          typeof resposta.resposta_texto !== 'string' ||
          resposta.resposta_texto.trim().length === 0
        ) {
          return res.status(400).json({
            error: 'Esta pergunta exige uma resposta em texto.'
          });
        }
      } else {
        return res.status(400).json({
          error: 'O tipo de resposta desta pergunta ainda não é suportado.'
        });
      }
    }

    // O protótipo registra a pré-triagem sem afirmar um diagnóstico
    // ou determinar automaticamente uma urgência clínica.
    const statusFinal = 'Pre_triagem_registrada';

    const resultado = await Triagem.salvarTriagem(
      idPaciente,
      id_categoria,
      statusFinal,
      respostas
    );

    return res.status(201).json({
      message: 'Pré-triagem registrada com sucesso.',
      triagem: resultado,
      aviso:
        'Este registro não é um diagnóstico nem substitui uma avaliação profissional.'
    });
  } catch (error) {
    console.error('Erro ao salvar pré-triagem:', error.message);

    return res.status(500).json({
      error: 'Não foi possível registrar a pré-triagem.'
    });
  }
}

async function obterHistorico(req, res) {
  try {
    const idPaciente = req.usuario?.id;

    if (!UUID_REGEX.test(idPaciente || '')) {
      return res.status(401).json({
        error: 'Usuário não autenticado corretamente.'
      });
    }

    const historico =
      await Triagem.getHistoricoPorPaciente(idPaciente);

    return res.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error.message);

    return res.status(500).json({
      error: 'Erro ao carregar histórico de triagens.'
    });
  }
}

module.exports = {
  listarCategorias,
  listarPerguntas,
  registrarTriagem,
  obterHistorico
};
