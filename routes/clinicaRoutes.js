const express = require('express');

const clinicaController = require('../controllers/clinicaController');
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
router.get('/', clinicaController.getAll);
router.get('/:id', clinicaController.getById);

// Escrita: somente administrador (hoje ninguém tem este papel)
router.post('/', exigirPapel('admin'), clinicaController.create);
router.put('/:id', exigirPapel('admin'), clinicaController.update);
router.delete('/:id', exigirPapel('admin'), clinicaController.delete);

module.exports = router;
