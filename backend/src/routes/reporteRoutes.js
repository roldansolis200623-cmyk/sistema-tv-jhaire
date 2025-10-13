const express = require('express');
const router = express.Router();
const reporteExcelController = require('../controllers/reporteExcelController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/exportar-excel', reporteExcelController.exportarExcel);

module.exports = router;
