import { supabase, supabaseAdmin } from './supabase';
import { randomUUID } from 'crypto';

// Armazenamento em memória para desenvolvimento local / fallback sem Supabase configurado
const globalStore = globalThis.__eliade_store || {
  orders: new Map(),
  tickets: new Map()
};
if (process.env.NODE_ENV !== 'production') {
  globalThis.__eliade_store = globalStore;
}

/**
 * Cria um novo pedido com os ingressos
 */
export async function createOrder({
  customerName,
  customerEmail,
  customerPhone,
  attendees = [],
  unitPrice = 10,
  pixCopyPaste = '',
  paymentTxid = ''
}) {
  const quantity = attendees.length || 1;
  const totalAmount = quantity * unitPrice;
  const orderId = randomUUID();

  const orderData = {
    id: orderId,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone || '',
    quantity,
    unit_price: unitPrice,
    total_amount: totalAmount,
    status: 'pending',
    payment_method: 'pix',
    payment_txid: paymentTxid,
    pix_copy_paste: pixCopyPaste,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Se Supabase estiver conectado
  if (supabaseAdmin) {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao salvar pedido no Supabase:', orderError);
    } else {
      // Cria registros de ingressos
      const ticketsData = attendees.map((name, index) => ({
        id: randomUUID(),
        order_id: order.id,
        ticket_code: `ELI-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${index + 1}`,
        attendee_name: name || customerName,
        status: 'valid',
        created_at: new Date().toISOString()
      }));

      const { data: tickets, error: ticketError } = await supabaseAdmin
        .from('tickets')
        .insert(ticketsData)
        .select();

      if (ticketError) {
        console.error('Erro ao salvar ingressos no Supabase:', ticketError);
      }

      return { order, tickets: tickets || ticketsData };
    }
  }

  // Fallback Local / Em Memória
  const ticketsList = attendees.map((name, index) => {
    const ticketId = randomUUID();
    const ticket = {
      id: ticketId,
      order_id: orderId,
      ticket_code: `ELI-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${index + 1}`,
      attendee_name: name || customerName,
      status: 'valid',
      used_at: null,
      scanned_by: null,
      created_at: new Date().toISOString()
    };
    globalStore.tickets.set(ticketId, ticket);
    return ticket;
  });

  globalStore.orders.set(orderId, { ...orderData, tickets: ticketsList });

  return {
    order: orderData,
    tickets: ticketsList
  };
}

/**
 * Busca pedido pelo ID
 */
export async function getOrderById(orderId) {
  if (supabaseAdmin) {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, tickets(*)')
      .eq('id', orderId)
      .single();

    if (order) return order;
  }

  return globalStore.orders.get(orderId) || null;
}

/**
 * Aprova o pedido (chamado após confirmação do PIX)
 */
export async function approveOrder(orderId) {
  const now = new Date().toISOString();

  if (supabaseAdmin) {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({ status: 'approved', updated_at: now })
      .eq('id', orderId)
      .select('*, tickets(*)')
      .single();

    if (!error && order) return order;
  }

  const localOrder = globalStore.orders.get(orderId);
  if (localOrder) {
    localOrder.status = 'approved';
    localOrder.updated_at = now;
    globalStore.orders.set(orderId, localOrder);
    return localOrder;
  }

  return null;
}

/**
 * Busca um ingresso individual pelo ID do QR Code
 */
export async function getTicketById(ticketId) {
  if (supabaseAdmin) {
    const { data: ticket } = await supabaseAdmin
      .from('tickets')
      .select('*, orders(customer_name, customer_email, status)')
      .eq('id', ticketId)
      .single();

    if (ticket) return ticket;
  }

  const localTicket = globalStore.tickets.get(ticketId);
  if (localTicket) {
    const localOrder = globalStore.orders.get(localTicket.order_id);
    return {
      ...localTicket,
      orders: localOrder ? {
        customer_name: localOrder.customer_name,
        customer_email: localOrder.customer_email,
        status: localOrder.status
      } : null
    };
  }

  return null;
}

/**
 * Valida o ingresso na portaria (Scan de QR Code)
 */
export async function scanTicket(ticketId, scannedBy = 'Portaria Principal') {
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    return {
      success: false,
      reason: 'NOT_FOUND',
      message: 'Ingresso não encontrado ou inválido.'
    };
  }

  // Verifica se o ingresso já foi utilizado
  if (ticket.status === 'used') {
    return {
      success: false,
      reason: 'ALREADY_USED',
      message: 'Este ingresso já foi utilizado anteriormente!',
      ticket: {
        id: ticket.id,
        attendee_name: ticket.attendee_name,
        ticket_code: ticket.ticket_code,
        used_at: ticket.used_at,
        scanned_by: ticket.scanned_by
      }
    };
  }

  if (ticket.status === 'cancelled') {
    return {
      success: false,
      reason: 'CANCELLED',
      message: 'Este ingresso foi cancelado.'
    };
  }

  // Atualiza para 'used'
  const usedAt = new Date().toISOString();

  if (supabaseAdmin) {
    const { data: updatedTicket, error } = await supabaseAdmin
      .from('tickets')
      .update({
        status: 'used',
        used_at: usedAt,
        scanned_by: scannedBy
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (!error && updatedTicket) {
      return {
        success: true,
        reason: 'VALID',
        message: 'Entrada liberada com sucesso!',
        ticket: updatedTicket
      };
    }
  }

  // Fallback Local
  const localTicket = globalStore.tickets.get(ticketId);
  if (localTicket) {
    localTicket.status = 'used';
    localTicket.used_at = usedAt;
    localTicket.scanned_by = scannedBy;
    globalStore.tickets.set(ticketId, localTicket);

    return {
      success: true,
      reason: 'VALID',
      message: 'Entrada liberada com sucesso!',
      ticket: localTicket
    };
  }

  return {
    success: false,
    reason: 'ERROR',
    message: 'Erro ao processar validação.'
  };
}
