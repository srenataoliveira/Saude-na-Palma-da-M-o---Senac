const express = require('express');

const router = express.Router();

const agendamentoController = require('../controllers/agendamentoController');

const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, agendamentoController.listarAgendamentos);

router.get('/:id', authMiddleware, agendamentoController.buscarAgendamento);

router.post('/', authMiddleware, agendamentoController.criarAgendamento);

router.put('/:id', authMiddleware, agendamentoController.atualizarAgendamento);

router.delete('/:id', authMiddleware, agendamentoController.deletarAgendamento);

module.exports = router;