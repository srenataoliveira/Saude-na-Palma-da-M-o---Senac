// Define a senha (e, se preciso, o e-mail) de um profissional que já existe,
// para ele poder entrar no portal.
//
// Uso:
//   node scripts/definirSenhaProfissional.js <id-ou-email> <senha> [novo-email]

require('dotenv').config();

const bcrypt = require('bcrypt');

const sequelize = require('../sequelize');
const { UUID_REGEX, normalizarEmail } = require('../utils/validacao');

const USO = `Uso:
  node scripts/definirSenhaProfissional.js <id-ou-email> <senha> [novo-email]`;

async function main() {
  const [alvo, senha, novoEmail] = process.argv.slice(2);

  if (!alvo || !senha) {
    console.log(USO);
    return;
  }

  if (senha.length < 8) {
    console.log('A senha deve ter pelo menos 8 caracteres.');
    return;
  }

  const porId = UUID_REGEX.test(alvo);

  const [linhas] = await sequelize.query(
    `UPDATE profissionais
        SET senha_hash = :hash,
            email = COALESCE(:novoEmail, email),
            updated_at = NOW()
      WHERE ${porId ? 'id = :alvo' : 'LOWER(email) = LOWER(:alvo)'}
      RETURNING id, nome, email`,
    {
      replacements: {
        hash: await bcrypt.hash(senha, 10),
        novoEmail: novoEmail ? normalizarEmail(novoEmail) : null,
        alvo
      }
    }
  );

  if (!linhas || linhas.length === 0) {
    console.log('Nenhum profissional encontrado com esse id ou e-mail.');
    return;
  }

  console.log(`Senha definida para ${linhas[0].nome} (${linhas[0].email}).`);
}

main()
  .catch((error) => {
    console.error('Falha ao definir a senha:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
