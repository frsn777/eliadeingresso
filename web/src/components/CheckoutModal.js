'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, QrCode, Sparkles, CheckCircle, ExternalLink, X, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function CheckoutModal({ data, onClose }) {
  const { order, tickets, pix } = data;
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(order?.status === 'approved');
  const [isSimulating, setIsSimulating] = useState(false);

  // Efeito de confete ao aprovar
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Polling automático para verificar aprovação
  useEffect(() => {
    if (isApproved) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        const result = await res.json();
        if (result?.order?.status === 'approved') {
          setIsApproved(true);
          triggerConfetti();
        }
      } catch (err) {
        console.error('Erro ao verificar status do pagamento:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order.id, isApproved]);

  const handleCopyPix = () => {
    if (pix?.copyPaste) {
      navigator.clipboard.writeText(pix.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Simular pagamento instantâneo
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}?simulate=true`);
      const result = await res.json();
      if (result.success) {
        setIsApproved(true);
        triggerConfetti();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card gold-border-glow" style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '36px',
        position: 'relative',
        background: '#0e111a'
      }}>
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%'
          }}
        >
          <X size={24} />
        </button>

        {!isApproved ? (
          <div>
            {/* Cabeçalho PIX */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="gold-badge" style={{ marginBottom: '12px' }}>
                <QrCode size={14} /> Pagamento Seguro Instantâneo
              </div>
              <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>
                Finalize pelo PIX
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Abra o aplicativo do seu banco, escaneie o QR Code ou cole o código.
              </p>
            </div>

            {/* Imagem do QR Code PIX */}
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              width: '240px',
              height: '240px',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
            }}>
              {pix?.qrCodeImage ? (
                <img
                  src={pix.qrCodeImage}
                  alt="QR Code PIX"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ color: '#000', fontSize: '0.8rem' }}>Carregando QR Code...</div>
              )}
            </div>

            {/* Total e Destinatário */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Valor a Pagar:</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--gold-light)' }}>
                  R$ {Number(pix?.amount || order.total_amount).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Destinatário:</span>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {pix?.receiver || 'Grupo Musical Eliade'}
                </div>
              </div>
            </div>

            {/* Botão Copia e Cola */}
            <div style={{ marginBottom: '24px' }}>
              <button
                type="button"
                onClick={handleCopyPix}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(212, 175, 55, 0.1)',
                  borderColor: copied ? 'var(--status-success)' : 'var(--border-gold)',
                  color: copied ? 'var(--status-success)' : 'var(--gold-light)',
                  padding: '14px'
                }}
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    <span>Código PIX Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Copiar Código PIX (Copia e Cola)</span>
                  </>
                )}
              </button>
            </div>

            {/* Status e Simulação */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'center',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gold-primary)',
                  animation: 'pulseGold 1.5s infinite'
                }} />
                Aguardando pagamento... (Atualização automática)
              </div>

              {/* Botão de Demonstração / Teste Imediato */}
              <button
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                style={{
                  background: 'none',
                  border: '1px dashed var(--border-gold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  color: 'var(--gold-light)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  opacity: 0.8
                }}
              >
                ⚡ {isSimulating ? 'Confirmando...' : 'Testar Agora: Simular Confirmação do PIX'}
              </button>
            </div>
          </div>
        ) : (
          /* TELA DE SUCESSO / INGRESSOS LIBERADOS */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--status-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: 'var(--status-success)'
            }}>
              <CheckCircle size={38} />
            </div>

            <div className="gold-badge" style={{ marginBottom: '12px' }}>
              <Sparkles size={14} /> Pagamento Confirmado
            </div>

            <h3 className="font-display" style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '8px' }}>
              Ingressos Garantidos!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              Obrigado por celebrar os 15 anos do Grupo Eliade conosco! Seus ingressos individuais com QR Code já estão disponíveis abaixo:
            </p>

            {/* Lista de Ingressos Gerados */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {tickets?.map((t, idx) => (
                <div key={t.id || idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-gold)'
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {t.attendee_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                      Código: {t.ticket_code}
                    </div>
                  </div>

                  <Link
                    href={`/ingresso/${t.id}`}
                    target="_blank"
                    className="btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span>Ver Ingresso</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              ))}
            </div>

            <button onClick={onClose} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
