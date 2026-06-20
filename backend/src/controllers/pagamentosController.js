const { pool } = require('../database');

exports.registrarPagamento = async (req, res) => {
  try {
    const { usuario, valor, itens } = req.body;
    if (!usuario || !valor || !itens) return res.status(400).json({ error: 'Dados incompletos' });

    const itensStr = typeof itens === 'string' ? itens : JSON.stringify(itens);
    const result = await pool.query(
      'INSERT INTO pagamentos (usuario, valor, status, itens) VALUES ($1, $2, $3, $4) RETURNING id',
      [usuario, parseFloat(valor), 'pendente', itensStr]
    );

    // Atualizar estoque
    const itensArr = typeof itens === 'string' ? JSON.parse(itens) : itens;
    for (const item of itensArr) {
      await pool.query(
        'UPDATE presentes SET quantidade = GREATEST(0, quantidade - $1) WHERE id = $2',
        [item.quantidade, item.presente_id]
      );
    }

    res.status(201).json({
      id: result.rows[0].id,
      message: 'Pagamento registrado com sucesso',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
};

exports.uploadComprovante = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const { rows } = await pool.query('SELECT id FROM pagamentos WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Pagamento não encontrado' });

    const comprovante = `/uploads/${req.file.filename}`;
    await pool.query(
      'UPDATE pagamentos SET comprovante = $1, status = $2 WHERE id = $3',
      [comprovante, 'aguardando_confirmacao', req.params.id]
    );
    res.json({ message: 'Comprovante enviado com sucesso!', comprovante });
  } catch {
    res.status(500).json({ error: 'Erro ao enviar comprovante' });
  }
};

exports.listar = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pagamentos ORDER BY data DESC');
    res.json(rows.map(p => ({ ...p, itens: p.itens ? JSON.parse(p.itens) : [] })));
  } catch {
    res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
};

exports.atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ['pendente', 'aguardando_confirmacao', 'confirmado', 'cancelado'];
    if (!validStatus.includes(status)) return res.status(400).json({ error: 'Status inválido' });

    await pool.query('UPDATE pagamentos SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Status atualizado' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};
