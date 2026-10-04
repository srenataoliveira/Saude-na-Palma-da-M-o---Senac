const Agendamento = require('../models/Agendamento');

async function listarAgendamentos(req, res) {
  try {
    const agendamentos = await Agendamento.getByPacienteId(
      req.usuario.id
    );

    res.json(agendamentos);
  } catch (error) {
    console.error('ERRO AO LISTAR AGENDAMENTOS:', error);

    res.status(500).json({
      error: 'Erro ao listar agendamentos'
    });
  }
}

async function buscarAgendamento(req, res) {
  try {
    const id = req.params.id;

    const agendamento = await Agendamento.findById(id);

    if (!agendamento) {
      return res.status(404).json({
        error: 'Agendamento não encontrado'
      });
    }

    if (req.usuario.id !== agendamento.id_paciente) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar este agendamento'
      });
    }

    res.json(agendamento);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar agendamento'
    });
  }
}

async function criarAgendamento(req, res) {
  try {
    const {
      id_profissional,
      id_clinica,
      data_consulta,
      horario_inicio,
      horario_fim,
      status
    } = req.body;

    if (
      !id_profissional ||
      !id_clinica ||
      !data_consulta ||
      !horario_inicio ||
      !horario_fim ||
      !status
    ) {
      return res.status(400).json({
        error: 'Todos os campos do agendamento são obrigatórios'
      });
    }

    if (horario_inicio >= horario_fim) {
      return res.status(400).json({
        error: 'O horário de início deve ser anterior ao horário de fim'
      });
    }

    const conflito = await Agendamento.verificarConflito(
      id_profissional,
      data_consulta,
      horario_inicio,
      horario_fim
    );

    if (conflito) {
      return res.status(409).json({
        error: 'Já existe um agendamento para este profissional neste horário'
      });
    }

    const dadosAgendamento = {
      id_paciente: req.usuario.id,
      id_profissional,
      id_clinica,
      data_consulta,
      horario_inicio,
      horario_fim,
      status
    };

    const agendamentoCriado = await Agendamento.create(
      dadosAgendamento
    );

    res.status(201).json(agendamentoCriado);
  } catch (error) {
    console.error('ERRO AO CRIAR AGENDAMENTO:', error);

    res.status(500).json({
      error: 'Erro ao criar agendamento'
    });
  }
}

async function atualizarAgendamento(req, res) {
  try {
    const id = req.params.id;

    const agendamentoExistente = await Agendamento.findById(id);

    if (!agendamentoExistente) {
      return res.status(404).json({
        error: 'Agendamento não encontrado'
      });
    }

    if (req.usuario.id !== agendamentoExistente.id_paciente) {
      return res.status(403).json({
        error: 'Você não tem permissão para atualizar este agendamento'
      });
    }

    const {
      id_profissional,
      id_clinica,
      data_consulta,
      horario_inicio,
      horario_fim,
      status
    } = req.body;

    if (
      !id_profissional ||
      !id_clinica ||
      !data_consulta ||
      !horario_inicio ||
      !horario_fim ||
      !status
    ) {
      return res.status(400).json({
        error: 'Todos os campos do agendamento são obrigatórios'
      });
    }

    if (horario_inicio >= horario_fim) {
      return res.status(400).json({
        error: 'O horário de início deve ser anterior ao horário de fim'
      });
    }

    const conflito = await Agendamento.verificarConflitoAtualizacao(
      id,
      id_profissional,
      data_consulta,
      horario_inicio,
      horario_fim
    );

    if (conflito) {
      return res.status(409).json({
        error: 'Já existe um agendamento para este profissional neste horário'
      });
    }

    const dadosAtualizados = {
      id_paciente: agendamentoExistente.id_paciente,
      id_profissional,
      id_clinica,
      data_consulta,
      horario_inicio,
      horario_fim,
      status
    };

    const agendamentoAtualizado = await Agendamento.update(
      id,
      dadosAtualizados
    );

    res.json(agendamentoAtualizado);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR AGENDAMENTO:', error);

    res.status(500).json({
      error: 'Erro ao atualizar agendamento'
    });
  }
}

async function deletarAgendamento(req, res) {
  try {
    const id = req.params.id;

    const agendamentoExistente = await Agendamento.findById(id);

    if (!agendamentoExistente) {
      return res.status(404).json({
        error: 'Agendamento não encontrado'
      });
    }

    if (req.usuario.id !== agendamentoExistente.id_paciente) {
      return res.status(403).json({
        error: 'Você não tem permissão para deletar este agendamento'
      });
    }

    await Agendamento.delete(id);

    res.status(204).send();
  } catch (error) {
    console.error('ERRO AO DELETAR AGENDAMENTO:', error);

    res.status(500).json({
      error: 'Erro ao deletar agendamento'
    });
  }
}

module.exports = {
  listarAgendamentos,
  buscarAgendamento,
  criarAgendamento,
  atualizarAgendamento,
  deletarAgendamento
};