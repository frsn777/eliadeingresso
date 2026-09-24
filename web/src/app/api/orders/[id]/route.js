import { NextResponse } from 'next/server';
import { getOrderById, approveOrder } from '@/lib/storage';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const simulatePayment = url.searchParams.get('simulate') === 'true';

    let order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    // Se for modo de simulação de pagamento aprovado
    if (simulatePayment && order.status === 'pending') {
      order = await approveOrder(id);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Erro ao consultar pedido:', error);
    return NextResponse.json({ error: 'Erro ao consultar pedido.' }, { status: 500 });
  }
}
