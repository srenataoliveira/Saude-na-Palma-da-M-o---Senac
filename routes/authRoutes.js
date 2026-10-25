const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');

const router = express.Router();

const limitarTentativas = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
});

router.post('/cadastro', limitarTentativas, authController.cadastrar);
router.post('/login', limitarTentativas, authController.login);
router.post('/profissional/login', limitarTentativas, authController.loginProfissional);
router.post('/admin/login', limitarTentativas, authController.loginAdmin);

module.exports = router;
