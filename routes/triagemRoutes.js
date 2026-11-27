const express = require('express');
const rateLimit = require('express-rate-limit');

const triagemController = require('../controllers/triagemController');
const iaController = require('../controllers/iaController');
const authMiddleware = require('../middleware/authMiddleware');

const { exigirPapel } = authMiddleware;

const router = express.Router();

const limitarRegistros = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas solicitações. Tente novamente em alguns minutos.' }
});

const limitarIA = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.IA_RATE_LIMIT) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas análises em pouco tempo. Tente novamente em alguns minutos.' }
});

router.use(authMiddleware, exigirPapel('paciente'));

// Questionário
router.get('/categorias', triagemController.listarCategorias);
router.get('/categorias/:idCategoria/perguntas', triagemController.listarPerguntas);

// Análise com IA: recebe descrição + sintomas e devolve especialidades.
router.post('/analisar', limitarIA, iaController.analisar);

// Registro e histórico do próprio paciente
router.post('/', limitarRegistros, triagemController.registrarTriagem);
router.get('/meu-historico', triagemController.obterHistorico);

module.exports = router;
