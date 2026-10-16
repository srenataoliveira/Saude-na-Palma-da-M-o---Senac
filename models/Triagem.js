const pool = require('../db');

const Triagem = {
  async getCategorias() {
    const { rows } = await pool.query(`
      SELECT id, nome_categoria, acao_imediata, ordem_exibicao
      FROM categorias_sintomas
      ORDER BY ordem_exibicao ASC
    `);

    return rows;
  },

  async getCategoriaPorId(idCategoria) {
    const { rows } = await pool.query(`
      SELECT id, nome_categoria, acao_imediata
      FROM categorias_sintomas
      WHERE id = $1
      LIMIT 1
    `, [idCategoria]);

    return rows[0] || null;
  },

  async getPerguntasPorCategoria(idCategoria) {
    const { rows } = await pool.query(`
      SELECT id, texto_pergunta, tipo_resposta, ordem_exibicao
      FROM perguntas_categoria
      WHERE id_categoria = $1
      ORDER BY ordem_exibicao ASC
    `, [idCategoria]);

    return rows;
  },

  async getPerguntasDaCategoriaPorIds(idCategoria, idsPerguntas) {
    const { rows } = await pool.query(`
      SELECT id, tipo_resposta
      FROM perguntas_categoria
      WHERE id_categoria = $1
        AND id = ANY($2::uuid[])
    `, [idCategoria, idsPerguntas]);

    return rows;
  },

  async salvarTriagem(idPaciente, idCategoria, statusFinal, respostas) {
    const client = await pool.connect();
    let transacaoIniciada = false;

    try {
      await client.query('BEGIN');
      transacaoIniciada = true;

      const resHistorico = await client.query(`
        INSERT INTO historico_triagem_paciente
          (id_paciente, id_categoria_selecionada, status_final)
        VALUES ($1, $2, $3)
        RETURNING id, status_final, data_registro
      `, [idPaciente, idCategoria, statusFinal]);

      const historicoCriado = resHistorico.rows[0];

      for (const resp of respostas) {
        await client.query(`
          INSERT INTO respostas_questionario
            (id_historico_triagem, id_pergunta, resposta_bool, resposta_texto)
          VALUES ($1, $2, $3, $4)
        `, [
          historicoCriado.id,
          resp.id_pergunta,
          resp.resposta_bool ?? null,
          resp.resposta_texto ?? null
        ]);
      }

      await client.query('COMMIT');
      transacaoIniciada = false;

      return historicoCriado;
    } catch (error) {
      if (transacaoIniciada) {
        try {
          await client.query('ROLLBACK');
        } catch (erroRollback) {
          console.error('Erro ao desfazer transação da triagem.');
        }
      }

      throw error;
    } finally {
      client.release();
    }
  },

  async getHistoricoPorPaciente(idPaciente) {
    const { rows } = await pool.query(`
      SELECT
        h.id,
        c.nome_categoria,
        h.status_final,
        h.data_registro
      FROM historico_triagem_paciente h
      JOIN categorias_sintomas c
        ON h.id_categoria_selecionada = c.id
      WHERE h.id_paciente = $1
      ORDER BY h.data_registro DESC
    `, [idPaciente]);

    return rows;
  },

  // A triagem informada pertence a este paciente?
  async pertenceAoPaciente(idTriagem, idPaciente) {
    const { rows } = await pool.query(`
      SELECT 1
      FROM historico_triagem_paciente
      WHERE id = $1 AND id_paciente = $2
    `, [idTriagem, idPaciente]);

    return rows.length > 0;
  },

  // Pré-triagem de uma consulta, para o profissional. A permissão está na
  // própria consulta: só devolve se o agendamento for deste profissional.
  async getPorAgendamentoDoProfissional(idAgendamento, idProfissional) {
    const { rows } = await pool.query(`
      SELECT h.id, c.nome_categoria, h.status_final, h.data_registro
      FROM agendamentos a
      JOIN historico_triagem_paciente h ON h.id = a.id_triagem
      JOIN categorias_sintomas c ON c.id = h.id_categoria_selecionada
      WHERE a.id = $1 AND a.id_profissional = $2
    `, [idAgendamento, idProfissional]);

    if (!rows[0]) return null;

    const respostas = await pool.query(`
      SELECT p.texto_pergunta, p.tipo_resposta,
             r.resposta_bool, r.resposta_texto
      FROM respostas_questionario r
      JOIN perguntas_categoria p ON p.id = r.id_pergunta
      WHERE r.id_historico_triagem = $1
      ORDER BY p.ordem_exibicao ASC
    `, [rows[0].id]);

    return { ...rows[0], respostas: respostas.rows };
  }
};

module.exports = Triagem;
