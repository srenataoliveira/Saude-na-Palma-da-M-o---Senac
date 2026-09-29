const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function cadastrar(req, res) {
  try {
    const {
      nome_completo,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
      contato_emergencia_nome,
      contato_emergencia_telefone,
      contato_emergencia_email,
      relacao_contato
    } = req.body;

    const senha_hash = await bcrypt.hash(senha, 10);

    // O cadastro no banco será implementado aqui
    // depois que a conexão com PostgreSQL estiver disponível.

    res.status(201).json({
      message: 'Cadastro preparado com sucesso',
      dados: {
        nome_completo,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha_hash,
        contato_emergencia_nome,
        contato_emergencia_telefone,
        contato_emergencia_email,
        relacao_contato
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar cadastro' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    // A busca do paciente no banco será implementada aqui.
    // Depois será feita a comparação da senha com bcrypt
    // e a geração do token JWT.

    res.status(200).json({
      message: 'Login preparado com sucesso',
      email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
}

module.exports = {
  cadastrar,
  login
};