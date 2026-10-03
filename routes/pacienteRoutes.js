const express = require('express');

const router = express.Router();

const pacienteController = require('../controllers/pacienteControllers');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, pacienteController.listarPacientes);

router.get('/:id', authMiddleware, pacienteController.buscarPaciente);

router.post('/', authMiddleware, pacienteController.criarPaciente);

router.put('/:id', authMiddleware, pacienteController.atualizarPaciente);

router.delete('/:id', authMiddleware, pacienteController.deletarPaciente);

module.exports = router;