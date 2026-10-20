// Cria um profissional com acesso ao portal (use dados fictícios em testes).
//
// Uso:
//   node scripts/criarProfissional.js "<nome>" <email> <senha> <cpf> <conselho> <uf> <registro> [id_clinica] [id_especialidade]
//
// Sem os dois últimos argumentos, o script lista as clínicas e especialidades
// disponíveis e termina sem criar nada.

require('dotenv').config();

const bcrypt = require('bcrypt');

const sequelize = require('../sequelize');
const Profissional = require('../models/Profissional');
const { normalizarEmail, somenteDigitos } = require('../utils/validacao');

const USO = `Uso:
  node scripts/criarProfissional.js "<nome>" <email> <senha> <cpf> <conselho> <uf> <registro> [id_clinica] [id_especialidade]

Exemplo:
  node scripts/criarProfissional.js "Dra. Teste" teste@exemplo.com SenhaDeTeste1 11122233344 CRM PE 123456`;

async function main() {
  const [
    nome,
    emailBruto,
    senha,
    cpfBruto,
    conselho,
    uf,
    registro,
    idClinica,
    idEspecialidade
  ] = process.argv.slice(2);

  if (!nome || !emailBruto || !senha || !cpfBruto || !conselho || !uf || !registro) {
    console.log(USO);
    return;
  }

  if (senha.length < 8) {
    console.log('A senha deve ter pelo menos 8 caracteres.');
    return;
  }

  if (!idClinica || !idEspecialidade) {
    const [clinicas] = await sequelize.query(
      'SELECT id, nome FROM clinicas ORDER BY nome'
    );
    const [especialidades] = await sequelize.query(
      'SELECT id, nome FROM especialidades ORDER BY nome'
    );

    console.log('Informe id_clinica e id_especialidade. Opções:\n');
    console.log('Clínicas:');
    console.table(clinicas);
    console.log('Especialidades:');
    console.table(especialidades);
    return;
  }

  const criado = await Profissional.createProfissional({
    nome,
    email: normalizarEmail(emailBruto),
    cpf: somenteDigitos(cpfBruto),
    conselho,
    uf_conselho: uf.toUpperCase(),
    registro_conselho: registro,
    id_clinica: idClinica,
    id_especialidade: idEspecialidade,
    senha_hash: await bcrypt.hash(senha, 10)
  });

  console.log(`Profissional criado: ${criado.nome} (${criado.email}) id=${criado.id}`);
}

main()
  .catch((error) => {
    console.error('Falha ao criar profissional:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
