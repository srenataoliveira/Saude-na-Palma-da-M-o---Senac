const pool = require('../db');

const Paciente = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT
        id,
        nome_completo,
        cpf,
        data_nascimento,
        telefone,
        email,
        contato_emergencia_nome,
        contato_emergencia_telefone,
        contato_emergencia_email,
        relacao_contato,
        created_at,
        updated_at
      FROM pacientes
    `);

    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT
        id,
        nome_completo,
        cpf,
        data_nascimento,
        telefone,
        email,
        contato_emergencia_nome,
        contato_emergencia_telefone,
        contato_emergencia_email,
        relacao_contato,
        created_at,
        updated_at
      FROM pacientes
      WHERE id = $1
    `, [id]);

    return rows[0];
  },

  async create(paciente) {
    const {
      nome_completo,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha_hash,
      contato_emergencia_nome,
      contato_emergencia_telefone,
      contato_emergencia_email,
      relacao_contato
    } = paciente;

    const { rows } = await pool.query(`
      INSERT INTO pacientes (
        nome_completo,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha_hash,
        contato_emergencia_nome,
        contato_emergencia_telefone,
        contato_emergencia_email,
        relacao_contato
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        nome_completo,
        cpf,
        data_nascimento,
        telefone,
        email,
        contato_emergencia_nome,
        contato_emergencia_telefone,
        contato_emergencia_email,
        relacao_contato,
        created_at,
        updated_at
    `, [
      nome_completo,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha_hash,
      contato_emergencia_nome,
      contato_emergencia_telefone,
      contato_emergencia_email,
      relacao_contato
    ]);

    return rows[0];
  },

  async update(id, paciente) {
    const {
      nome_completo,
      cpf,
      data_nascimento,
      telefone,
      email,
      contato_emergencia_nome,
      contato_emergencia_telefone,
      contato_emergencia_email,
      relacao_contato
    } = paciente;

    const { rows } = await pool.query(`
      UPDATE pacientes
      SET
        nome_completo = $1,
        cpf = $2,
        data_nascimento = $3,
        telefone = $4,
        email = $5,
        contato_emergencia_nome = $6,
        contato_emergencia_telefone = $7,
        contato_emergencia_email = $8,
        relacao_contato = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING
        id,
        nome_completo,
        cpf,
        data_nascimento,
        telefone,
        email,
        contato_emergencia_nome,
        contato_emergencia_telefone,
        contato_emergencia_email,
        relacao_contato,
        created_at,
        updated_at
    `, [
      nome_completo,
      cpf,
      data_nascimento,
      telefone,
      email,
      contato_emergencia_nome,
      contato_emergencia_telefone,
      contato_emergencia_email,
      relacao_contato,
      id
    ]);

    return rows[0];
  },

  async delete(id) {
    await pool.query(
      'DELETE FROM pacientes WHERE id = $1',
      [id]
    );
  }
};

module.exports = Paciente;
