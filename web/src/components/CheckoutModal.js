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
          /* TELA DE SUCESSO / NOMES CONFIRMADOS NA LISTA */
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
              margin: '0 auto 16px',
              color: 'var(--status-success)',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)'
            }}>
              <CheckCircle size={40} />
            </div>

            <div className="badge-beige" style={{ marginBottom: '10px' }}>
              <Sparkles size={14} /> Pagamento Confirmado com Sucesso
            </div>

            <h3 className="font-display" style={{ fontSize: '1.65rem', fontWeight: '800', marginBottom: '8px', color: '#ffffff' }}>
              Presença Confirmada!
            </h3>

            {/* AVISO EXPLICATIVO DA PORTARIA */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              marginBottom: '20px',
              textAlign: 'left',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <Sparkles size={22} color="#86efac" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', color: '#f0fdf4', lineHeight: '1.55' }}>
                <strong>🎉 Seus nomes já constam na Lista Oficial da Portaria!</strong> <br />
                No dia <strong>07 de Novembro</strong>, no Auditório Walkíria Lima, basta que cada participante chegue à portaria e <strong>apresente um documento de identificação com foto</strong> para ter sua entrada liberada.
              </div>
            </div>

            {/* Lista de Nomes Confirmados */}
            <div style={{ textAlign: 'left', marginBottom: '10px', fontSize: '0.84rem', fontWeight: '700', color: 'var(--beige-warm)' }}>
              Participantes Cadastrados na Lista ({tickets?.length || 1}):
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              {tickets?.map((t, idx) => (
                <div key={t.id || idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-beige)',
                  gap: '10px'
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '0.98rem' }}>
                      {t.attendee_name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Comprador: {order?.customer_name || 'Titular'} &bull; Pedido #{order?.id?.substring(0, 8) || 'ELI'}
                    </div>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#86efac',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap'
                  }}>
                    <Check size={14} /> Na Lista
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo do Pedido / Comprovante */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '18px',
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Responsável:</span>
                <div style={{ fontWeight: '700', color: '#ffffff' }}>{order?.customer_name}</div>
              </div>
              {order?.customer_phone && (
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>WhatsApp:</span>
                  <div style={{ fontWeight: '700', color: '#ffffff' }}>{order?.customer_phone}</div>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Valor Total:</span>
                <div style={{ fontWeight: '800', color: 'var(--beige-warm)' }}>
                  R$ {Number(order?.total_amount || 10).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Data da Compra:</span>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>
                  {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Detalhes do Evento para Lembrete */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              📅 <strong>07/11/2026 às 18:00h</strong> &bull; Auditório Walkíria Lima &bull; Culto 15 Anos Eliade
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ flex: 1, minWidth: '160px', justifyContent: 'center', padding: '12px' }}
              >
                <Printer size={16} />
                <span>Salvar / Imprimir Comprovante</span>
              </button>

              <button
                onClick={onClose}
                className="btn-primary"
                style={{ flex: 1, minWidth: '140px', justifyContent: 'center', padding: '12px' }}
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
