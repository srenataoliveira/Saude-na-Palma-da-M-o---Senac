const pool = require('../db');

const Profissional = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT
        id,
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_conselho,
        conselho,
        telefone,
        email,
        status,
        created_at,
        updated_at
      FROM profissionais
    `);

    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT
        id,
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_conselho,
        conselho,
        telefone,
        email,
        status,
        created_at,
        updated_at
      FROM profissionais
      WHERE id = $1
    `, [id]);

    return rows[0];
  },

  async create(profissional) {
    const {
      id_clinica,
      id_especialidade,
      nome,
      cpf,
      registro_conselho,
      conselho,
      telefone,
      email,
      status
    } = profissional;

    const { rows } = await pool.query(`
      INSERT INTO profissionais (
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_conselho,
        conselho,
        telefone,
        email,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_conselho,
        conselho,
        telefone,
        email,
        status,
        created_at,
        updated_at
    `, [
      id_clinica,
      id_especialidade,
      nome,
      cpf,
      registro_conselho,
      conselho,
      telefone,
      email,
      status
    ]);

    return rows[0];
  },

  async update(id, profissional) {
    const {
      id_clinica,
      id_especialidade,
      nome,
      cpf,
      registro_conselho,
      conselho,
      telefone,
      email,
      status
    } = profissional;

    const { rows } = await pool.query(`
      UPDATE profissionais
      SET
        id_clinica = $1,
        id_especialidade = $2,
        nome = $3,
        cpf = $4,
        registro_conselho = $5,
        conselho = $6,
        telefone = $7,
        email = $8,
        status = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING
        id,
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_conselho,
        conselho,
        telefone,
        email,
        status,
        created_at,
        updated_at
    `, [
      id_clinica,
      id_especialidade,
      nome,
      cpf,
      registro_conselho,
      conselho,
      telefone,
      email,
      status,
      id
    ]);

    return rows[0];
  },

  async delete(id) {
    await pool.query(
      'DELETE FROM profissionais WHERE id = $1',
      [id]
    );
  }
};

module.exports = Profissional;
