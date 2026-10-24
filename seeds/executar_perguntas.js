require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function executarPerguntas() {
    const client = await pool.connect();

    try {
        const caminhoSQL = path.join(
            __dirname,
            '003_perguntas_triagem.sql'
        );

        const sql = fs.readFileSync(caminhoSQL, 'utf8');

        await client.query('BEGIN');

        await client.query(sql);

        const resultado = await client.query(`
            SELECT
                c.nome_categoria,
                COUNT(p.id)::int AS total_perguntas
            FROM categorias_sintomas c
            LEFT JOIN perguntas_categoria p
                ON p.id_categoria = c.id
            GROUP BY c.id, c.nome_categoria, c.ordem_exibicao
            ORDER BY c.ordem_exibicao ASC;
        `);

        const categoriasValidas =
            resultado.rows.length === 10 &&
            resultado.rows.every(
                categoria => categoria.total_perguntas === 4
            );

        if (!categoriasValidas) {
            throw new Error(
                'A validação falhou: cada uma das 10 categorias deve possuir 4 perguntas.'
            );
        }

        await client.query('COMMIT');

        console.log('Perguntas cadastradas com sucesso!');
        console.table(resultado.rows);

    } catch (erro) {
        await client.query('ROLLBACK');

        console.error(
            'Erro ao cadastrar perguntas. Alterações revertidas:',
            erro.message
        );

    } finally {
        client.release();
        await pool.end();
    }
}

executarPerguntas();