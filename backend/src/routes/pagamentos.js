const express = require('express');
const router = express.Router();
const pagamentosController = require('../controllers/pagamentosController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', pagamentosController.registrarPagamento);
router.post('/:id/comprovante', upload.single('comprovante'), pagamentosController.uploadComprovante);
router.get('/', authMiddleware, pagamentosController.listar);
router.patch('/:id/status', authMiddleware, pagamentosController.atualizarStatus);

module.exports = router;
