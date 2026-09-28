const pool = require('../db');

const Agendamento = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        p.nome_completo AS paciente,
        med.nome AS profissional,
        c.nome AS clinica,
        a.data_consulta,
        a.horario_inicio,
        a.horario_fim,
        a.status,
        a.created_at,
        a.updated_at
      FROM agendamentos a
      JOIN pacientes p ON a.id_paciente = p.id
      JOIN profissionais med ON a.id_profissional = med.id
      JOIN clinicas c ON a.id_clinica = c.id
    `);

    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT *
      FROM agendamentos
      WHERE id = $1
    `, [id]);

    return rows[0];
  },

  async create(agendamento) {
    const {
      id_paciente,
      id_profissional,
      id_clinica,
      data_consulta,
      horario_inicio,
      horario_fim,
      status
    } = agendamento;

    const { rows } = await pool.query(`
      INSERT INTO agendamentos (
        id_paciente,
        id_profissional,
        id_clinica,
        data_consulta,
        horario_inicio,
        horario_fim,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        id_paciente,
        id_profissional,
        id_clinica,
        data_consulta,
        horario_inicio,
        horario_fim,
        status,
        created_at,
        updated_at
    `, [
      id_paciente,
      id_profissional,
      id_clinica,
      data_consulta,
      horario_inicio,
      horario_fim,
      status
    ]);

    return rows[0];
  },

  async update(id, agendamento) {
    const {
      id_paciente,
      id_profissional,
      id_clinica,
      data_consulta,
      horario_inicio,
      horario_fim,
      status
    } = agendamento;

    const { rows } = await pool.query(`
      UPDATE agendamentos
      SET
        id_paciente = $1,
        id_profissional = $2,
        id_clinica = $3,
        data_consulta = $4,
        horario_inicio = $5,
        horario_fim = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING
        id,
        id_paciente,
        id_profissional,
        id_clinica,
        data_consulta,
        horario_inicio,
        horario_fim,
        status,
        created_at,
        updated_at
    `, [
      id_paciente,
      id_profissional,
      id_clinica,
      data_consulta,
      horario_inicio,
      horario_fim,
      status,
      id
    ]);

    return rows[0];
  },

  async delete(id) {
    await pool.query(
      'DELETE FROM agendamentos WHERE id = $1',
      [id]
    );
  }
};

module.exports = Agendamento;
