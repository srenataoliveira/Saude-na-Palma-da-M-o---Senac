const fs = require('fs');
const path = require('path');
const pool = require('../db');

// Aplica o seed 004 (catálogo de demonstração) no banco configurado no .env.
//
// Uso, na pasta do back-end:
//   node seeds/executar_catalogo.js
//
// O arquivo SQL usa ON CONFLICT DO NOTHING em todas as tabelas, então rodar
// mais de uma vez não duplica nada e não altera o que já existe.

async function executar() {
  try {
    const arquivo = path.join(__dirname, '004_catalogo_demo.sql');
    const sql = fs.readFileSync(arquivo, 'utf8');

    await pool.query(sql);

    console.log('Catálogo de demonstração aplicado com sucesso!');

    const clinicas = await pool.query(
      'SELECT nome, endereco FROM clinicas ORDER BY nome'
    );

    const especialidades = await pool.query(
      'SELECT nome FROM especialidades ORDER BY nome'
    );

    const profissionais = await pool.query(
      `SELECT p.nome, e.nome AS especialidade, c.nome AS clinica
         FROM profissionais p
         JOIN especialidades e ON e.id = p.id_especialidade
         JOIN clinicas c ON c.id = p.id_clinica
        ORDER BY p.nome`
    );

    console.log(`\nClínicas (${clinicas.rowCount}):`);
    console.table(clinicas.rows);

    console.log(`\nEspecialidades (${especialidades.rowCount}):`);
    console.table(especialidades.rows);

    console.log(`\nProfissionais (${profissionais.rowCount}):`);
    console.table(profissionais.rows);
  } catch (erro) {
    console.error('Erro ao aplicar o catálogo de demonstração:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

executar();
