const db = require('../database');
const { generatePixPayload, generateQRCode } = require('../utils/pix');

exports.registrarPagamento = async (req, res) => {
  try {
    const { usuario, valor, itens } = req.body;
    if (!usuario || !valor || !itens) return res.status(400).json({ error: 'Dados incompletos' });

    const config = db.prepare('SELECT * FROM configuracoes_festa WHERE id = 1').get();
    let qrCodeData = '';
    let pixPayload = '';

    if (config && config.chave_pix) {
      pixPayload = generatePixPayload({
        chave: config.chave_pix,
        nome: config.nome_recebedor || 'Lucca',
        cidade: config.cidade_pix || 'SaoPaulo',
        valor: parseFloat(valor),
        descricao: config.descricao_pix || 'Presente Lucca',
      });
      qrCodeData = await generateQRCode(pixPayload);
    }

    const itensStr = typeof itens === 'string' ? itens : JSON.stringify(itens);
    const result = db.prepare(
      'INSERT INTO pagamentos (usuario, valor, status, qr_code, itens) VALUES (?, ?, ?, ?, ?)'
    ).run(usuario, parseFloat(valor), 'pendente', pixPayload, itensStr);

    // Atualizar estoque
    const itensArr = typeof itens === 'string' ? JSON.parse(itens) : itens;
    itensArr.forEach(item => {
      db.prepare('UPDATE presentes SET quantidade = MAX(0, quantidade - ?) WHERE id = ?').run(item.quantidade, item.presente_id);
    });

    res.status(201).json({
      id: result.lastInsertRowid,
      qrCode: qrCodeData,
      pixPayload,
      message: 'Pagamento registrado com sucesso',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
};

exports.listar = (req, res) => {
  const pagamentos = db.prepare('SELECT * FROM pagamentos ORDER BY data DESC').all();
  res.json(pagamentos.map(p => ({ ...p, itens: p.itens ? JSON.parse(p.itens) : [] })));
};

exports.atualizarStatus = (req, res) => {
  const { status } = req.body;
  const validStatus = ['pendente', 'aguardando_confirmacao', 'confirmado', 'cancelado'];
  if (!validStatus.includes(status)) return res.status(400).json({ error: 'Status inválido' });

  db.prepare('UPDATE pagamentos SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Status atualizado' });
};

exports.uploadComprovante = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

  const { id } = req.params;
  const pagamento = db.prepare('SELECT id FROM pagamentos WHERE id = ?').get(id);
  if (!pagamento) return res.status(404).json({ error: 'Pagamento não encontrado' });

  const comprovante = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE pagamentos SET comprovante = ?, status = ? WHERE id = ?').run(comprovante, 'aguardando_confirmacao', id);

  res.json({ message: 'Comprovante enviado com sucesso!', comprovante });
};

exports.gerarPixAvulso = async (req, res) => {
  try {
    const { valor } = req.body;
    const config = db.prepare('SELECT * FROM configuracoes_festa WHERE id = 1').get();
    if (!config || !config.chave_pix) return res.status(400).json({ error: 'Chave PIX não configurada' });

    const pixPayload = generatePixPayload({
      chave: config.chave_pix,
      nome: config.nome_recebedor || 'Lucca',
      cidade: config.cidade_pix || 'SaoPaulo',
      valor: parseFloat(valor) || 0,
      descricao: config.descricao_pix || 'Presente Lucca',
    });
    const qrCode = await generateQRCode(pixPayload);

    res.json({ qrCode, pixPayload, chavePix: config.chave_pix });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
};
