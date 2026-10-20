
require('dotenv').config();

const bcrypt = require('bcrypt');
const readline = require('readline');
const sequelize = require('../sequelize');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const email = 'rafael.silva@sauderecife.com.br';

  const senha = await new Promise(resolve => {
    rl.question('Digite a senha de teste (minimo 8 caracteres): ', resolve);
  });

  if (senha.length < 8) {
    console.log('A senha deve ter pelo menos 8 caracteres.');
    return;
  }

  const hash = await bcrypt.hash(senha, 10);

  const [linhas] = await sequelize.query(
    `UPDATE profissionais
     SET senha_hash = :hash, updated_at = NOW()
     WHERE LOWER(email) = LOWER(:email)
     RETURNING nome, email`,
    { replacements: { hash, email } }
  );

  if (!linhas.length) {
    console.log('Profissional nao encontrado. Nenhuma conta alterada.');
    return;
  }

  console.log(`Senha definida para ${linhas[0].nome} (${linhas[0].email}).`);
}

main()
  .catch(error => {
    console.error('Falha:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await sequelize.close();
  });
