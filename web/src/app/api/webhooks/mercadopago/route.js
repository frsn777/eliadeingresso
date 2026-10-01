import { NextResponse } from 'next/server';
import { getMercadoPagoPayment } from '@/lib/mercadopago';
import { getOrderById, getOrderByPaymentTxid, approveOrder } from '@/lib/storage';

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Obter dados do corpo da requisição ou dos parâmetros de query
    let paymentId = searchParams.get('data.id') || searchParams.get('id');
    let topic = searchParams.get('type') || searchParams.get('topic');

    try {
      const body = await request.json();
      if (body) {
        paymentId = body.data?.id || body.id || paymentId;
        topic = body.type || body.topic || topic;
      }
    } catch {
      // Corpo vazio ou formato diferente, prossegue com query params
    }

    console.log(`[Webhook Mercado Pago] Notificação recebida: Topic=${topic}, PaymentID=${paymentId}`);

    if (!paymentId) {
      return NextResponse.json({ received: true, message: 'Nenhum paymentId encontrado' }, { status: 200 });
    }

    // Consulta os dados reais e atualizados do pagamento na API do Mercado Pago
    const mpResult = await getMercadoPagoPayment(paymentId);

    if (!mpResult.success || !mpResult.data) {
      console.warn(`[Webhook Mercado Pago] Pagamento ${paymentId} não pôde ser consultado:`, mpResult.error);
      return NextResponse.json({ received: true, error: mpResult.error }, { status: 200 });
    }

    const payment = mpResult.data;
    const status = payment.status;
    const externalReference = payment.external_reference;

    console.log(`[Webhook Mercado Pago] Status do Pagamento ${paymentId}: ${status}, ExternalRef: ${externalReference}`);

    // Se o pagamento foi aprovado
    if (status === 'approved') {
      // 1. Tentar encontrar o pedido por externalReference (ID do pedido ou TXID)
      let order = externalReference ? await getOrderById(externalReference) : null;

      // 2. Se não encontrou, buscar por payment_txid
      if (!order && externalReference) {
        order = await getOrderByPaymentTxid(externalReference);
      }

      // 3. Se ainda não encontrou, buscar pelo ID do pagamento do Mercado Pago
      if (!order) {
        order = await getOrderByPaymentTxid(paymentId.toString());
      }

      if (order) {
        if (order.status !== 'approved') {
          await approveOrder(order.id);
          console.log(`[Webhook Mercado Pago] Pedido ${order.id} APROVADO com sucesso via Webhook!`);
        } else {
          console.log(`[Webhook Mercado Pago] Pedido ${order.id} já estava aprovado.`);
        }
      } else {
        console.warn(`[Webhook Mercado Pago] Nenhum pedido local associado ao pagamento ${paymentId} / Ref: ${externalReference}`);
      }
    }

    // Retornar 200 OK para o Mercado Pago confirmar o recebimento
    return NextResponse.json({
      received: true,
      paymentId,
      status: payment.status
    }, { status: 200 });

  } catch (error) {
    console.error('[Webhook Mercado Pago] Erro interno:', error);
    // Sempre responder 200 para evitar reenvio contínuo em caso de erros não críticos
    return NextResponse.json({ received: true, error: error.message }, { status: 200 });
  }
}

export async function GET(request) {
  // Resposta para validações automáticas do Mercado Pago
  return NextResponse.json({ status: 'Webhook endpoint online' }, { status: 200 });
}
