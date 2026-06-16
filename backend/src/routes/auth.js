const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/senha', authMiddleware, authController.alterarSenha);
router.put('/dados', authMiddleware, authController.atualizarDados);
router.get('/admins', authMiddleware, authController.listarAdmins);
router.post('/admins', authMiddleware, authController.adicionarAdmin);
router.delete('/admins/:id', authMiddleware, authController.removerAdmin);

module.exports = router;
