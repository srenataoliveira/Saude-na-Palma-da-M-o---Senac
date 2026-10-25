const Paciente = require('../models/Paciente');

async function meusDados(req, res) {
  try {
    const paciente = await Paciente.findById(req.usuario.id);

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    return res.json(paciente);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error.name);

    return res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
}

async function atualizarMeusDados(req, res) {
  try {
    const paciente = await Paciente.updatePaciente(
      req.usuario.id,
      req.body || {}
    );

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    return res.json(paciente);
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error.name);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    return res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
}

module.exports = {
  meusDados,
  atualizarMeusDados
};
