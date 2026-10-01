import { NextResponse } from 'next/server';
import { getOrderById, approveOrder } from '@/lib/storage';
import { isMercadoPagoConfigured, getMercadoPagoPayment } from '@/lib/mercadopago';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const simulatePayment = url.searchParams.get('simulate') === 'true';

    let order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    // SEGURANÇA: Permitir simulação manual EXCLUSIVAMENTE em ambiente de desenvolvimento local
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment && simulatePayment && order.status === 'pending') {
      order = await approveOrder(id);
    }

    // Verificação ativa de segurança no Mercado Pago caso o pedido ainda conste como pendente
    if (order.status === 'pending' && isMercadoPagoConfigured() && order.payment_txid) {
      // Se o payment_txid for numérico (ID de pagamento gerado pelo Mercado Pago)
      if (/^\d+$/.test(order.payment_txid)) {
        try {
          const mpCheck = await getMercadoPagoPayment(order.payment_txid);
          if (mpCheck.success && mpCheck.data?.status === 'approved') {
            order = await approveOrder(id);
          }
        } catch (mpErr) {
          console.warn('Erro ao consultar status direto no Mercado Pago:', mpErr);
        }
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Erro ao consultar pedido:', error);
    return NextResponse.json({ error: 'Erro ao consultar pedido.' }, { status: 500 });
  }
}
