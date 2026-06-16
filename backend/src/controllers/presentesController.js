const db = require('../database');
const path = require('path');
const fs = require('fs');

exports.listar = (req, res) => {
  const presentes = db.prepare('SELECT * FROM presentes ORDER BY nome ASC').all();
  res.json(presentes);
};

exports.buscarPorId = (req, res) => {
  const presente = db.prepare('SELECT * FROM presentes WHERE id = ?').get(req.params.id);
  if (!presente) return res.status(404).json({ error: 'Presente não encontrado' });
  res.json(presente);
};

exports.criar = (req, res) => {
  const { nome, descricao, valor, quantidade } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

  const imagem = req.file ? `/uploads/${req.file.filename}` : '';
  const result = db.prepare(
    'INSERT INTO presentes (nome, descricao, valor, quantidade, imagem) VALUES (?, ?, ?, ?, ?)'
  ).run(nome, descricao || '', parseFloat(valor) || 0, parseInt(quantidade) || 1, imagem);

  res.status(201).json({ message: 'Presente criado', id: result.lastInsertRowid });
};

exports.atualizar = (req, res) => {
  const { nome, descricao, valor, quantidade } = req.body;
  const { id } = req.params;

  const presente = db.prepare('SELECT * FROM presentes WHERE id = ?').get(id);
  if (!presente) return res.status(404).json({ error: 'Presente não encontrado' });

  let imagem = presente.imagem;
  if (req.file) {
    if (imagem) {
      const oldPath = path.join(__dirname, '..', '..', imagem);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    imagem = `/uploads/${req.file.filename}`;
  }

  db.prepare(
    'UPDATE presentes SET nome = ?, descricao = ?, valor = ?, quantidade = ?, imagem = ? WHERE id = ?'
  ).run(nome || presente.nome, descricao ?? presente.descricao, parseFloat(valor) ?? presente.valor, parseInt(quantidade) ?? presente.quantidade, imagem, id);

  res.json({ message: 'Presente atualizado' });
};

exports.excluir = (req, res) => {
  const presente = db.prepare('SELECT * FROM presentes WHERE id = ?').get(req.params.id);
  if (!presente) return res.status(404).json({ error: 'Presente não encontrado' });

  if (presente.imagem) {
    const imgPath = path.join(__dirname, '..', '..', presente.imagem);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  db.prepare('DELETE FROM presentes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Presente excluído' });
};

exports.atualizarEstoque = (req, res) => {
  const { quantidade } = req.body;
  if (quantidade === undefined) return res.status(400).json({ error: 'Quantidade obrigatória' });

  db.prepare('UPDATE presentes SET quantidade = ? WHERE id = ?').run(parseInt(quantidade), req.params.id);
  res.json({ message: 'Estoque atualizado' });
};
