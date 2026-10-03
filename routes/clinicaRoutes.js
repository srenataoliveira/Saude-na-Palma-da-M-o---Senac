const express = require('express');
const router = express.Router();

const clinicaController = require('../controllers/clinicaController');

router.get('/', clinicaController.getAll);
router.get('/:id', clinicaController.getById);
router.post('/', clinicaController.create);
router.put('/:id', clinicaController.update);
router.delete('/:id', clinicaController.delete);

module.exports = router;