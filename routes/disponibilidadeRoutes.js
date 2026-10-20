const express = require('express');

const disponibilidadeController = require('../controllers/disponibilidadeController');
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

// Leitura: paciente (para agendar) e profissional
router.get('/', disponibilidadeController.getAll);

// Portal do profissional: somente as próprias janelas
router.get('/me', exigirPapel('profissional'), disponibilidadeController.getMinhas);
router.post('/', exigirPapel('profissional'), disponibilidadeController.create);
router.put('/:id', exigirPapel('profissional'), disponibilidadeController.update);
router.delete('/:id', exigirPapel('profissional'), disponibilidadeController.delete);

module.exports = router;
