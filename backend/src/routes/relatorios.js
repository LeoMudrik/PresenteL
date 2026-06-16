const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');
const authMiddleware = require('../middleware/auth');

router.get('/dashboard', authMiddleware, relatoriosController.dashboard);
router.get('/exportar', authMiddleware, relatoriosController.exportarExcel);

module.exports = router;
