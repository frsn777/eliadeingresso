import { NextResponse } from 'next/server';
import { scanTicket, getTicketById } from '@/lib/storage';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ticketId, password, scannedBy = 'Portaria' } = body;

    const expectedPassword = process.env.ADMIN_SCANNER_PASSWORD || 'eliade15anos';

    if (password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Senha de portaria incorreta.' },
        { status: 401 }
      );
    }

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ID do ingresso não informado.' },
        { status: 400 }
      );
    }

    // Processa a validação
    const result = await scanTicket(ticketId, scannedBy);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na validação do ingresso:', error);
    return NextResponse.json(
      { error: 'Erro interno ao validar ingresso.' },
      { status: 500 }
    );
  }
}
