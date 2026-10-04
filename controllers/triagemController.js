const Triagem = require('../models/Triagem');

async function listarCategorias(req, res) {
  try {
    const categorias = await Triagem.getCategorias();
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias de triagem' });
  }
}

async function listarPerguntas(req, res) {
  try {
    const { idCategoria } = req.params;
    const perguntas = await Triagem.getPerguntasPorCategoria(idCategoria);
    res.json(perguntas);
  } catch (error) {
    console.error('Erro ao listar perguntas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas da triagem' });
  }
}

async function registrarTriagem(req, res) {
  try {
    const idPaciente = req.usuario.id; // Extraído do authMiddleware
    const { id_categoria, respostas } = req.body;

    if (!id_categoria) {
      return res.status(400).json({ error: 'A categoria de sintomas é obrigatória.' });
    }

    // Regra simples de avaliação de urgência baseada nas respostas enviadas
    let possuiRespostaCritica = false;
    if (respostas && Array.isArray(respostas)) {
      possuiRespostaCritica = respostas.some(r => r.resposta_bool === true);
    }

    const statusFinal = possuiRespostaCritica 
      ? 'Encaminhar_Atendimento_Presencial_Urgente' 
      : 'Agendamento_Telemedicina_Recomendado';

    const resultado = await Triagem.salvarTriagem(idPaciente, id_categoria, statusFinal, respostas);

    res.status(201).json({
      message: 'Pré-triagem concluída com sucesso!',
      triagem: resultado
    });
  } catch (error) {
    console.error('Erro ao salvar triagem:', error);
    res.status(500).json({ error: 'Erro ao registrar pré-triagem' });
  }
}

async function obterHistorico(req, res) {
  try {
    const idPaciente = req.usuario.id;
    const historico = await Triagem.getHistoricoPorPaciente(idPaciente);
    res.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico de triagens' });
  }
}

module.exports = {
  listarCategorias,
  listarPerguntas,
  registrarTriagem,
  obterHistorico
};