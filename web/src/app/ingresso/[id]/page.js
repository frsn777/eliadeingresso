'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Music, Calendar, Clock, MapPin, Printer, ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function TicketPage() {
  const params = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/tickets/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.ticket) {
          setTicket(data.ticket);
        } else {
          setError(data.error || 'Ingresso não encontrado.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Erro ao carregar os dados do ingresso.');
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(212, 175, 55, 0.2)',
            borderTopColor: 'var(--gold-primary)',
            borderRadius: '50%',
            animation: 'spin 1s infinite linear',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Carregando seu ingresso oficial...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass-card" style={{ maxWidth: '440px', padding: '36px', textAlign: 'center' }}>
          <AlertTriangle size={48} color="var(--status-error)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Ingresso Não Encontrado</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
          <Link href="/" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const isUsed = ticket.status === 'used';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, #161925 0%, #07080c 100%)',
      padding: '40px 20px 80px'
    }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        
        {/* Barra superior de ações */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}>
            <ArrowLeft size={16} /> Página Inicial
          </Link>

          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Printer size={16} /> Imprimir / Salvar PDF
          </button>
        </div>

        {/* CARTÃO DO INGRESSO VIP */}
        <div className="ticket-stub" style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.2)'
        }}>
          {/* Topo do Ingresso */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(0,0,0,0.4))',
            padding: '28px 32px',
            borderBottom: '1px dashed var(--border-gold)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--gold-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000'
              }}>
                <Music size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-display" style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                  GRUPO ELIADE
                </h1>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: '600', letterSpacing: '1px' }}>
                  CELEBRAÇÃO DE 15 ANOS
                </div>
              </div>
            </div>

            <div style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: isUsed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: `1px solid ${isUsed ? 'var(--status-error)' : 'var(--status-success)'}`,
              color: isUsed ? '#fca5a5' : '#86efac',
              fontSize: '0.8rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {isUsed ? (
                <>
                  <AlertTriangle size={14} /> ENTRADA UTILIZADA
                </>
              ) : (
                <>
                  <CheckCircle size={14} /> INGRESSO VÁLIDO
                </>
              )}
            </div>
          </div>

          {/* Corpo do Ingresso */}
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Participante / Portador
              </span>
              <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--gold-light)', marginTop: '2px' }}>
                {ticket.attendee_name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Código do Ingresso: <strong>{ticket.ticket_code}</strong>
              </div>
            </div>

            {/* Detalhes do Evento */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              padding: '18px',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="var(--gold-primary)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>DATA</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>15/Nov/2026</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="var(--gold-primary)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>HORÁRIO</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>19:30h</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={18} color="var(--gold-primary)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>LOCAL</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>Auditório Central</div>
                </div>
              </div>
            </div>

            {/* QR CODE PARA APRESENTAR NA ENTRADA */}
            <div style={{
              textAlign: 'center',
              padding: '24px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              width: '240px',
              margin: '0 auto 16px'
            }}>
              {ticket.qrCodeImage && (
                <img
                  src={ticket.qrCodeImage}
                  alt="QR Code de Validação"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              )}
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Apresente este QR Code na portaria (impresso ou direto no celular).
            </p>
          </div>

          {/* Rodapé do Ingresso */}
          <div style={{
            padding: '16px 32px',
            background: 'rgba(0, 0, 0, 0.5)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--gold-primary)" />
              Ingresso Autêntico & Seguro
            </div>
            <div>ID: {ticket.id.substring(0, 8)}...</div>
          </div>
        </div>

      </div>
    </div>
  );
}
