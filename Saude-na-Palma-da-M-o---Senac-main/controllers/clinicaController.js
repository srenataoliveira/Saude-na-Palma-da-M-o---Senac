const Clinica = require('../models/Clinica');

const clinicaController = {

  async getAll(req, res) {
    try {
      const clinicas = await Clinica.getAll();

      return res.status(200).json(clinicas);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);

      return res.status(500).json({
        error: 'Erro ao buscar clínicas'
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const clinica = await Clinica.findById(id);

      if (!clinica) {
        return res.status(404).json({
          error: 'Clínica não encontrada'
        });
      }

      return res.status(200).json(clinica);
    } catch (error) {
      console.error('Erro ao buscar clínica:', error);

      return res.status(500).json({
        error: 'Erro ao buscar clínica'
      });
    }
  },

  async create(req, res) {
    try {
      const {
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status
      } = req.body;

      if (!nome || !cnpj || !endereco) {
        return res.status(400).json({
          error: 'Nome, CNPJ e endereço são obrigatórios'
        });
      }

      const clinica = await Clinica.create({
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status
      });

      return res.status(201).json(clinica);
    } catch (error) {
      console.error('Erro ao criar clínica:', error);

      if (error.code === '23505') {
        return res.status(409).json({
          error: 'CNPJ já cadastrado'
        });
      }

      return res.status(500).json({
        error: 'Erro ao criar clínica'
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const {
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status
      } = req.body;

      if (!nome || !cnpj || !endereco) {
        return res.status(400).json({
          error: 'Nome, CNPJ e endereço são obrigatórios'
        });
      }

      const clinicaExistente = await Clinica.findById(id);

      if (!clinicaExistente) {
        return res.status(404).json({
          error: 'Clínica não encontrada'
        });
      }

      const clinica = await Clinica.update(id, {
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status
      });

      return res.status(200).json(clinica);
    } catch (error) {
      console.error('Erro ao atualizar clínica:', error);

      if (error.code === '23505') {
        return res.status(409).json({
          error: 'CNPJ já cadastrado'
        });
      }

      return res.status(500).json({
        error: 'Erro ao atualizar clínica'
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const clinicaExistente = await Clinica.findById(id);

      if (!clinicaExistente) {
        return res.status(404).json({
          error: 'Clínica não encontrada'
        });
      }

      await Clinica.delete(id);

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);

      return res.status(500).json({
        error: 'Erro ao excluir clínica'
      });
    }
  }
};

module.exports = clinicaController;