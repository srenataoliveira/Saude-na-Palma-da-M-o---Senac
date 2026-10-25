const bcrypt = require('bcrypt');

const Profissional = require('../models/Profissional');
const { normalizarEmail, somenteDigitos } = require('../utils/validacao');

function tratarErro(error, res, mensagemPadrao) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Já existe um profissional com este e-mail ou CPF'
    });
  }

  if (
    error.name === 'SequelizeValidationError' ||
    error.name === 'SequelizeForeignKeyConstraintError'
  ) {
    return res.status(400).json({
      error: 'Dados inválidos. Confira clínica, especialidade e e-mail.'
    });
  }

  console.error(mensagemPadrao, error.name);
  return res.status(500).json({ error: mensagemPadrao });
}

async function listarProfissionais(req, res) {
  try {
    const profissionais =
      req.usuario.role === 'admin'
        ? await Profissional.getAll()
        : await Profissional.getPublicos();

    res.json(profissionais);
  } catch (error) {
    tratarErro(error, res, 'Erro ao listar profissionais');
  }
}

async function meuPerfil(req, res) {
  try {
    const profissional = await Profissional.findById(req.usuario.id);

    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    res.json(profissional);
  } catch (error) {
    tratarErro(error, res, 'Erro ao buscar perfil');
  }
}

async function atualizarMeuPerfil(req, res) {
  try {
    const profissional = await Profissional.updatePerfil(
      req.usuario.id,
      req.body || {}
    );

    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    res.json(profissional);
  } catch (error) {
    tratarErro(error, res, 'Erro ao atualizar perfil');
  }
}

async function criarProfissional(req, res) {
  try {
    const dados = req.body || {};
    const email = normalizarEmail(dados.email);
    const cpf = somenteDigitos(dados.cpf);

    if (
      !String(dados.nome || '').trim() ||
      !cpf ||
      !email ||
      !dados.senha ||
      !dados.conselho ||
      !dados.registro_conselho
    ) {
      return res.status(400).json({
        error: 'Nome, CPF, e-mail, senha, conselho e registro são obrigatórios'
      });
    }

    if (cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    if (String(dados.senha).length < 8) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 8 caracteres'
      });
    }

    const ufConselho = String(dados.uf_conselho ?? '').trim().toUpperCase();

    const profissional = await Profissional.createProfissional({
      id_clinica: dados.id_clinica,
      id_especialidade: dados.id_especialidade,
      nome: String(dados.nome).trim(),
      cpf,
      registro_conselho: String(dados.registro_conselho).trim(),
      conselho: String(dados.conselho).trim(),
      uf_conselho: ufConselho || undefined,
      telefone: dados.telefone,
      email,
      senha_hash: await bcrypt.hash(String(dados.senha), 10),
      status: typeof dados.status === 'boolean' ? dados.status : undefined
    });

    res.status(201).json(profissional);
  } catch (error) {
    tratarErro(error, res, 'Erro ao criar profissional');
  }
}

async function atualizarProfissional(req, res) {
  try {
    const dados = { ...(req.body || {}) };

    if (dados.email !== undefined) {
      dados.email = normalizarEmail(dados.email);
    }

    const profissional = await Profissional.updateProfissional(
      req.params.id,
      dados
    );

    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    res.json(profissional);
  } catch (error) {
    tratarErro(error, res, 'Erro ao atualizar profissional');
  }
}

// Inativa em vez de apagar: preserva o histórico de consultas.
async function deletarProfissional(req, res) {
  try {
    const profissional = await Profissional.updateProfissional(
      req.params.id,
      { status: false }
    );

    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    tratarErro(error, res, 'Erro ao inativar profissional');
  }
}

async function obterHorariosOcupados(req, res) {
  try {
    const { id } = req.params;
    const { data_inicio, data_fim } = req.query;
    const { dataValida } = require('../utils/validacao');
    const Agendamento = require('../models/Agendamento');

    if (data_inicio && !dataValida(data_inicio)) {
      return res.status(400).json({ error: 'data_inicio inválida. Use AAAA-MM-DD' });
    }

    if (data_fim && !dataValida(data_fim)) {
      return res.status(400).json({ error: 'data_fim inválida. Use AAAA-MM-DD' });
    }

    if (data_inicio && data_fim && data_inicio > data_fim) {
      return res.status(400).json({ error: 'data_inicio não pode ser posterior a data_fim' });
    }

    const ocupados = await Agendamento.getHorariosOcupados(id, data_inicio, data_fim);

    res.json(ocupados);
  } catch (error) {
    tratarErro(error, res, 'Erro ao consultar horários ocupados');
  }
}

module.exports = {
  listarProfissionais,
  meuPerfil,
  atualizarMeuPerfil,
  criarProfissional,
  atualizarProfissional,
  deletarProfissional,
  obterHorariosOcupados
};
