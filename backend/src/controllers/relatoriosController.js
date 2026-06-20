const { pool } = require('../database');
const ExcelJS = require('exceljs');

exports.dashboard = async (req, res) => {
  try {
    const [
      { rows: [{ total: totalPresentes }] },
      { rows: [{ total: totalArrecadado }] },
      { rows: [{ total: totalPendente }] },
      { rows: [{ total: totalConvidados }] },
      { rows: [{ total: pagamentosConfirmados }] },
      { rows: [{ total: pagamentosPendentes }] },
      { rows: presentes },
      { rows: pagamentos },
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM presentes'),
      pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM pagamentos WHERE status = 'confirmado'"),
      pool.query("SELECT COALESCE(SUM(valor), 0) as total FROM pagamentos WHERE status IN ('pendente','aguardando_confirmacao')"),
      pool.query('SELECT COUNT(DISTINCT usuario) as total FROM pagamentos'),
      pool.query("SELECT COUNT(*) as total FROM pagamentos WHERE status = 'confirmado'"),
      pool.query("SELECT COUNT(*) as total FROM pagamentos WHERE status IN ('pendente','aguardando_confirmacao')"),
      pool.query('SELECT id, nome, imagem, valor FROM presentes'),
      pool.query("SELECT itens FROM pagamentos WHERE itens IS NOT NULL AND itens != '[]'"),
    ]);

    // Calcula presentes mais escolhidos em JS
    const counts = {};
    pagamentos.forEach(p => {
      try {
        const itens = typeof p.itens === 'string' ? JSON.parse(p.itens) : p.itens;
        if (Array.isArray(itens)) {
          itens.forEach(item => {
            counts[item.presente_id] = (counts[item.presente_id] || 0) + (item.quantidade || 1);
          });
        }
      } catch (_) {}
    });

    const presentesMaisEscolhidos = presentes
      .map(p => ({ ...p, vezes_escolhido: counts[p.id] || 0 }))
      .sort((a, b) => b.vezes_escolhido - a.vezes_escolhido)
      .slice(0, 5);

    const { rows: ultimosPagamentos } = await pool.query('SELECT * FROM pagamentos ORDER BY data DESC LIMIT 10');

    res.json({
      totalPresentes: parseInt(totalPresentes),
      totalArrecadado: parseFloat(totalArrecadado),
      totalPendente: parseFloat(totalPendente),
      totalConvidados: parseInt(totalConvidados),
      pagamentosConfirmados: parseInt(pagamentosConfirmados),
      pagamentosPendentes: parseInt(pagamentosPendentes),
      presentesMaisEscolhidos,
      ultimosPagamentos: ultimosPagamentos.map(p => ({ ...p, itens: p.itens ? JSON.parse(p.itens) : [] })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
};

exports.exportarExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Lucca Birthday';

    const wsPag = workbook.addWorksheet('Pagamentos');
    wsPag.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Convidado', key: 'usuario', width: 25 },
      { header: 'Valor (R$)', key: 'valor', width: 15 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Comprovante', key: 'comprovante', width: 30 },
      { header: 'Data', key: 'data', width: 20 },
    ];
    wsPag.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsPag.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };

    const { rows: pagamentos } = await pool.query('SELECT * FROM pagamentos ORDER BY data DESC');
    pagamentos.forEach(p => {
      wsPag.addRow({
        ...p,
        valor: `R$ ${parseFloat(p.valor).toFixed(2)}`,
        data: new Date(p.data).toLocaleString('pt-BR'),
      });
    });

    const wsPresentes = workbook.addWorksheet('Presentes');
    wsPresentes.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nome', key: 'nome', width: 30 },
      { header: 'Descrição', key: 'descricao', width: 40 },
      { header: 'Valor (R$)', key: 'valor', width: 15 },
      { header: 'Estoque', key: 'quantidade', width: 12 },
    ];
    wsPresentes.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsPresentes.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEC4899' } };

    const { rows: presentes } = await pool.query('SELECT * FROM presentes ORDER BY nome');
    presentes.forEach(p => {
      wsPresentes.addRow({ ...p, valor: `R$ ${parseFloat(p.valor).toFixed(2)}` });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_lucca_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};
