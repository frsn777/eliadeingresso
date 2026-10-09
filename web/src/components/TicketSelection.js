'use client';

import React, { useState } from 'react';
import { Ticket, Plus, Minus, User, Mail, Phone, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

export default function TicketSelection() {
  const unitPrice = 10;
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
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
      updated[0] = buyerName;
      if (newQty > updated.length) {
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
    setAttendees((prev) => {
      const updated = [...prev];
      updated[0] = val;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!buyerName.trim()) {
      setErrorMessage('Por favor, preencha o seu nome completo.');
      return;
    }

    if (!buyerPhone.trim() || buyerPhone.trim().length < 8) {
      setErrorMessage('Por favor, preencha seu WhatsApp ou telefone de contato.');
      return;
    }

    if (quantity > 1) {
      for (let i = 1; i < quantity; i++) {
        if (!attendees[i] || !attendees[i].trim()) {
          setErrorMessage(`Por favor, preencha o nome completo da Pessoa ${i + 1}.`);
          return;
        }
      }
    }

    const finalAttendees = [buyerName.trim()];
    for (let i = 1; i < quantity; i++) {
      finalAttendees.push(attendees[i].trim());
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: buyerName.trim(),
          customerPhone: buyerPhone.trim(),
          attendees: finalAttendees
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível gerar a cobrança PIX.');
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
    <section id="ingressos" style={{ padding: '40px 0 80px', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        
        {/* Cabeçalho da Seção de Ingressos */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="badge-beige" style={{ marginBottom: '12px' }}>
            <Ticket size={15} /> Inclusão na Lista de Entrada
          </div>
          <h2 className="font-display" style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
            fontWeight: '800',
            marginBottom: '12px',
            color: '#ffffff'
          }}>
            Garanta Seu Nome na Lista
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            Valor de <strong style={{ color: 'var(--beige-warm)', fontSize: '1.15rem' }}>R$ 10,00</strong> por pessoa. Confirmação instantânea via PIX e inclusão direta na Lista Oficial da Portaria.
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="glass-card beige-border-glow" style={{
          padding: 'clamp(24px, 5vw, 42px)',
          position: 'relative',
          background: 'rgba(12, 23, 53, 0.85)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Seletor de Quantidade */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 22px',
              background: 'rgba(7, 13, 30, 0.75)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
                  Quantidade de Pessoas / Ingressos
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  R$ 10,00 cada &bull; {quantity === 1 ? 'Seu nome será adicionado à lista' : `${quantity} nomes serão adicionados à lista`}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  aria-label="Diminuir quantidade"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: quantity <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(244, 237, 228, 0.1)',
                    border: '1px solid var(--border-beige)',
                    color: quantity <= 1 ? 'var(--text-muted)' : 'var(--beige-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Minus size={18} />
                </button>

                <span className="font-display text-beige-gradient" style={{
                  fontSize: '1.9rem',
                  fontWeight: '800',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 20}
                  aria-label="Aumentar quantidade"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(244, 237, 228, 0.15)',
                    border: '1px solid var(--border-beige)',
                    color: 'var(--beige-light)',
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

            {/* Dados do Comprador / Responsável */}
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--beige-warm)'
              }}>
                <User size={18} /> Dados do Responsável pela Compra
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="input-label">Seu Nome Completo *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: Ana Maria Silva"
                    value={buyerName}
                    onChange={(e) => handleBuyerNameChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">WhatsApp / Celular de Contato *</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="(96) 99999-9999"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Se for apenas 1 ingresso: Mensagem explicativa */}
            {quantity === 1 ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.88rem',
                color: '#f0fdf4'
              }}>
                <Sparkles size={20} color="#86efac" style={{ flexShrink: 0 }} />
                <div>
                  O seu nome (<strong>{buyerName.trim() || 'Seu Nome Completo'}</strong>) será incluído diretamente na <strong>Lista Oficial de Entrada da Portaria</strong>. Basta apresentar um documento com foto no dia do evento.
                </div>
              </div>
            ) : (
              /* Se forem 2 ou mais ingressos: Lista de Nomes Adicionais */
              <div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--beige-warm)'
                }}>
                  <Users size={18} /> Nomes para a Lista de Entrada ({quantity} pessoas)
                </div>
                
                <div style={{
                  background: 'rgba(244, 237, 228, 0.06)',
                  border: '1px solid var(--border-beige)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  fontSize: '0.86rem',
                  color: '#f4ede4',
                  lineHeight: '1.5'
                }}>
                  <strong>📌 Acompanhantes:</strong> A Pessoa 1 é você (responsável pela compra). Preencha o nome completo dos seus acompanhantes abaixo para que constem na portaria:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {/* Pessoa 1 (Responsável) */}
                  <div>
                    <label className="input-label" style={{ fontSize: '0.82rem', color: '#86efac' }}>
                      Pessoa 1 (Você / Responsável) ✓
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={buyerName.trim() || 'Preenchido acima'}
                      disabled
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        color: '#86efac',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  {/* Demais Pessoas (Acompanhantes) */}
                  {Array.from({ length: quantity - 1 }).map((_, i) => {
                    const idx = i + 1;
                    return (
                      <div key={idx}>
                        <label className="input-label" style={{ fontSize: '0.82rem' }}>
                          Pessoa {idx + 1} (Nome Completo do Convidado) *
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder={`Nome completo do acompanhante ${idx + 1}`}
                          value={attendees[idx] || ''}
                          onChange={(e) => handleAttendeeNameChange(idx, e.target.value)}
                          required
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resumo do Pedido e Botão PIX */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '18px'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Valor Total ({quantity}x R$ 10,00):
                </div>
                <div className="font-display text-beige-gradient" style={{ fontSize: '2.2rem', fontWeight: '900' }}>
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ padding: '16px 36px', fontSize: '1.08rem' }}
              >
                {isLoading ? (
                  <span>Gerando PIX...</span>
                ) : (
                  <>
                    <span>Pagar com PIX &bull; R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
                    <ArrowRight size={18} />
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
