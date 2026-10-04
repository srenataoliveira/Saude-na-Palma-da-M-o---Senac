const pool = require('../db');

const Especialidade = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT
        id,
        nome,
        descricao,
        status,
        created_at,
        updated_at
      FROM especialidades
    `);

    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT
        id,
        nome,
        descricao,
        status,
        created_at,
        updated_at
      FROM especialidades
      WHERE id = $1
    `, [id]);

    return rows[0];
  },

  async create(especialidade) {
    const {
      nome,
      descricao,
      status
    } = especialidade;

    const { rows } = await pool.query(`
      INSERT INTO especialidades (
        nome,
        descricao,
        status
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        nome,
        descricao,
        status,
        created_at,
        updated_at
    `, [
      nome,
      descricao,
      status
    ]);

    return rows[0];
  },

  async update(id, especialidade) {
    const {
      nome,
      descricao,
      status
    } = especialidade;

    const { rows } = await pool.query(`
      UPDATE especialidades
      SET
        nome = $1,
        descricao = $2,
        status = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING
        id,
        nome,
        descricao,
        status,
        created_at,
        updated_at
    `, [
      nome,
      descricao,
      status,
      id
    ]);

    return rows[0];
  },

  async delete(id) {
    await pool.query(
      'DELETE FROM especialidades WHERE id = $1',
      [id]
    );
  }
};

module.exports = Especialidade;