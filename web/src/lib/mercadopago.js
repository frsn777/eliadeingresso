import { MercadoPagoConfig, Payment } from 'mercadopago';

/**
 * Verifica se o Access Token do Mercado Pago está configurado no ambiente
 */
export function isMercadoPagoConfigured() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  return Boolean(token && token.trim() !== '' && !token.includes('your-access-token'));
}

/**
 * Retorna uma instância configurada do cliente Mercado Pago
 */
function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não está configurado.');
  }

  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 10000
    }
  });
}

/**
 * Cria uma cobrança PIX dinâmica no Mercado Pago
 */
export async function createMercadoPagoPixPayment({
  orderId,
  customerName,
  customerEmail,
  customerPhone = '',
  totalAmount,
  description = 'Ingressos Eliade 15 Anos',
  notificationUrl
}) {
  try {
    const client = getMercadoPagoClient();
    const payment = new Payment(client);

    // Separar primeiro e último nome
    const nameParts = (customerName || '').trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Eliade';

    const body = {
      transaction_amount: Number(Number(totalAmount).toFixed(2)),
      description: description,
      payment_method_id: 'pix',
      external_reference: orderId,
      payer: {
        email: customerEmail,
        first_name: firstName,
        last_name: lastName,
      }
    };

    // Adiciona URL de webhook para notificação se fornecida
    if (notificationUrl) {
      body.notification_url = notificationUrl;
    }

    const response = await payment.create({ body });

    const qrData = response.point_of_interaction?.transaction_data;
    const qrCodeBase64 = qrData?.qr_code_base64
      ? `data:image/png;base64,${qrData.qr_code_base64}`
      : null;

    return {
      success: true,
      paymentId: response.id?.toString(),
      status: response.status,
      pixCopyPaste: qrData?.qr_code || '',
      qrCodeImage: qrCodeBase64,
      ticketUrl: qrData?.ticket_url || null
    };
  } catch (error) {
    console.error('Erro ao criar pagamento PIX no Mercado Pago:', error);
    return {
      success: false,
      error: error.message || 'Erro ao gerar pagamento PIX no Mercado Pago'
    };
  }
}

/**
 * Consulta os detalhes de um pagamento no Mercado Pago pelo ID
 */
export async function getMercadoPagoPayment(paymentId) {
  try {
    const client = getMercadoPagoClient();
    const payment = new Payment(client);

    const response = await payment.get({ id: paymentId });
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error(`Erro ao consultar pagamento ${paymentId} no Mercado Pago:`, error);
    return {
      success: false,
      error: error.message || 'Erro ao consultar pagamento'
    };
  }
}
