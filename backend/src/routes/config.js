const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', configController.getConfig);
router.put('/festa', authMiddleware, upload.fields([
  { name: 'foto_lucca', maxCount: 1 },
  { name: 'imagem_fundo', maxCount: 1 },
]), configController.atualizarFesta);
router.put('/pix', authMiddleware, configController.atualizarPix);

module.exports = router;
