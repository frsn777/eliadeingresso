'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, QrCode, Sparkles, CheckCircle, ExternalLink, X, AlertTriangle, Download, Printer } from 'lucide-react';
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

  // Simular pagamento instantâneo para demonstração e testes
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
      backgroundColor: 'rgba(4, 7, 18, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card beige-border-glow" style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '32px 26px',
        position: 'relative',
        background: '#0a1329',
        border: '1px solid var(--border-beige)'
      }}>
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          aria-label="Fechar janela"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            transition: 'color 0.2s'
          }}
        >
          <X size={24} />
        </button>

        {!isApproved ? (
          <div>
            {/* Cabeçalho PIX */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div className="badge-beige" style={{ marginBottom: '10px' }}>
                <QrCode size={14} /> Pagamento PIX Instantâneo
              </div>
              <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '6px', color: '#ffffff' }}>
                Finalize seu Pagamento
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Abra o app do seu banco, escaneie o QR Code abaixo ou utilize a chave Copia e Cola.
              </p>
            </div>

            {/* Imagem do QR Code PIX */}
            <div style={{
              background: '#ffffff',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              width: '230px',
              height: '230px',
              margin: '0 auto 20px',
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
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Valor a Pagar:</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--beige-warm)' }}>
                  R$ {Number(pix?.amount || order.total_amount).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Beneficiário:</span>
                <div style={{ fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {pix?.receiver || 'Grupo Musical Eliade'}
                </div>
              </div>
            </div>

            {/* Botão Copia e Cola */}
            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={handleCopyPix}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 237, 228, 0.08)',
                  borderColor: copied ? 'var(--status-success)' : 'var(--border-beige)',
                  color: copied ? '#86efac' : 'var(--beige-light)',
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
              paddingTop: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--text-secondary)',
                fontSize: '0.84rem'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--beige-primary)',
                  boxShadow: '0 0 10px var(--beige-primary)'
                }} />
                Aguardando pagamento... (Liberação automática)
              </div>

              {/* Botão de Demonstração / Teste Imediato (Apenas em ambiente de desenvolvimento) */}
              {process.env.NODE_ENV !== 'production' && (
                <button
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  style={{
                    background: 'none',
                    border: '1px dashed var(--border-beige)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: 'var(--beige-warm)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    opacity: 0.85
                  }}
                >
                  ⚡ {isSimulating ? 'Confirmando...' : 'Testar Demonstração: Simular Confirmação do PIX (Dev)'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* TELA DE SUCESSO / INGRESSOS LIBERADOS */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--status-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--status-success)'
            }}>
              <CheckCircle size={36} />
            </div>

            <div className="badge-beige" style={{ marginBottom: '10px' }}>
              <Sparkles size={14} /> Pagamento Confirmado
            </div>

            <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: '#ffffff' }}>
              Ingressos Garantidos!
            </h3>

            {/* AVISO DE DESTAQUE: BAIXAR AGORA */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: '20px',
              textAlign: 'left',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.86rem', color: '#fef3c7', lineHeight: '1.5' }}>
                <strong>⚠️ ATENÇÃO:</strong> Os ingressos <strong>NÃO são enviados por e-mail</strong>. Abra e salve cada ingresso abaixo (em PDF ou imagem) no seu celular para apresentar na portaria no dia 07 de Novembro.
              </div>
            </div>

            {/* Lista de Ingressos Gerados com Botões de Download */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {tickets?.map((t, idx) => (
                <div key={t.id || idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-beige)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {t.attendee_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--beige-primary)' }}>
                      Código: {t.ticket_code}
                    </div>
                  </div>

                  <Link
                    href={`/ingresso/${t.id}`}
                    target="_blank"
                    className="btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.84rem'
                    }}
                  >
                    <Download size={15} />
                    <span>Baixar / Ver Ingresso</span>
                  </Link>
                </div>
              ))}
            </div>

            <button onClick={onClose} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Concluir e Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
