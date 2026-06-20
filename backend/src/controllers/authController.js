const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

exports.login = async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) return res.status(400).json({ error: 'Login e senha são obrigatórios' });

    const { rows } = await pool.query('SELECT * FROM administradores WHERE login = $1', [login]);
    const admin = rows[0];
    if (!admin) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(senha, admin.senha);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: admin.id, nome: admin.nome, login: admin.login },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, admin: { id: admin.id, nome: admin.nome, login: admin.login, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

exports.me = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nome, login, email FROM administradores WHERE id = $1', [req.admin.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Administrador não encontrado' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
};

exports.alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) return res.status(400).json({ error: 'Campos obrigatórios' });
    if (novaSenha.length < 6) return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });

    const { rows } = await pool.query('SELECT senha FROM administradores WHERE id = $1', [req.admin.id]);
    if (!await bcrypt.compare(senhaAtual, rows[0].senha)) return res.status(400).json({ error: 'Senha atual incorreta' });

    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE administradores SET senha = $1 WHERE id = $2', [hash, req.admin.id]);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

exports.atualizarDados = async (req, res) => {
  try {
    const { nome, login, email } = req.body;
    if (!nome || !login) return res.status(400).json({ error: 'Nome e login são obrigatórios' });

    const { rows } = await pool.query('SELECT id FROM administradores WHERE login = $1 AND id != $2', [login, req.admin.id]);
    if (rows.length > 0) return res.status(400).json({ error: 'Login já em uso' });

    await pool.query('UPDATE administradores SET nome = $1, login = $2, email = $3 WHERE id = $4', [nome, login, email, req.admin.id]);
    res.json({ message: 'Dados atualizados com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar dados' });
  }
};

exports.listarAdmins = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nome, login, email, created_at FROM administradores ORDER BY id');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
};

exports.adicionarAdmin = async (req, res) => {
  try {
    const { nome, login, senha, email } = req.body;
    if (!nome || !login || !senha) return res.status(400).json({ error: 'Nome, login e senha são obrigatórios' });

    const { rows } = await pool.query('SELECT id FROM administradores WHERE login = $1', [login]);
    if (rows.length > 0) return res.status(400).json({ error: 'Login já em uso' });

    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO administradores (nome, login, senha, email) VALUES ($1, $2, $3, $4) RETURNING id',
      [nome, login, hash, email]
    );
    res.status(201).json({ message: 'Administrador criado', id: result.rows[0].id });
  } catch {
    res.status(500).json({ error: 'Erro ao criar administrador' });
  }
};

exports.removerAdmin = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.admin.id) return res.status(400).json({ error: 'Não é possível remover sua própria conta' });
    await pool.query('DELETE FROM administradores WHERE id = $1', [req.params.id]);
    res.json({ message: 'Administrador removido' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover' });
  }
};
