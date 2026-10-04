const Paciente = require('../models/Paciente');

async function listarPacientes(req, res) {
  try {
    const pacientes = await Paciente.getAll();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pacientes' });
  }
}

async function buscarPaciente(req, res) {
  try {
    const id = req.params.id;

    if (req.usuario.id !== id) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar este paciente'
      });
    }

    const paciente = await Paciente.findById(id);

    if (!paciente) {
      return res.status(404).json({
        error: 'Paciente não encontrado'
      });
    }

    res.json(paciente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
}

async function criarPaciente(req, res) {
  try {
    const dadosPaciente = req.body;
    const pacienteCriado = await Paciente.create(dadosPaciente);
    res.status(201).json(pacienteCriado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar paciente' });
  }
}

async function atualizarPaciente(req, res) {
  console.log('ENTROU NO ATUALIZAR PACIENTE');

  try {
    const id = req.params.id;

    console.log('ID DA URL:', id);
    console.log('ID DO TOKEN:', req.usuario.id);

    if (req.usuario.id !== id) {
      return res.status(403).json({
        error: 'Você não tem permissão para atualizar este paciente'
      });
    }

    const dadosAtualizados = req.body;

    const pacienteExistente = await Paciente.findById(id);

    if (!pacienteExistente) {
      return res.status(404).json({
        error: 'Paciente não encontrado'
      });
    }

    const pacienteAtualizado = await Paciente.update(
      id,
      dadosAtualizados
    );

    res.json(pacienteAtualizado);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR PACIENTE:', error);

    res.status(500).json({
      error: 'Erro ao atualizar paciente'
    });
  }
}

async function deletarPaciente(req, res) {
  try {
    const id = req.params.id;

    const pacienteExistente = await Paciente.findById(id);

    if (!pacienteExistente) {
      return res.status(404).json({
        error: 'Paciente não encontrado'
      });
    }

    await Paciente.delete(id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao deletar paciente'
    });
  }
}

module.exports = {
  listarPacientes,
  buscarPaciente,
  criarPaciente,
  atualizarPaciente,
  deletarPaciente
};