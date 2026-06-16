const db = require('../database');
const ExcelJS = require('exceljs');

exports.dashboard = (req, res) => {
  const totalPresentes = db.prepare('SELECT COUNT(*) as total FROM presentes').get().total;
  const totalArrecadado = db.prepare("SELECT COALESCE(SUM(valor), 0) as total FROM pagamentos WHERE status = 'confirmado'").get().total;
  const totalPendente = db.prepare("SELECT COALESCE(SUM(valor), 0) as total FROM pagamentos WHERE status = 'pendente'").get().total;
  const totalConvidados = db.prepare('SELECT COUNT(DISTINCT usuario) as total FROM pagamentos').get().total;
  const pagamentosConfirmados = db.prepare("SELECT COUNT(*) as total FROM pagamentos WHERE status = 'confirmado'").get().total;
  const pagamentosPendentes = db.prepare("SELECT COUNT(*) as total FROM pagamentos WHERE status = 'pendente'").get().total;

  const presentesMaisEscolhidos = db.prepare(`
    SELECT p.id, p.nome, p.imagem, p.valor,
      COALESCE(SUM(json_extract(item.value, '$.quantidade')), 0) as vezes_escolhido
    FROM presentes p
    LEFT JOIN pagamentos pg ON pg.itens IS NOT NULL
    LEFT JOIN json_each(pg.itens) item ON json_extract(item.value, '$.presente_id') = p.id
    GROUP BY p.id
    ORDER BY vezes_escolhido DESC
    LIMIT 5
  `).all();

  const ultimosPagamentos = db.prepare('SELECT * FROM pagamentos ORDER BY data DESC LIMIT 10').all();

  res.json({
    totalPresentes,
    totalArrecadado,
    totalPendente,
    totalConvidados,
    pagamentosConfirmados,
    pagamentosPendentes,
    presentesMaisEscolhidos,
    ultimosPagamentos: ultimosPagamentos.map(p => ({ ...p, itens: p.itens ? JSON.parse(p.itens) : [] })),
  });
};

exports.exportarExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Lucca Birthday';
    workbook.created = new Date();

    // Aba de Pagamentos
    const wsPag = workbook.addWorksheet('Pagamentos');
    wsPag.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Convidado', key: 'usuario', width: 25 },
      { header: 'Valor (R$)', key: 'valor', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Data', key: 'data', width: 20 },
    ];
    wsPag.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsPag.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };

    const pagamentos = db.prepare('SELECT * FROM pagamentos ORDER BY data DESC').all();
    pagamentos.forEach(p => {
      wsPag.addRow({ ...p, valor: `R$ ${parseFloat(p.valor).toFixed(2)}`, data: new Date(p.data).toLocaleString('pt-BR') });
    });

    // Aba de Presentes
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

    const presentes = db.prepare('SELECT * FROM presentes ORDER BY nome ASC').all();
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
