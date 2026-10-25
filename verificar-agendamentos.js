const pool = require('./db');

async function main() {
  try {
    const resultado = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'agendamentos'
      ORDER BY ordinal_position
    `);

    console.log('Estrutura da tabela agendamentos:');
    console.table(resultado.rows);
  } catch (error) {
    console.error('Erro ao consultar a tabela:', error.message);
  } finally {
    await pool.end();
  }
}

main();