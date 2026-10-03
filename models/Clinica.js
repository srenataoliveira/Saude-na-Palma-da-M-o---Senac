const pool = require('../db');

const Clinica = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT
        id,
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status,
        created_at,
        updated_at
      FROM clinicas
    `);

    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT
        id,
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status,
        created_at,
        updated_at
      FROM clinicas
      WHERE id = $1
    `, [id]);

    return rows[0];
  },

  async create(clinica) {
    const {
      nome,
      cnpj,
      endereco,
      telefone,
      email,
      horario_funcionamento,
      status
    } = clinica;

    const { rows } = await pool.query(`
      INSERT INTO clinicas (
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status,
        created_at,
        updated_at
    `, [
      nome,
      cnpj,
      endereco,
      telefone,
      email,
      horario_funcionamento,
      status
    ]);

    return rows[0];
  },

  async update(id, clinica) {
    const {
      nome,
      cnpj,
      endereco,
      telefone,
      email,
      horario_funcionamento,
      status
    } = clinica;

    const { rows } = await pool.query(`
      UPDATE clinicas
      SET
        nome = $1,
        cnpj = $2,
        endereco = $3,
        telefone = $4,
        email = $5,
        horario_funcionamento = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING
        id,
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        horario_funcionamento,
        status,
        created_at,
        updated_at
    `, [
      nome,
      cnpj,
      endereco,
      telefone,
      email,
      horario_funcionamento,
      status,
      id
    ]);

    return rows[0];
  },

  async delete(id) {
    await pool.query(
      'DELETE FROM clinicas WHERE id = $1',
      [id]
    );
  }
};

module.exports = Clinica;