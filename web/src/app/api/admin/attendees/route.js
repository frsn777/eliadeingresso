import { NextResponse } from 'next/server';
import { getAllTickets, scanTicket } from '@/lib/storage';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const password = request.headers.get('x-admin-password') || url.searchParams.get('password');
    const expectedPassword = process.env.ADMIN_SCANNER_PASSWORD || 'eliade15anos';

    if (password !== expectedPassword) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const tickets = await getAllTickets();

    return NextResponse.json({
      success: true,
      total: tickets.length,
      usedCount: tickets.filter((t) => t.status === 'used').length,
      validCount: tickets.filter((t) => t.status === 'valid').length,
      tickets
    });
  } catch (error) {
    console.error('Erro ao buscar lista de participantes:', error);
    return NextResponse.json({ error: 'Erro ao buscar lista.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ticketId, password, scannedBy = 'Portaria Manual' } = body;
    const expectedPassword = process.env.ADMIN_SCANNER_PASSWORD || 'eliade15anos';

    if (password !== expectedPassword) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    if (!ticketId) {
      return NextResponse.json({ error: 'ID do ingresso obrigatório.' }, { status: 400 });
    }

    const result = await scanTicket(ticketId, scannedBy);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao dar entrada manual:', error);
    return NextResponse.json({ error: 'Erro ao dar entrada manual.' }, { status: 500 });
  }
}
