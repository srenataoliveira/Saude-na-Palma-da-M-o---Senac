const express = require('express');

const router = express.Router();

const especialidadeController = require('../controllers/especialidadeController');

router.get('/', especialidadeController.getAll);

router.get('/:id', especialidadeController.getById);

router.post('/', especialidadeController.create);

router.put('/:id', especialidadeController.update);

router.delete('/:id', especialidadeController.delete);

module.exports = router;