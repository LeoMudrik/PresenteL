require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/presentes', require('./routes/presentes'));
app.use('/api/pagamentos', require('./routes/pagamentos'));
app.use('/api/config', require('./routes/config'));
app.use('/api/relatorios', require('./routes/relatorios'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'neon-postgres', message: 'Lucca Birthday API running!' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`\n🎂 Lucca Birthday API rodando em http://localhost:${PORT}`);
      console.log(`🐘 Banco: Neon Postgres`);
      console.log(`📊 Admin padrão: login=admin / senha=admin123\n`);
    });
  } catch (err) {
    console.error('Erro ao inicializar:', err.message);
    process.exit(1);
  }
}

start();
