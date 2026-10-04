const pool = require('../db');

const Disponibilidade = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT
        id,
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim,
        created_at,
        updated_at
      FROM disponibilidades
    `);

    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT
        id,
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim,
        created_at,
        updated_at
      FROM disponibilidades
      WHERE id = $1
    `, [id]);

    return rows[0];
  },

  async create(disponibilidade) {
    const {
      id_profissional,
      dia_semana,
      horario_inicio,
      horario_fim
    } = disponibilidade;

    const { rows } = await pool.query(`
      INSERT INTO disponibilidades (
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim,
        created_at,
        updated_at
    `, [
      id_profissional,
      dia_semana,
      horario_inicio,
      horario_fim
    ]);

    return rows[0];
  },

  async update(id, disponibilidade) {
    const {
      id_profissional,
      dia_semana,
      horario_inicio,
      horario_fim
    } = disponibilidade;

    const { rows } = await pool.query(`
      UPDATE disponibilidades
      SET
        id_profissional = $1,
        dia_semana = $2,
        horario_inicio = $3,
        horario_fim = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING
        id,
        id_profissional,
        dia_semana,
        horario_inicio,
        horario_fim,
        created_at,
        updated_at
    `, [
      id_profissional,
      dia_semana,
      horario_inicio,
      horario_fim,
      id
    ]);

    return rows[0];
  },

  async delete(id) {
    await pool.query(
      'DELETE FROM disponibilidades WHERE id = $1',
      [id]
    );
  }
};

module.exports = Disponibilidade;