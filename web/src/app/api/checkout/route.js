import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { generatePixPayload } from '@/lib/pix';
import { createOrder } from '@/lib/storage';
import { isMercadoPagoConfigured, createMercadoPagoPixPayment } from '@/lib/mercadopago';

// Validação básica de formato de e-mail
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, attendees } = body;

    // 1. Validação de presença e tipos
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nome do comprador é obrigatório e deve ter pelo menos 2 caracteres.' },
        { status: 400 }
      );
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'Um e-mail válido é obrigatório.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(attendees) || attendees.length === 0) {
      return NextResponse.json(
        { error: 'Ao menos 1 participante deve ser informado.' },
        { status: 400 }
      );
    }

    // Limite de segurança por transação (evita sobrecarga ou abuso)
    const MAX_TICKETS_PER_ORDER = 20;
    if (attendees.length > MAX_TICKETS_PER_ORDER) {
      return NextResponse.json(
        { error: `O limite máximo por compra é de ${MAX_TICKETS_PER_ORDER} ingressos.` },
        { status: 400 }
      );
    }

    // Sanitização dos dados
    const sanitizedName = customerName.trim().substring(0, 100);
    const sanitizedEmail = customerEmail.trim().toLowerCase().substring(0, 120);
    const sanitizedPhone = typeof customerPhone === 'string' ? customerPhone.trim().substring(0, 30) : '';
    const sanitizedAttendees = attendees.map((att) =>
      typeof att === 'string' && att.trim() ? att.trim().substring(0, 100) : sanitizedName
    );

    const unitPrice = 10.00;
    const quantity = sanitizedAttendees.length;
    const totalAmount = quantity * unitPrice;
    const defaultTxid = `ELI${Date.now().toString(36).toUpperCase()}`;

    let pixPayload = '';
    let qrCodeDataUrl = '';
    let finalTxid = defaultTxid;
    let paymentGateway = 'manual';

    // 2. Tentar gerar PIX automatizado via Mercado Pago se configurado
    if (isMercadoPagoConfigured()) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
        let notificationUrl = undefined;

        if (appUrl && !appUrl.includes('localhost') && !appUrl.includes('127.0.0.1')) {
          notificationUrl = `${appUrl.replace(/\/$/, '')}/api/webhooks/mercadopago`;
        }

        const mpResult = await createMercadoPagoPixPayment({
          orderId: defaultTxid,
          customerName: sanitizedName,
          customerEmail: sanitizedEmail,
          customerPhone: sanitizedPhone,
          totalAmount,
          description: `Ingressos Eliade 15 Anos (${quantity}x)`,
          notificationUrl
        });

        if (mpResult.success && mpResult.pixCopyPaste) {
          pixPayload = mpResult.pixCopyPaste;
          qrCodeDataUrl = mpResult.qrCodeImage;
          finalTxid = mpResult.paymentId || defaultTxid;
          paymentGateway = 'mercadopago';
        } else {
          console.warn('Mercado Pago retornou erro, usando gerador estático de fallback:', mpResult.error);
        }
      } catch (mpError) {
        console.error('Falha ao comunicar com Mercado Pago, usando fallback:', mpError);
      }
    }

    // 3. Fallback / Modo Manual se Mercado Pago não estiver ativo ou falhar
    if (!pixPayload) {
      const pixKey = process.env.PIX_KEY || 'eliade15anos@gmail.com';
      const pixReceiver = process.env.PIX_RECEIVER_NAME || 'Grupo Musical Eliade';
      const pixCity = process.env.PIX_RECEIVER_CITY || 'Curitiba';

      pixPayload = generatePixPayload({
        key: pixKey,
        name: pixReceiver,
        city: pixCity,
        amount: totalAmount,
        txid: defaultTxid,
        description: `Ingressos Eliade 15 Anos (${quantity}x)`
      });

      qrCodeDataUrl = await QRCode.toDataURL(pixPayload, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0f1117',
          light: '#ffffff'
        }
      });
    }

    // 4. Salvar pedido e ingressos
    const result = await createOrder({
      customerName: sanitizedName,
      customerEmail: sanitizedEmail,
      customerPhone: sanitizedPhone,
      attendees: sanitizedAttendees,
      unitPrice,
      pixCopyPaste: pixPayload,
      paymentTxid: finalTxid
    });

    const pixReceiver = process.env.PIX_RECEIVER_NAME || 'Grupo Musical Eliade';

    return NextResponse.json({
      success: true,
      order: result.order,
      tickets: result.tickets,
      gateway: paymentGateway,
      pix: {
        copyPaste: pixPayload,
        qrCodeImage: qrCodeDataUrl,
        amount: totalAmount,
        txid: finalTxid,
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
