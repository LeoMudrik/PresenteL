const express = require('express');
const router = express.Router();
const presentesController = require('../controllers/presentesController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', presentesController.listar);
router.get('/:id', presentesController.buscarPorId);
router.post('/', authMiddleware, upload.single('imagem'), presentesController.criar);
router.put('/:id', authMiddleware, upload.single('imagem'), presentesController.atualizar);
router.delete('/:id', authMiddleware, presentesController.excluir);
router.patch('/:id/estoque', authMiddleware, presentesController.atualizarEstoque);

module.exports = router;
