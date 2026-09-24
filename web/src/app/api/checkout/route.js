import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { generatePixPayload } from '@/lib/pix';
import { createOrder } from '@/lib/storage';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, attendees } = body;

    if (!customerName || !customerEmail || !attendees || attendees.length === 0) {
      return NextResponse.json(
        { error: 'Nome, e-mail e ao menos 1 participante são obrigatórios.' },
        { status: 400 }
      );
    }

    const unitPrice = 10.00;
    const quantity = attendees.length;
    const totalAmount = quantity * unitPrice;
    const txid = `ELI${Date.now().toString(36).toUpperCase()}`;

    // Configurações do PIX
    const pixKey = process.env.PIX_KEY || 'eliade15anos@gmail.com';
    const pixReceiver = process.env.PIX_RECEIVER_NAME || 'Grupo Musical Eliade';
    const pixCity = process.env.PIX_RECEIVER_CITY || 'Curitiba';

    // Gerar Payload do PIX no padrão do Banco Central (EMV / BR Code)
    const pixPayload = generatePixPayload({
      key: pixKey,
      name: pixReceiver,
      city: pixCity,
      amount: totalAmount,
      txid: txid,
      description: `Ingressos Eliade 15 Anos (${quantity}x)`
    });

    // Gerar Imagem do QR Code em Base64
    const qrCodeDataUrl = await QRCode.toDataURL(pixPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f1117',
        light: '#ffffff'
      }
    });

    // Salvar pedido e ingressos no banco de dados
    const result = await createOrder({
      customerName,
      customerEmail,
      customerPhone,
      attendees,
      unitPrice,
      pixCopyPaste: pixPayload,
      paymentTxid: txid
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      tickets: result.tickets,
      pix: {
        copyPaste: pixPayload,
        qrCodeImage: qrCodeDataUrl,
        amount: totalAmount,
        txid: txid,
        receiver: pixReceiver
      }
    });
  } catch (error) {
    console.error('Erro na rota de checkout:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar pedido de ingressos.' },
      { status: 500 }
    );
  }
}
