const express = require('express');
const router = express.Router();
const pagamentosController = require('../controllers/pagamentosController');
const authMiddleware = require('../middleware/auth');

router.post('/', pagamentosController.registrarPagamento);
router.post('/pix', pagamentosController.gerarPixAvulso);
router.get('/', authMiddleware, pagamentosController.listar);
router.patch('/:id/status', authMiddleware, pagamentosController.atualizarStatus);

module.exports = router;
