const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS administradores (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      login TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS presentes (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT DEFAULT '',
      valor NUMERIC(10,2) NOT NULL DEFAULT 0,
      quantidade INTEGER NOT NULL DEFAULT 1,
      imagem TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS carrinho (
      id SERIAL PRIMARY KEY,
      usuario TEXT NOT NULL,
      presente_id INTEGER NOT NULL REFERENCES presentes(id),
      quantidade INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pagamentos (
      id SERIAL PRIMARY KEY,
      usuario TEXT NOT NULL,
      valor NUMERIC(10,2) NOT NULL,
      status TEXT DEFAULT 'pendente',
      qr_code TEXT DEFAULT '',
      itens TEXT DEFAULT '[]',
      comprovante TEXT DEFAULT '',
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
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
    )
  `);

  // Admin padrão
  const { rows: admins } = await pool.query("SELECT id FROM administradores WHERE login = 'admin'");
  if (admins.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO administradores (nome, login, senha, email) VALUES ($1, $2, $3, $4)',
      ['Administrador', 'admin', hash, 'admin@lucca.com']
    );
  }

  // Configuração inicial da festa
  const { rows: config } = await pool.query('SELECT id FROM configuracoes_festa WHERE id = 1');
  if (config.length === 0) {
    await pool.query(
      'INSERT INTO configuracoes_festa (id, chave_pix, nome_recebedor) VALUES (1, $1, $2)',
      ['+5531997672188', 'Livia']
    );
  }

  console.log('Banco de dados Postgres inicializado!');
}

module.exports = { pool, initDatabase };
