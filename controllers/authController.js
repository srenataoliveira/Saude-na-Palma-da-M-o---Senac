const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Paciente = require('../models/Paciente');

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

    const paciente = await Paciente.create({
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
    });

    res.status(201).json({
      message: 'Paciente cadastrado com sucesso',
      paciente
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar cadastro' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const paciente = await Paciente.findByEmail(email);

    if (!paciente) {
      return res.status(401).json({
        error: 'E-mail ou senha inválidos'
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      paciente.senha_hash
    );

    if (!senhaValida) {
      return res.status(401).json({
        error: 'E-mail ou senha inválidos'
      });
    }

    const token = jwt.sign(
      {
        id: paciente.id,
        email: paciente.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      paciente: {
        id: paciente.id,
        nome_completo: paciente.nome_completo,
        email: paciente.email
      }
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