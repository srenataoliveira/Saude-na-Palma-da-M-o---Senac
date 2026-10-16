const Disponibilidade = require('../models/Disponibilidade');
const { UUID_REGEX, HORARIO_REGEX } = require('../utils/validacao');

function validarJanela({ dia_semana, horario_inicio, horario_fim }) {
  const dia =
    dia_semana === null || dia_semana === undefined || dia_semana === ''
      ? NaN
      : Number(dia_semana);

  if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
    return 'O dia da semana deve ser de 0 (domingo) a 6 (sábado)';
  }

  if (
    !HORARIO_REGEX.test(String(horario_inicio)) ||
    !HORARIO_REGEX.test(String(horario_fim))
  ) {
    return 'Informe os horários no formato HH:MM';
  }

  if (String(horario_inicio).slice(0, 5) >= String(horario_fim).slice(0, 5)) {
    return 'O horário de início deve ser anterior ao horário de fim';
  }

  return null;
}

function tratarErroBanco(error, res, mensagemPadrao) {
  if (
    error.name === 'SequelizeValidationError' ||
    error.name === 'SequelizeForeignKeyConstraintError'
  ) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  console.error(mensagemPadrao, error.name);
  return res.status(500).json({ error: mensagemPadrao });
}

const disponibilidadeController = {
  async getAll(req, res) {
    try {
      const { id_profissional } = req.query;

      if (
        id_profissional !== undefined &&
        !UUID_REGEX.test(String(id_profissional))
      ) {
        return res.status(400).json({ error: 'Profissional inválido' });
      }

      const disponibilidades = id_profissional
        ? await Disponibilidade.getByProfissionalId(id_profissional)
        : await Disponibilidade.getAll();

      return res.status(200).json(disponibilidades);
    } catch (error) {
      return tratarErroBanco(error, res, 'Erro ao buscar disponibilidades');
    }
  },

  async getMinhas(req, res) {
    try {
      const disponibilidades = await Disponibilidade.getByProfissionalId(
        req.usuario.id
      );

      return res.status(200).json(disponibilidades);
    } catch (error) {
      return tratarErroBanco(error, res, 'Erro ao buscar disponibilidades');
    }
  },

  async create(req, res) {
    try {
      const { dia_semana, horario_inicio, horario_fim } = req.body || {};

      const problema = validarJanela({ dia_semana, horario_inicio, horario_fim });
      if (problema) return res.status(400).json({ error: problema });

      // O dono vem sempre do token, nunca do corpo da requisição.
      const janela = {
        id_profissional: req.usuario.id,
        dia_semana: Number(dia_semana),
        horario_inicio: String(horario_inicio).slice(0, 5),
        horario_fim: String(horario_fim).slice(0, 5)
      };

      if (await Disponibilidade.existeSobreposicao(janela)) {
        return res.status(409).json({
          error: 'Este horário se sobrepõe a outro já cadastrado neste dia'
        });
      }

      const criada = await Disponibilidade.createDisponibilidade(janela);

      return res.status(201).json(criada);
    } catch (error) {
      return tratarErroBanco(error, res, 'Erro ao criar disponibilidade');
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { dia_semana, horario_inicio, horario_fim } = req.body || {};

      const existente = await Disponibilidade.findById(id);

      // 404 também quando é de outro profissional, para não revelar que existe.
      if (!existente || existente.id_profissional !== req.usuario.id) {
        return res.status(404).json({ error: 'Disponibilidade não encontrada' });
      }

      const problema = validarJanela({ dia_semana, horario_inicio, horario_fim });
      if (problema) return res.status(400).json({ error: problema });

      const janela = {
        id_profissional: req.usuario.id,
        dia_semana: Number(dia_semana),
        horario_inicio: String(horario_inicio).slice(0, 5),
        horario_fim: String(horario_fim).slice(0, 5)
      };

      if (await Disponibilidade.existeSobreposicao(janela, id)) {
        return res.status(409).json({
          error: 'Este horário se sobrepõe a outro já cadastrado neste dia'
        });
      }

      const atualizada = await Disponibilidade.updateDisponibilidade(id, {
        dia_semana: janela.dia_semana,
        horario_inicio: janela.horario_inicio,
        horario_fim: janela.horario_fim
      });

      return res.status(200).json(atualizada);
    } catch (error) {
      return tratarErroBanco(error, res, 'Erro ao atualizar disponibilidade');
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const existente = await Disponibilidade.findById(id);

      if (!existente || existente.id_profissional !== req.usuario.id) {
        return res.status(404).json({ error: 'Disponibilidade não encontrada' });
      }

      await Disponibilidade.deleteDisponibilidade(id);

      return res.status(204).send();
    } catch (error) {
      return tratarErroBanco(error, res, 'Erro ao excluir disponibilidade');
    }
  }
};

module.exports = disponibilidadeController;
