const Profissional = require('../models/Profissional');

async function listarProfissionais(req, res) {
  try {
    const profissionais = await Profissional.getAll();
    res.json(profissionais);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar profissionais' });
  }
}

async function buscarProfissional(req, res) {
  try {
    const id = req.params.id;
    const profissional = await Profissional.findById(id);

    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    res.json(profissional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
}

async function criarProfissional(req, res) {
  try {
    const dadosProfissional = req.body;
    const profissionalCriado = await Profissional.create(dadosProfissional);

    res.status(201).json(profissionalCriado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar profissional' });
  }
}

async function atualizarProfissional(req, res) {
  try {
    const id = req.params.id;
    const dadosAtualizados = req.body;

    const profissionalExistente = await Profissional.findById(id);

    if (!profissionalExistente) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    const profissionalAtualizado = await Profissional.update(
      id,
      dadosAtualizados
    );

    res.json(profissionalAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar profissional' });
  }
}

async function deletarProfissional(req, res) {
  try {
    const id = req.params.id;

    const profissionalExistente = await Profissional.findById(id);

    if (!profissionalExistente) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    await Profissional.delete(id);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar profissional' });
  }
}

module.exports = {
  listarProfissionais,
  buscarProfissional,
  criarProfissional,
  atualizarProfissional,
  deletarProfissional
};
