const express = require('express');

const pacienteController = require('../controllers/pacienteControllers');
const authMiddleware = require('../middleware/authMiddleware');

const { exigirPapel } = authMiddleware;

const router = express.Router();

router.use(authMiddleware, exigirPapel('paciente'));

// O paciente só acessa os próprios dados; o id vem do token.
router.get('/me', pacienteController.meusDados);
router.put('/me', pacienteController.atualizarMeusDados);

module.exports = router;
