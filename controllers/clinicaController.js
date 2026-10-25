const Clinica = require('../models/Clinica');
const { normalizarEmail, somenteDigitos } = require('../utils/validacao');

function lerDados(body) {
  const nome = String(body?.nome ?? '').trim();
  const cnpj = somenteDigitos(body?.cnpj);
  const endereco = String(body?.endereco ?? '').trim();

  if (!nome || !cnpj || !endereco) {
    return { erro: 'Nome, CNPJ e endereço são obrigatórios' };
  }

  if (cnpj.length !== 14) {
    return { erro: 'CNPJ inválido' };
  }

  if (body.status !== undefined && typeof body.status !== 'boolean') {
    return { erro: 'O status deve ser verdadeiro ou falso' };
  }

  return {
    dados: {
      nome,
      cnpj,
      endereco,
      telefone: body.telefone,
      email: body.email ? normalizarEmail(body.email) : undefined,
      horario_funcionamento: body.horario_funcionamento,
      status: body.status
    }
  };
}

function tratarErro(error, res, mensagemPadrao) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'CNPJ já cadastrado' });
  }

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  console.error(mensagemPadrao, error.name);
  return res.status(500).json({ error: mensagemPadrao });
}

const clinicaController = {
  async getAll(req, res) {
    try {
      const clinicas =
        req.usuario.role === 'admin'
          ? await Clinica.getAll()
          : await Clinica.getAtivas();

      return res.status(200).json(clinicas);
    } catch (error) {
      return tratarErro(error, res, 'Erro ao buscar clínicas');
    }
  },

  async getById(req, res) {
    try {
      const clinica = await Clinica.findById(req.params.id);

      if (!clinica || (!clinica.status && req.usuario.role !== 'admin')) {
        return res.status(404).json({ error: 'Clínica não encontrada' });
      }

      return res.status(200).json(clinica);
    } catch (error) {
      return tratarErro(error, res, 'Erro ao buscar clínica');
    }
  },

  async create(req, res) {
    try {
      const { dados, erro } = lerDados(req.body || {});
      if (erro) return res.status(400).json({ error: erro });

      const clinica = await Clinica.createClinica(dados);

      return res.status(201).json(clinica);
    } catch (error) {
      return tratarErro(error, res, 'Erro ao criar clínica');
    }
  },

  async update(req, res) {
    try {
      const { dados, erro } = lerDados(req.body || {});
      if (erro) return res.status(400).json({ error: erro });

      const clinica = await Clinica.updateClinica(req.params.id, dados);

      if (!clinica) {
        return res.status(404).json({ error: 'Clínica não encontrada' });
      }

      return res.status(200).json(clinica);
    } catch (error) {
      return tratarErro(error, res, 'Erro ao atualizar clínica');
    }
  },

  async delete(req, res) {
    try {
      const existente = await Clinica.findById(req.params.id);

      if (!existente) {
        return res.status(404).json({ error: 'Clínica não encontrada' });
      }

      await Clinica.deleteClinica(req.params.id);

      return res.status(204).send();
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
          error: 'Há profissionais ou agendamentos vinculados a esta clínica. Inative-a em vez de excluir.'
        });
      }

      return tratarErro(error, res, 'Erro ao excluir clínica');
    }
  }
};

module.exports = clinicaController;
