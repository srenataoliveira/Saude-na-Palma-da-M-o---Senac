const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function executar() {
  try {
    const arquivo = path.join(__dirname, '002_categorias_triagem.sql');
    const sql = fs.readFileSync(arquivo, 'utf8');

    await pool.query(sql);

    console.log('Categorias atualizadas com sucesso!');

    const resultado = await pool.query(
      'SELECT nome_categoria, ordem_exibicao FROM categorias_sintomas ORDER BY ordem_exibicao'
    );

    console.table(resultado.rows);
  } catch (erro) {
    console.error('Erro ao atualizar categorias:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

executar();