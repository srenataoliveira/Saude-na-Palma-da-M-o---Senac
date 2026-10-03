const Disponibilidade = require('../models/Disponibilidade');

const disponibilidadeController = {
  async getAll(req, res) {
    try {
      const disponibilidades = await Disponibilidade.getAll();

      return res.status(200).json(disponibilidades);
    } catch (error) {
      console.error('Erro ao buscar disponibilidades:', error);

      return res.status(500).json({
        error: 'Erro ao buscar disponibilidades'
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const disponibilidade = await Disponibilidade.findById(id);

      if (!disponibilidade) {
        return res.status(404).json({
          error: 'Disponibilidade não encontrada'
        });
      }

      return res.status(200).json(disponibilidade);
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);

      return res.status(500).json({
        error: 'Erro ao buscar disponibilidade'
      });
    }
  },

  async create(req, res) {
    try {
      const {
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim
      } = req.body;

      if (!id_profissional || !dia_semana || !horario_inicio || !horario_fim) {
        return res.status(400).json({
          error: 'Todos os campos são obrigatórios'
        });
      }

      const disponibilidade = await Disponibilidade.create({
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim
      });

      return res.status(201).json(disponibilidade);
    } catch (error) {
      console.error('Erro ao criar disponibilidade:', error);

      return res.status(500).json({
        error: 'Erro ao criar disponibilidade'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const {
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim
      } = req.body;

      if (!id_profissional || !dia_semana || !horario_inicio || !horario_fim) {
        return res.status(400).json({
          error: 'Todos os campos são obrigatórios'
        });
      }

      const disponibilidadeExistente = await Disponibilidade.findById(id);

      if (!disponibilidadeExistente) {
        return res.status(404).json({
          error: 'Disponibilidade não encontrada'
        });
      }

      const disponibilidade = await Disponibilidade.update(id, {
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim
      });

      return res.status(200).json(disponibilidade);
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);

      return res.status(500).json({
        error: 'Erro ao atualizar disponibilidade'
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const disponibilidadeExistente = await Disponibilidade.findById(id);

      if (!disponibilidadeExistente) {
        return res.status(404).json({
          error: 'Disponibilidade não encontrada'
        });
      }

      await Disponibilidade.delete(id);

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir disponibilidade:', error);

      return res.status(500).json({
        error: 'Erro ao excluir disponibilidade'
      });
    }
  }
};

module.exports = disponibilidadeController;