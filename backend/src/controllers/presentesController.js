const { pool } = require('../database');
const path = require('path');
const fs = require('fs');

exports.listar = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM presentes ORDER BY nome ASC');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar presentes' });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM presentes WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Presente não encontrado' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar presente' });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, descricao, valor, quantidade } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    const imagem = req.file ? `/uploads/${req.file.filename}` : '';
    const result = await pool.query(
      'INSERT INTO presentes (nome, descricao, valor, quantidade, imagem) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nome, descricao || '', parseFloat(valor) || 0, parseInt(quantidade) || 1, imagem]
    );
    res.status(201).json({ message: 'Presente criado', id: result.rows[0].id });
  } catch {
    res.status(500).json({ error: 'Erro ao criar presente' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { nome, descricao, valor, quantidade } = req.body;
    const { id } = req.params;

    const { rows } = await pool.query('SELECT * FROM presentes WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Presente não encontrado' });
    const presente = rows[0];

    let imagem = presente.imagem;
    if (req.file) {
      if (imagem) {
        const oldPath = path.join(__dirname, '..', '..', imagem);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagem = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE presentes SET nome = $1, descricao = $2, valor = $3, quantidade = $4, imagem = $5 WHERE id = $6',
      [nome || presente.nome, descricao ?? presente.descricao, parseFloat(valor) ?? presente.valor, parseInt(quantidade) ?? presente.quantidade, imagem, id]
    );
    res.json({ message: 'Presente atualizado' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar presente' });
  }
};

exports.excluir = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM presentes WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Presente não encontrado' });

    if (rows[0].imagem) {
      const imgPath = path.join(__dirname, '..', '..', rows[0].imagem);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await pool.query('DELETE FROM presentes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Presente excluído' });
  } catch {
    res.status(500).json({ error: 'Erro ao excluir presente' });
  }
};

exports.atualizarEstoque = async (req, res) => {
  try {
    const { quantidade } = req.body;
    if (quantidade === undefined) return res.status(400).json({ error: 'Quantidade obrigatória' });
    await pool.query('UPDATE presentes SET quantidade = $1 WHERE id = $2', [parseInt(quantidade), req.params.id]);
    res.json({ message: 'Estoque atualizado' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar estoque' });
  }
};
