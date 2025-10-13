const express = require('express');
const router = express.Router();
const perfilInternetController = require('../controllers/perfilInternetController');

router.get('/', perfilInternetController.getAll);
router.get('/:id', perfilInternetController.getById);
router.post('/', perfilInternetController.create);
router.put('/:id', perfilInternetController.update);
router.delete('/:id', perfilInternetController.delete);

module.exports = router;