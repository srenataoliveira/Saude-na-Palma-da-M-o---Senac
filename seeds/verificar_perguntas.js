require('dotenv').config();

const pool = require('../db');

async function verificarPerguntas() {
    try {
        const resultado = await pool.query(`
            SELECT
                c.nome_categoria,
                COUNT(p.id) AS total_perguntas
            FROM categorias_sintomas c
            LEFT JOIN perguntas_categoria p
                ON p.id_categoria = c.id
            GROUP BY c.id, c.nome_categoria, c.ordem_exibicao
            ORDER BY c.ordem_exibicao ASC;
        `);

        console.log('\nPerguntas cadastradas por categoria:\n');

        console.table(resultado.rows);

    } catch (erro) {
        console.error('Erro ao consultar perguntas:', erro.message);

    } finally {
        await pool.end();
    }
}

verificarPerguntas();