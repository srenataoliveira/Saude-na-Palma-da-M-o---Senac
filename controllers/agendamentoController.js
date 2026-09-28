const Agendamento = require('../models/Agendamento');

async function listarAgendamentos(req, res) {
  try {
    const agendamentos = await Agendamento.getAll();
    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
}

async function buscarAgendamento(req, res) {
  try {
    const id = req.params.id;
    const agendamento = await Agendamento.findById(id);

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar agendamento' });
  }
}

async function criarAgendamento(req, res) {
  try {
    const dadosAgendamento = req.body;
    const agendamentoCriado = await Agendamento.create(dadosAgendamento);

    res.status(201).json(agendamentoCriado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
}

async function atualizarAgendamento(req, res) {
  try {
    const id = req.params.id;
    const dadosAtualizados = req.body;

    const agendamentoExistente = await Agendamento.findById(id);

    if (!agendamentoExistente) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const agendamentoAtualizado = await Agendamento.update(
      id,
      dadosAtualizados
    );

    res.json(agendamentoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
}

async function deletarAgendamento(req, res) {
  try {
    const id = req.params.id;

    const agendamentoExistente = await Agendamento.findById(id);

    if (!agendamentoExistente) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await Agendamento.delete(id);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
}

module.exports = {
  listarAgendamentos,
  buscarAgendamento,
  criarAgendamento,
  atualizarAgendamento,
  deletarAgendamento
};
