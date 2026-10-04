const express = require('express');

const router = express.Router();

const disponibilidadeController = require('../controllers/disponibilidadeController');

router.get('/', disponibilidadeController.getAll);
router.get('/:id', disponibilidadeController.getById);
router.post('/', disponibilidadeController.create);
router.put('/:id', disponibilidadeController.update);
router.delete('/:id', disponibilidadeController.delete);

module.exports = router;