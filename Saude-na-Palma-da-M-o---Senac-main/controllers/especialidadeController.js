const Especialidade = require('../models/Especialidade');

const especialidadeController = {

  async getAll(req, res) {
    try {
      const especialidades = await Especialidade.getAll();

      return res.status(200).json(especialidades);
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);

      return res.status(500).json({
        error: 'Erro ao buscar especialidades'
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const especialidade = await Especialidade.findById(id);

      if (!especialidade) {
        return res.status(404).json({
          error: 'Especialidade não encontrada'
        });
      }

      return res.status(200).json(especialidade);
    } catch (error) {
      console.error('Erro ao buscar especialidade:', error);

      return res.status(500).json({
        error: 'Erro ao buscar especialidade'
      });
    }
  },

  async create(req, res) {
    try {
      const {
        nome,
        descricao,
        status
      } = req.body;

      if (!nome) {
        return res.status(400).json({
          error: 'Nome é obrigatório'
        });
      }

      const especialidade = await Especialidade.create({
        nome,
        descricao,
        status
      });

      return res.status(201).json(especialidade);
    } catch (error) {
      console.error('Erro ao criar especialidade:', error);

      return res.status(500).json({
        error: 'Erro ao criar especialidade'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const {
        nome,
        descricao,
        status
      } = req.body;

      if (!nome) {
        return res.status(400).json({
          error: 'Nome é obrigatório'
        });
      }

      const especialidadeExistente = await Especialidade.findById(id);

      if (!especialidadeExistente) {
        return res.status(404).json({
          error: 'Especialidade não encontrada'
        });
      }

      const especialidade = await Especialidade.update(id, {
        nome,
        descricao,
        status
      });

      return res.status(200).json(especialidade);
    } catch (error) {
      console.error('Erro ao atualizar especialidade:', error);

      return res.status(500).json({
        error: 'Erro ao atualizar especialidade'
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const especialidadeExistente = await Especialidade.findById(id);

      if (!especialidadeExistente) {
        return res.status(404).json({
          error: 'Especialidade não encontrada'
        });
      }

      await Especialidade.delete(id);

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir especialidade:', error);

      return res.status(500).json({
        error: 'Erro ao excluir especialidade'
      });
    }
  }
};

module.exports = especialidadeController;