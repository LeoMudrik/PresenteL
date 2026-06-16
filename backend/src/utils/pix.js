const QRCode = require('qrcode');

function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      else crc = (crc << 1) & 0xFFFF;
    }
  }
  return crc;
}

function field(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

function generatePixPayload({ chave, nome, cidade, valor, descricao = '' }) {
  const sanitize = (str, max) => str.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, max).trim();

  const nomeSanitizado = sanitize(nome, 25);
  const cidadeSanitizada = sanitize(cidade, 15);
  const txid = 'LUCCA' + Date.now().toString().slice(-6);

  let merchantInfo = field('00', 'br.gov.bcb.pix') + field('01', chave);
  if (descricao) merchantInfo += field('02', descricao.substring(0, 72));

  let payload = '';
  payload += field('00', '01');
  payload += field('26', merchantInfo);
  payload += field('52', '0000');
  payload += field('53', '986');
  if (valor && valor > 0) payload += field('54', parseFloat(valor).toFixed(2));
  payload += field('58', 'BR');
  payload += field('59', nomeSanitizado || 'Lucca');
  payload += field('60', cidadeSanitizada || 'SaoPaulo');
  payload += field('62', field('05', txid));
  payload += '6304';

  const crc = crc16(payload);
  payload += crc.toString(16).toUpperCase().padStart(4, '0');

  return payload;
}

async function generateQRCode(pixPayload) {
  try {
    const qr = await QRCode.toDataURL(pixPayload, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      width: 300,
    });
    return qr;
  } catch (err) {
    throw new Error('Erro ao gerar QR Code: ' + err.message);
  }
}

module.exports = { generatePixPayload, generateQRCode };
