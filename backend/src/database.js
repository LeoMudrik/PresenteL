const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lucca.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS administradores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      login TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS presentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      valor REAL NOT NULL DEFAULT 0,
      quantidade INTEGER NOT NULL DEFAULT 1,
      imagem TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS carrinho (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL,
      presente_id INTEGER NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (presente_id) REFERENCES presentes(id)
    );

    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL,
      valor REAL NOT NULL,
      status TEXT DEFAULT 'pendente',
      qr_code TEXT,
      itens TEXT,
      data DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS configuracoes_festa (
      id INTEGER PRIMARY KEY DEFAULT 1,
      local TEXT DEFAULT 'A definir',
      data TEXT DEFAULT '',
      horario TEXT DEFAULT '',
      texto_convite TEXT DEFAULT 'Venha celebrar comigo!',
      foto_lucca TEXT DEFAULT '',
      imagem_fundo TEXT DEFAULT '',
      chave_pix TEXT DEFAULT '',
      nome_recebedor TEXT DEFAULT 'Lucca',
      cidade_pix TEXT DEFAULT 'SaoPaulo',
      descricao_pix TEXT DEFAULT 'Presente Lucca'
    );
  `);

  const admin = db.prepare('SELECT id FROM administradores WHERE login = ?').get('admin');
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO administradores (nome, login, senha, email) VALUES (?, ?, ?, ?)').run('Administrador', 'admin', hash, 'admin@lucca.com');
  }

  const config = db.prepare('SELECT id FROM configuracoes_festa WHERE id = 1').get();
  if (!config) {
    db.prepare('INSERT INTO configuracoes_festa (id) VALUES (1)').run();
  }

  // Migrações incrementais (colunas novas)
  try { db.exec('ALTER TABLE pagamentos ADD COLUMN comprovante TEXT DEFAULT ""'); } catch (_) {}

  console.log('Banco de dados inicializado!');
}

initDatabase();

module.exports = db;
