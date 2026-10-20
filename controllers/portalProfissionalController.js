const Agendamento = require('../models/Agendamento');
const Triagem = require('../models/Triagem');
const { UUID_REGEX } = require('../utils/validacao');

async function minhaAgenda(req, res) {
  try {
    const agendamentos = await Agendamento.getByProfissionalId(req.usuario.id);

    return res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao carregar agenda do profissional:', error.name);

    return res.status(500).json({ error: 'Erro ao carregar a agenda' });
  }
}

async function triagemDaConsulta(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Identificador inválido' });
    }

    const triagem = await Triagem.getPorAgendamentoDoProfissional(
      id,
      req.usuario.id
    );

    // 404 também quando a consulta é de outro profissional.
    if (!triagem) {
      return res.status(404).json({
        error: 'Pré-triagem não encontrada para esta consulta'
      });
    }

    return res.json(triagem);
  } catch (error) {
    console.error('Erro ao carregar pré-triagem:', error.name);

    return res.status(500).json({ error: 'Erro ao carregar a pré-triagem' });
  }
}

module.exports = { minhaAgenda, triagemDaConsulta };
