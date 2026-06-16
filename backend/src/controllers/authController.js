const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

exports.login = (req, res) => {
  const { login, senha } = req.body;
  if (!login || !senha) return res.status(400).json({ error: 'Login e senha são obrigatórios' });

  const admin = db.prepare('SELECT * FROM administradores WHERE login = ?').get(login);
  if (!admin) return res.status(401).json({ error: 'Credenciais inválidas' });

  const valid = bcrypt.compareSync(senha, admin.senha);
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = jwt.sign(
    { id: admin.id, nome: admin.nome, login: admin.login },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token, admin: { id: admin.id, nome: admin.nome, login: admin.login, email: admin.email } });
};

exports.me = (req, res) => {
  const admin = db.prepare('SELECT id, nome, login, email FROM administradores WHERE id = ?').get(req.admin.id);
  if (!admin) return res.status(404).json({ error: 'Administrador não encontrado' });
  res.json(admin);
};

exports.alterarSenha = (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha) return res.status(400).json({ error: 'Campos obrigatórios' });
  if (novaSenha.length < 6) return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });

  const admin = db.prepare('SELECT * FROM administradores WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(senhaAtual, admin.senha)) return res.status(400).json({ error: 'Senha atual incorreta' });

  const hash = bcrypt.hashSync(novaSenha, 10);
  db.prepare('UPDATE administradores SET senha = ? WHERE id = ?').run(hash, req.admin.id);
  res.json({ message: 'Senha alterada com sucesso' });
};

exports.atualizarDados = (req, res) => {
  const { nome, login, email } = req.body;
  if (!nome || !login) return res.status(400).json({ error: 'Nome e login são obrigatórios' });

  const existing = db.prepare('SELECT id FROM administradores WHERE login = ? AND id != ?').get(login, req.admin.id);
  if (existing) return res.status(400).json({ error: 'Login já em uso' });

  db.prepare('UPDATE administradores SET nome = ?, login = ?, email = ? WHERE id = ?').run(nome, login, email, req.admin.id);
  res.json({ message: 'Dados atualizados com sucesso' });
};

exports.listarAdmins = (req, res) => {
  const admins = db.prepare('SELECT id, nome, login, email, created_at FROM administradores').all();
  res.json(admins);
};

exports.adicionarAdmin = (req, res) => {
  const { nome, login, senha, email } = req.body;
  if (!nome || !login || !senha) return res.status(400).json({ error: 'Nome, login e senha são obrigatórios' });

  const existing = db.prepare('SELECT id FROM administradores WHERE login = ?').get(login);
  if (existing) return res.status(400).json({ error: 'Login já em uso' });

  const hash = bcrypt.hashSync(senha, 10);
  const result = db.prepare('INSERT INTO administradores (nome, login, senha, email) VALUES (?, ?, ?, ?)').run(nome, login, hash, email);
  res.status(201).json({ message: 'Administrador criado com sucesso', id: result.lastInsertRowid });
};

exports.removerAdmin = (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.admin.id) return res.status(400).json({ error: 'Não é possível remover sua própria conta' });
  db.prepare('DELETE FROM administradores WHERE id = ?').run(id);
  res.json({ message: 'Administrador removido' });
};
