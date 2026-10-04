const express = require('express');

const router = express.Router();

const profissionalController = require('../controllers/profissionalController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, profissionalController.listarProfissionais);

router.get('/:id', profissionalController.buscarProfissional);

router.post('/', profissionalController.criarProfissional);

router.put('/:id', profissionalController.atualizarProfissional);

router.delete('/:id', profissionalController.deletarProfissional);

module.exports = router;