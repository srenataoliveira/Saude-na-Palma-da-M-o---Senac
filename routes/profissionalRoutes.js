const express = require('express');

const profissionalController = require('../controllers/profissionalController');
const portalController = require('../controllers/portalProfissionalController');
const authMiddleware = require('../middleware/authMiddleware');
const { UUID_REGEX } = require('../utils/validacao');

const { exigirPapel } = authMiddleware;

const router = express.Router();

router.use(authMiddleware);

router.param('id', (req, res, next, id) => {
  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Identificador inválido' });
  }
  next();
});

// Lista pública (sem CPF, e-mail ou telefone): o paciente escolhe o profissional
router.get('/', profissionalController.listarProfissionais);

// Consulta de horários ocupados por profissional (para pacientes escolherem horários livres)
router.get('/:id/horarios-ocupados', profissionalController.obterHorariosOcupados);

// Portal do profissional: tudo usa o id do token, nunca o da URL.
// Estas rotas precisam vir ANTES das que têm ":id".
router.get('/me', exigirPapel('profissional'), profissionalController.meuPerfil);
router.put('/me', exigirPapel('profissional'), profissionalController.atualizarMeuPerfil);
router.get('/me/agendamentos', exigirPapel('profissional'), portalController.minhaAgenda);
router.get('/me/agendamentos/:id/triagem', exigirPapel('profissional'), portalController.triagemDaConsulta);

// Gestão: somente administrador (hoje ninguém tem este papel)
router.post('/', exigirPapel('admin'), profissionalController.criarProfissional);
router.put('/:id', exigirPapel('admin'), profissionalController.atualizarProfissional);
router.delete('/:id', exigirPapel('admin'), profissionalController.deletarProfissional);

module.exports = router;
