const express = require('express');

const agendamentoController = require('../controllers/agendamentoController');
const authMiddleware = require('../middleware/authMiddleware');
const { UUID_REGEX } = require('../utils/validacao');

const { exigirPapel } = authMiddleware;

const router = express.Router();

router.use(authMiddleware, exigirPapel('paciente'));

router.param('id', (req, res, next, id) => {
  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Identificador inválido' });
  }
  next();
});

router.get('/', agendamentoController.listarAgendamentos);
router.get('/:id', agendamentoController.buscarAgendamento);
router.post('/', agendamentoController.criarAgendamento);
router.patch('/:id/cancelar', agendamentoController.cancelarAgendamento);

module.exports = router;
