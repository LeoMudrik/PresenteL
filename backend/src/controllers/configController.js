const { pool } = require('../database');
const path = require('path');
const fs = require('fs');

exports.getConfig = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM configuracoes_festa WHERE id = 1');
    res.json(rows[0] || {});
  } catch {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
};

exports.atualizarFesta = async (req, res) => {
  try {
    const { local, data, horario, texto_convite } = req.body;
    const { rows } = await pool.query('SELECT * FROM configuracoes_festa WHERE id = 1');
    const config = rows[0] || {};

    let foto_lucca = config.foto_lucca || '';
    let imagem_fundo = config.imagem_fundo || '';

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

    await pool.query(`
      UPDATE configuracoes_festa SET
        local = $1, data = $2, horario = $3, texto_convite = $4,
        foto_lucca = $5, imagem_fundo = $6
      WHERE id = 1
    `, [
      local || config.local || '',
      data || config.data || '',
      horario || config.horario || '',
      texto_convite || config.texto_convite || '',
      foto_lucca,
      imagem_fundo,
    ]);

    res.json({ message: 'Configurações da festa atualizadas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};

exports.atualizarPix = async (req, res) => {
  try {
    const { chave_pix, nome_recebedor, cidade_pix, descricao_pix } = req.body;
    if (!chave_pix) return res.status(400).json({ error: 'Chave PIX é obrigatória' });

    await pool.query(`
      UPDATE configuracoes_festa SET
        chave_pix = $1, nome_recebedor = $2, cidade_pix = $3, descricao_pix = $4
      WHERE id = 1
    `, [chave_pix, nome_recebedor || 'Livia', cidade_pix || 'SaoPaulo', descricao_pix || 'Presente Lucca']);

    res.json({ message: 'Configurações PIX atualizadas' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar PIX' });
  }
};
