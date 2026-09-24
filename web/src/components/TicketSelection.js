'use client';

import React, { useState } from 'react';
import { Ticket, Plus, Minus, User, Mail, Phone, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

export default function TicketSelection() {
  const unitPrice = 10;
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [attendees, setAttendees] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutData, setCheckoutData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuantityChange = (newQty) => {
    if (newQty < 1 || newQty > 20) return;
    setQuantity(newQty);

    setAttendees((prev) => {
      const updated = [...prev];
      if (newQty > prev.length) {
        while (updated.length < newQty) {
          updated.push('');
        }
      } else {
        updated.splice(newQty);
      }
      return updated;
    });
  };

  const handleAttendeeNameChange = (index, value) => {
    setAttendees((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleBuyerNameChange = (val) => {
    setBuyerName(val);
    // Se o primeiro participante ainda estiver vazio ou for igual ao nome anterior, atualiza automaticamente
    if (!attendees[0] || attendees[0] === buyerName) {
      handleAttendeeNameChange(0, val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!buyerName.trim() || !buyerEmail.trim()) {
      setErrorMessage('Por favor, preencha seu nome e e-mail.');
      return;
    }

    const finalAttendees = attendees.map((name, i) => name.trim() || (i === 0 ? buyerName.trim() : `Convidado ${i + 1} de ${buyerName}`));

    setIsLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: buyerName.trim(),
          customerEmail: buyerEmail.trim(),
          customerPhone: buyerPhone.trim(),
          attendees: finalAttendees
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível gerar os ingressos.');
      }

      setCheckoutData(data);
      setIsModalOpen(true);
    } catch (err) {
      setErrorMessage(err.message || 'Erro ao processar checkout. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = quantity * unitPrice;

  return (
    <section id="ingressos" style={{ padding: '80px 0 100px', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="gold-badge" style={{ marginBottom: '14px' }}>
            <Ticket size={14} /> Garanta sua Entrada
          </div>
          <h2 className="font-display" style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
            fontWeight: '800',
            marginBottom: '14px'
          }}>
            Adquira seus Ingressos Comemorativos
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Valor único e acessível de <strong style={{ color: 'var(--gold-light)' }}>R$ 10,00</strong> por pessoa. Pagamento via PIX instantâneo.
          </p>
        </div>

        <div className="glass-card gold-border-glow" style={{ padding: 'clamp(24px, 5vw, 44px)', position: 'relative' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Seletor de Quantidade */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              background: 'rgba(10, 12, 18, 0.6)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Quantidade de Ingressos
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  R$ 10,00 por ingresso (Gera QR Code individual para cada pessoa)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: quantity <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid var(--border-gold)',
                    color: quantity <= 1 ? 'var(--text-muted)' : 'var(--gold-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Minus size={18} />
                </button>

                <span className="font-display text-gold-gradient" style={{
                  fontSize: '1.8rem',
                  fontWeight: '800',
                  minWidth: '36px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 20}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--gold-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Dados do Comprador */}
            <div>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: '700',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--gold-light)'
              }}>
                <User size={20} /> Dados do Comprador / Responsável
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="input-label">Nome Completo *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex: João da Silva"
                      value={buyerName}
                      onChange={(e) => handleBuyerNameChange(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">E-mail para Receber Ingressos *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="seu.email@exemplo.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">WhatsApp / Telefone (Opcional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="(00) 00000-0000"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Nomes dos Participantes nos Ingressos */}
            <div>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: '700',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--gold-light)'
              }}>
                <Users size={20} /> Nome nos Ingressos ({quantity} {quantity === 1 ? 'pessoa' : 'pessoas'})
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Cada pessoa terá seu nome impresso no ingresso e um QR Code exclusivo para controle de acesso na portaria.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {attendees.map((name, idx) => (
                  <div key={idx}>
                    <label className="input-label">
                      Participante {idx + 1} {idx === 0 ? '(Você)' : ''}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={`Nome do Participante ${idx + 1}`}
                      value={name}
                      onChange={(e) => handleAttendeeNameChange(idx, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo do Pedido e Botão de Ação */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '28px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total a Pagar ({quantity}x R$ 10,00):
                </div>
                <div className="font-display text-gold-gradient" style={{ fontSize: '2.2rem', fontWeight: '900' }}>
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ padding: '16px 36px', fontSize: '1.1rem' }}
              >
                {isLoading ? (
                  <span>Gerando PIX...</span>
                ) : (
                  <>
                    <span>Pagar com PIX</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--status-error)',
                color: '#fca5a5',
                fontSize: '0.9rem'
              }}>
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Modal de Checkout / PIX */}
      {isModalOpen && checkoutData && (
        <CheckoutModal
          data={checkoutData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
