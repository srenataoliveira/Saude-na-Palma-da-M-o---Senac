const express = require('express');
const rateLimit = require('express-rate-limit');

const adminSenhaController = require('../controllers/adminSenhaController');
const authMiddleware = require('../middleware/authMiddleware');

const { exigirPapel } = authMiddleware;

const router = express.Router();

const limitarTentativas = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
});

// Todas as rotas deste arquivo exigem sessão de administrador.
router.use(authMiddleware, exigirPapel('admin'));

router.post('/senha-temporaria', limitarTentativas, adminSenhaController.redefinirSenha);

module.exports = router;