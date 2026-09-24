-- =========================================================
-- ESQUEMA DO BANCO DE DADOS - GRUPO ELIADE (15 ANOS)
-- Banco de Dados: Supabase (PostgreSQL)
-- =========================================================

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PEDIDOS (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 10.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 10.00,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'cancelled'
    payment_method VARCHAR(50) NOT NULL DEFAULT 'pix',
    payment_txid VARCHAR(255),
    pix_copy_paste TEXT,
    pix_qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE INGRESSOS (TICKETS)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    attendee_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'valid', -- 'valid', 'used', 'cancelled'
    used_at TIMESTAMP WITH TIME ZONE,
    scanned_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para consultas ultra-rápidas na portaria
CREATE INDEX IF NOT EXISTS idx_tickets_id ON public.tickets(id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública controladas (Permite consulta por ID de ingresso e criação de pedidos)
CREATE POLICY "Permitir inserção anônima de pedidos" 
ON public.orders FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir leitura de pedido pelo ID" 
ON public.orders FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Permitir leitura de ingressos" 
ON public.tickets FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Permitir atualização de status do ingresso pela API" 
ON public.tickets FOR UPDATE 
TO anon, authenticated 
USING (true);
