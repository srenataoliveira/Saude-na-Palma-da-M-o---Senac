const Agendamento = require('../models/Agendamento');
const Profissional = require('../models/Profissional');
const Clinica = require('../models/Clinica');
const Disponibilidade = require('../models/Disponibilidade');
const Triagem = require('../models/Triagem');
const {
  UUID_REGEX,
  HORARIO_REGEX,
  dataValida,
  diaDaSemana,
  agoraNaClinica
} = require('../utils/validacao');

async function listarAgendamentos(req, res) {
  try {
    const agendamentos = await Agendamento.getByPacienteId(req.usuario.id);

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error.name);

    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
}

async function buscarAgendamento(req, res) {
  try {
    const agendamento = await Agendamento.findById(req.params.id);

    // 404 também quando é de outro paciente, para não revelar que existe.
    if (
      !agendamento ||
      String(agendamento.id_paciente) !== String(req.usuario.id)
    ) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error.name);

    res.status(500).json({ error: 'Erro ao buscar agendamento' });
  }
}

async function criarAgendamento(req, res) {
  try {
    const {
      id_profissional,
      id_clinica,
      id_triagem,
      data_consulta,
      horario_inicio,
      horario_fim
    } = req.body || {};

    if (
      !id_profissional ||
      !id_clinica ||
      !data_consulta ||
      !horario_inicio ||
      !horario_fim
    ) {
      return res.status(400).json({
        error: 'Profissional, clínica, data e horários são obrigatórios'
      });
    }

    if (
      !UUID_REGEX.test(String(id_profissional)) ||
      !UUID_REGEX.test(String(id_clinica))
    ) {
      return res.status(400).json({ error: 'Profissional ou clínica inválidos' });
    }

    if (!dataValida(data_consulta)) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    if (
      !HORARIO_REGEX.test(String(horario_inicio)) ||
      !HORARIO_REGEX.test(String(horario_fim))
    ) {
      return res.status(400).json({ error: 'Informe os horários no formato HH:MM' });
    }

    const inicio = String(horario_inicio).slice(0, 5);
    const fim = String(horario_fim).slice(0, 5);

    if (inicio >= fim) {
      return res.status(400).json({
        error: 'O horário de início deve ser anterior ao horário de fim'
      });
    }

    const agora = agoraNaClinica();

    if (
      data_consulta < agora.data ||
      (data_consulta === agora.data && inicio <= agora.hora)
    ) {
      return res.status(400).json({
        error: 'Não é possível agendar em um horário que já passou'
      });
    }

    const profissional = await Profissional.findById(id_profissional);

    if (!profissional || !profissional.status) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    if (profissional.id_clinica !== id_clinica) {
      return res.status(400).json({
        error: 'Este profissional não atende nesta clínica'
      });
    }

    const clinica = await Clinica.findById(id_clinica);

    if (!clinica || !clinica.status) {
      return res.status(404).json({ error: 'Clínica não encontrada' });
    }

    const cabeNaAgenda = await Disponibilidade.cobreHorario(
      id_profissional,
      diaDaSemana(data_consulta),
      inicio,
      fim
    );

    if (!cabeNaAgenda) {
      return res.status(400).json({
        error: 'Este horário não está na agenda do profissional'
      });
    }

    if (id_triagem) {
      const triagemValida =
        UUID_REGEX.test(String(id_triagem)) &&
        (await Triagem.pertenceAoPaciente(id_triagem, req.usuario.id));

      if (!triagemValida) {
        return res.status(400).json({ error: 'Pré-triagem inválida' });
      }
    }

    const conflito = await Agendamento.verificarConflito(
      id_profissional,
      data_consulta,
      inicio,
      fim
    );

    if (conflito) {
      return res.status(409).json({
        error: 'Já existe um agendamento para este profissional neste horário'
      });
    }

    const agendamentoCriado = await Agendamento.create({
      id_paciente: req.usuario.id,
      id_profissional,
      id_clinica,
      id_triagem: id_triagem || null,
      data_consulta,
      horario_inicio: inicio,
      horario_fim: fim,
      status: 'Agendado'
    });

    res.status(201).json(agendamentoCriado);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error.name);

    // Dois pacientes confirmando o mesmo horário ao mesmo tempo
    if (error.name === 'SequelizeExclusionConstraintError') {
      return res.status(409).json({
        error: 'Já existe um agendamento para este profissional neste horário'
      });
    }

    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'SequelizeForeignKeyConstraintError'
    ) {
      return res.status(400).json({ error: 'Dados do agendamento inválidos' });
    }

    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
}

async function cancelarAgendamento(req, res) {
  try {
    const agendamento = await Agendamento.findById(req.params.id);

    if (
      !agendamento ||
      String(agendamento.id_paciente) !== String(req.usuario.id)
    ) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    if (agendamento.status !== 'Agendado') {
      return res.status(409).json({
        error: 'Só é possível cancelar consultas agendadas'
      });
    }

    const atualizado = await Agendamento.update(agendamento.id, {
      status: 'Cancelado'
    });

    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error.name);

    res.status(500).json({ error: 'Erro ao cancelar agendamento' });
  }
}

module.exports = {
  listarAgendamentos,
  buscarAgendamento,
  criarAgendamento,
  cancelarAgendamento
};
