const express = require('express');
const router = express.Router();
const triagemController = require('../controllers/triagemController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas (para carregar o questionário)
router.get('/categorias', triagemController.listarCategorias);
router.get('/categorias/:idCategoria/perguntas', triagemController.listarPerguntas);

// Rotas protegidas (exigem que o paciente esteja autenticado)
router.post('/', authMiddleware, triagemController.registrarTriagem);
router.get('/meu-historico', authMiddleware, triagemController.obterHistorico);

module.exports = router;