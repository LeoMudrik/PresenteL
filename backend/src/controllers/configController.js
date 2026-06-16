const db = require('../database');
const path = require('path');
const fs = require('fs');

exports.getConfig = (req, res) => {
  const config = db.prepare('SELECT * FROM configuracoes_festa WHERE id = 1').get();
  res.json(config || {});
};

exports.atualizarFesta = (req, res) => {
  const { local, data, horario, texto_convite } = req.body;
  const config = db.prepare('SELECT * FROM configuracoes_festa WHERE id = 1').get();

  let foto_lucca = config ? config.foto_lucca : '';
  let imagem_fundo = config ? config.imagem_fundo : '';

  if (req.files) {
    if (req.files.foto_lucca) {
      if (foto_lucca) {
        const old = path.join(__dirname, '..', '..', foto_lucca);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      foto_lucca = `/uploads/${req.files.foto_lucca[0].filename}`;
    }
    if (req.files.imagem_fundo) {
      if (imagem_fundo) {
        const old = path.join(__dirname, '..', '..', imagem_fundo);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      imagem_fundo = `/uploads/${req.files.imagem_fundo[0].filename}`;
    }
  }

  db.prepare(`
    UPDATE configuracoes_festa SET
      local = ?, data = ?, horario = ?, texto_convite = ?,
      foto_lucca = ?, imagem_fundo = ?
    WHERE id = 1
  `).run(
    local || config?.local || '',
    data || config?.data || '',
    horario || config?.horario || '',
    texto_convite || config?.texto_convite || '',
    foto_lucca, imagem_fundo
  );

  res.json({ message: 'Configurações da festa atualizadas' });
};

exports.atualizarPix = (req, res) => {
  const { chave_pix, nome_recebedor, cidade_pix, descricao_pix } = req.body;
  if (!chave_pix) return res.status(400).json({ error: 'Chave PIX é obrigatória' });

  db.prepare(`
    UPDATE configuracoes_festa SET
      chave_pix = ?, nome_recebedor = ?, cidade_pix = ?, descricao_pix = ?
    WHERE id = 1
  `).run(chave_pix, nome_recebedor || 'Lucca', cidade_pix || 'SaoPaulo', descricao_pix || 'Presente Lucca');

  res.json({ message: 'Configurações PIX atualizadas' });
};
