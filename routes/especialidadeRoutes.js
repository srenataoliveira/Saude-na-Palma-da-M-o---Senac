const express = require('express');

const especialidadeController = require('../controllers/especialidadeController');
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

// Leitura: paciente e profissional
router.get('/', especialidadeController.getAll);
router.get('/:id', especialidadeController.getById);

// Escrita: somente administrador (hoje ninguém tem este papel)
router.post('/', exigirPapel('admin'), especialidadeController.create);
router.put('/:id', exigirPapel('admin'), especialidadeController.update);
router.delete('/:id', exigirPapel('admin'), especialidadeController.delete);

module.exports = router;
