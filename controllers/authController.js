const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Paciente = require('../models/Paciente');
const Profissional = require('../models/Profissional');
const { normalizarEmail, somenteDigitos } = require('../utils/validacao');

function gerarToken(usuario, role) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

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
    } = req.body || {};

    const emailNormalizado = normalizarEmail(email);
    const cpfNumerico = somenteDigitos(cpf);

    if (
      !String(nome_completo || '').trim() ||
      !cpfNumerico ||
      !data_nascimento ||
      !emailNormalizado ||
      !senha
    ) {
      return res.status(400).json({
        error: 'Nome, CPF, data de nascimento, e-mail e senha são obrigatórios'
      });
    }

    if (cpfNumerico.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    if (String(senha).length < 8) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 8 caracteres'
      });
    }

    const senha_hash = await bcrypt.hash(String(senha), 10);

    const paciente = await Paciente.createPaciente({
      nome_completo: String(nome_completo).trim(),
      cpf: cpfNumerico,
      data_nascimento,
      telefone,
      email: emailNormalizado,
      senha_hash,
      contato_emergencia_nome,
      contato_emergencia_telefone,
      contato_emergencia_email: contato_emergencia_email
        ? normalizarEmail(contato_emergencia_email)
        : undefined,
      relacao_contato
    });

    res.status(201).json({
      message: 'Paciente cadastrado com sucesso',
      token: gerarToken(paciente, 'paciente'),
      paciente: {
        id: paciente.id,
        nome_completo: paciente.nome_completo,
        email: paciente.email
      }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error.name);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Já existe um paciente com este e-mail ou CPF'
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dados inválidos. Confira o CPF, o e-mail e a data de nascimento.'
      });
    }

    res.status(500).json({ error: 'Erro ao realizar cadastro' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body || {};
    const emailNormalizado = normalizarEmail(email);

    if (!emailNormalizado || !senha) {
      return res.status(400).json({ error: 'Informe e-mail e senha' });
    }

    const paciente = await Paciente.findByEmail(emailNormalizado);

    const senhaValida = paciente
      ? await bcrypt.compare(String(senha), paciente.senha_hash)
      : false;

    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token: gerarToken(paciente, 'paciente'),
      paciente: {
        id: paciente.id,
        nome_completo: paciente.nome_completo,
        email: paciente.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error.name);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
}

async function loginProfissional(req, res) {
  try {
    const { email, senha } = req.body || {};
    const emailNormalizado = normalizarEmail(email);

    if (!emailNormalizado || !senha) {
      return res.status(400).json({ error: 'Informe e-mail e senha' });
    }

    const profissional = await Profissional.findByEmail(emailNormalizado);

    const senhaValida = profissional?.senha_hash
      ? await bcrypt.compare(String(senha), profissional.senha_hash)
      : false;

    if (!profissional || !profissional.status || !senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token: gerarToken(profissional, 'profissional'),
      profissional: {
        id: profissional.id,
        nome: profissional.nome,
        email: profissional.email
      }
    });
  } catch (error) {
    console.error('Erro no login do profissional:', error.name);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
}

// Conta única operacional definida por ambiente; o hash nunca fica no código.
async function loginAdmin(req, res) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminSenhaHash = process.env.ADMIN_SENHA_HASH;

    if (!adminEmail || !adminSenhaHash) {
      return res.status(503).json({
        error: 'Login administrativo não configurado'
      });
    }

    const { email, senha } = req.body || {};
    const emailNormalizado = normalizarEmail(email);

    if (!emailNormalizado || !senha) {
      return res.status(400).json({ error: 'Informe e-mail e senha' });
    }

    const emailValido = emailNormalizado === normalizarEmail(adminEmail);
    const senhaValida = emailValido
      ? await bcrypt.compare(String(senha), adminSenhaHash)
      : false;

    if (!emailValido || !senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token: gerarToken({ id: 'admin', email: emailNormalizado }, 'admin'),
      admin: {
        email: emailNormalizado
      }
    });
  } catch (error) {
    console.error('Erro no login do administrador:', error.name);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
}

module.exports = {
  cadastrar,
  login,
  loginProfissional,
  loginAdmin
};
