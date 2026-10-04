const pool = require('../db');

const Triagem = {
  // Busca categorias de sintomas cadastradas
  async getCategorias() {
    const { rows } = await pool.query(`
      SELECT id, nome_categoria, acao_imediata, ordem_exibicao
      FROM categorias_sintomas
      ORDER BY ordem_exibicao ASC
    `);
    return rows;
  },

  // Busca perguntas associadas a uma categoria
  async getPerguntasPorCategoria(idCategoria) {
    const { rows } = await pool.query(`
      SELECT id, texto_pergunta, tipo_resposta, ordem_exibicao
      FROM perguntas_categoria
      WHERE id_categoria = $1
      ORDER BY ordem_exibicao ASC
    `, [idCategoria]);
    return rows;
  },

  // Salva o histórico da triagem e as respostas passadas
  async salvarTriagem(idPaciente, idCategoria, statusFinal, respostas) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Registra no histórico do paciente
      const queryHistorico = `
        INSERT INTO historico_triagem_paciente (id_paciente, id_categoria_selecionada, status_final)
        VALUES ($1, $2, $3)
        RETURNING id, status_final, data_registro
      `;
      const resHistorico = await client.query(queryHistorico, [idPaciente, idCategoria, statusFinal]);
      const historicoCriado = resHistorico.rows[0];

      // 2. Registra as respostas fornecidas pelo paciente
      if (respostas && respostas.length > 0) {
        for (const resp of respostas) {
          const queryResposta = `
            INSERT INTO respostas_questionario (id_historico_triagem, id_pergunta, resposta_bool, resposta_texto)
            VALUES ($1, $2, $3, $4)
          `;
          await client.query(queryResposta, [
            historicoCriado.id,
            resp.id_pergunta,
            resp.resposta_bool !== undefined ? resp.resposta_bool : null,
            resp.resposta_texto || null
          ]);
        }
      }

      await client.query('COMMIT');
      return historicoCriado;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Obtém histórico de pré-triagens do paciente
  async getHistoricoPorPaciente(idPaciente) {
    const { rows } = await pool.query(`
      SELECT 
        h.id,
        c.nome_categoria,
        h.status_final,
        h.data_registro
      FROM historico_triagem_paciente h
      JOIN categorias_sintomas c ON h.id_categoria_selecionada = c.id
      WHERE h.id_paciente = $1
      ORDER BY h.data_registro DESC
    `, [idPaciente]);
    return rows;
  }
};

module.exports = Triagem;