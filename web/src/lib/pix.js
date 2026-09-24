/**
 * Gerador de Payload PIX Padrão EMV (BR Code - Banco Central do Brasil)
 * Permite gerar códigos Copia e Cola válidos para qualquer chave PIX
 */

function formatField(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

function calculateCRC16(payload) {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Cria payload PIX Estático (Manual)
 * @param {Object} params
 * @param {string} params.key - Chave PIX (CPF, CNPJ, E-mail, Celular ou Aleatória)
 * @param {string} params.name - Nome do Recebedor (máx 25 chars)
 * @param {string} params.city - Cidade do Recebedor (máx 15 chars)
 * @param {number} params.amount - Valor em Reais (ex: 10.00)
 * @param {string} [params.txid] - Identificador único da transação (máx 25 chars)
 * @param {string} [params.description] - Descrição opcional
 */
export function generatePixPayload({
  key,
  name = 'ELIADE 15 ANOS',
  city = 'CURITIBA',
  amount,
  txid = '***',
  description = 'Ingresso 15 Anos Eliade'
}) {
  const cleanKey = key.trim();
  const cleanName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25).toUpperCase();
  const cleanCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15).toUpperCase();
  const cleanTxid = (txid || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***';
  const formattedAmount = amount ? Number(amount).toFixed(2) : undefined;

  // 00: Payload Format Indicator
  let payload = formatField('00', '01');

  // 26: Merchant Account Information
  let merchantInfo = formatField('00', 'BR.GOV.BCB.PIX');
  merchantInfo += formatField('01', cleanKey);
  if (description) {
    const cleanDesc = description.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 40);
    merchantInfo += formatField('02', cleanDesc);
  }
  payload += formatField('26', merchantInfo);

  // 52: Merchant Category Code (0000 = Geral)
  payload += formatField('52', '0000');

  // 53: Transaction Currency (986 = BRL)
  payload += formatField('53', '986');

  // 54: Transaction Amount
  if (formattedAmount) {
    payload += formatField('54', formattedAmount);
  }

  // 58: Country Code
  payload += formatField('58', 'BR');

  // 59: Merchant Name
  payload += formatField('59', cleanName);

  // 60: Merchant City
  payload += formatField('60', cleanCity);

  // 62: Additional Data Field (TxID)
  const additionalData = formatField('05', cleanTxid);
  payload += formatField('62', additionalData);

  // 63: CRC16 Checksum
  payload += '6304';
  const checksum = calculateCRC16(payload);

  return `${payload}${checksum}`;
}
