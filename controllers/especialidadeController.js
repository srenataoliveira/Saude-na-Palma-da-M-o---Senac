const Especialidade = require('../models/Especialidade');

function tratarErro(error, res, mensagemPadrao) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Já existe uma especialidade com este nome'
    });
  }

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  console.error(mensagemPadrao, error.name);
  return res.status(500).json({ error: mensagemPadrao });
}

function lerDados(body) {
  const nome = String(body?.nome ?? '').trim();
  const { descricao, status } = body || {};

  if (!nome) {
    return { erro: 'Nome é obrigatório' };
  }

  if (nome.length > 100) {
    return { erro: 'O nome deve ter até 100 caracteres' };
  }

  if (status !== undefined && typeof status !== 'boolean') {
    return { erro: 'O status deve ser verdadeiro ou falso' };
  }

  return { dados: { nome, descricao, status } };
}

const especialidadeController = {
  async getAll(req, res) {
    try {
      const especialidades =
        req.usuario.role === 'admin'
          ? await Especialidade.getAll()
          : await Especialidade.getAtivas();

      return res.status(200).json(especialidades);
    } catch (error) {
      return tratarErro(error, res, 'Erro ao buscar especialidades');
    }
  },

  async getById(req, res) {
    try {
      const especialidade = await Especialidade.findById(req.params.id);

      if (
        !especialidade ||
        (!especialidade.status && req.usuario.role !== 'admin')
      ) {
        return res.status(404).json({ error: 'Especialidade não encontrada' });
      }

      return res.status(200).json(especialidade);
    } catch (error) {
      return tratarErro(error, res, 'Erro ao buscar especialidade');
    }
  },

  async create(req, res) {
    try {
      const { dados, erro } = lerDados(req.body);
      if (erro) return res.status(400).json({ error: erro });

      const criada = await Especialidade.createEspecialidade(dados);

      return res.status(201).json(criada);
    } catch (error) {
      return tratarErro(error, res, 'Erro ao criar especialidade');
    }
  },

  async update(req, res) {
    try {
      const { dados, erro } = lerDados(req.body);
      if (erro) return res.status(400).json({ error: erro });

      const atualizada = await Especialidade.updateEspecialidade(
        req.params.id,
        dados
      );

      if (!atualizada) {
        return res.status(404).json({ error: 'Especialidade não encontrada' });
      }

      return res.status(200).json(atualizada);
    } catch (error) {
      return tratarErro(error, res, 'Erro ao atualizar especialidade');
    }
  },

  async delete(req, res) {
    try {
      const existente = await Especialidade.findById(req.params.id);

      if (!existente) {
        return res.status(404).json({ error: 'Especialidade não encontrada' });
      }

      await Especialidade.deleteEspecialidade(req.params.id);

      return res.status(204).send();
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
          error: 'Há profissionais vinculados a esta especialidade'
        });
      }

      return tratarErro(error, res, 'Erro ao excluir especialidade');
    }
  }
};

module.exports = especialidadeController;
