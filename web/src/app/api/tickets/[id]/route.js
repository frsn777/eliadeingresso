import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getTicketById } from '@/lib/storage';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ingresso não encontrado.' }, { status: 404 });
    }

    // Gerar QR Code do Ingresso (contém o ID único do ingresso para leitura na portaria)
    const qrCodeDataUrl = await QRCode.toDataURL(ticket.id, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0a0b10',
        light: '#ffffff'
      }
    });

    return NextResponse.json({
      success: true,
      ticket: {
        ...ticket,
        qrCodeImage: qrCodeDataUrl
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ingresso:', error);
    return NextResponse.json({ error: 'Erro ao buscar ingresso.' }, { status: 500 });
  }
}
