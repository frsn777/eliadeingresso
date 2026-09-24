import React from 'react';
import Header from '@/components/Header';
import Countdown from '@/components/Countdown';
import EventDetails from '@/components/EventDetails';
import TicketSelection from '@/components/TicketSelection';
import Footer from '@/components/Footer';
import { Sparkles, Ticket, Music, Award, HelpCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const faqs = [
    {
      q: 'Como vou receber os meus ingressos após o pagamento?',
      a: 'Imediatamente após a confirmação do PIX, o site exibirá os ingressos individuais na tela prontos para visualização e impressão, com QR Codes únicos para cada participante.'
    },
    {
      q: 'Posso comprar vários ingressos de uma só vez?',
      a: 'Sim! Você pode selecionar a quantidade desejada e informar o nome de cada convidado. O sistema gerará um QR Code exclusivo com o nome de cada pessoa.'
    },
    {
      q: 'Como funciona a entrada no dia do evento?',
      a: 'Nossa equipe de portaria terá um leitor digital. Basta apresentar o QR Code na tela do seu celular ou impresso para ter a entrada liberada em segundos.'
    },
    {
      q: 'Para onde vai o valor arrecadado dos ingressos?',
      a: 'O valor simbólico de R$ 10,00 por ingresso é 100% destinado para cobrir os custos dos brindes comemorativos e financiar o passeio comemorativo de aniversário dos membros do grupo.'
    }
  ];

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <Header />

      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '140px 0 80px',
        overflow: 'hidden'
      }}>
        {/* Imagem de Fundo com Overlay Gradiente */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/hero-banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.32)',
          zIndex: -2
        }} />

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(7, 8, 12, 0.4) 0%, rgba(7, 8, 12, 0.95) 100%)',
          zIndex: -1
        }} />

        <div className="container" style={{ textAlign: 'center', maxWidth: '880px', position: 'relative', zIndex: 1 }}>
          
          <div className="gold-badge" style={{ marginBottom: '20px' }}>
            <Sparkles size={16} /> Concerto de Gala &bull; 15 Anos de História
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            letterSpacing: '1px',
            marginBottom: '20px'
          }}>
            Uma Noite Especial de <br />
            <span className="text-gold-gradient">Música & Gratidão</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: '1.7',
            maxWidth: '680px',
            margin: '0 auto 30px'
          }}>
            Venha celebrar conosco os 15 anos do <strong>Grupo Musical Eliade</strong>. Uma apresentação inesquecível com repertório emocionante, homenagens e brindes exclusivos.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#ingressos" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>
              <Ticket size={20} />
              <span>Garantir Ingresso &bull; R$ 10</span>
            </a>
            <a href="#sobre" className="btn-secondary" style={{ padding: '16px 32px' }}>
              <span>Conhecer o Evento</span>
              <ChevronRight size={18} />
            </a>
          </div>

          {/* Contador Regressivo */}
          <Countdown targetDate="2026-11-15T19:30:00" />
        </div>
      </section>

      {/* SEÇÃO SOBRE & DETALHES DO EVENTO */}
      <EventDetails />

      {/* SEÇÃO DE DESTAQUES VISUAIS / PALCO */}
      <section style={{
        position: 'relative',
        padding: '100px 0',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/stage-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.25)',
          zIndex: -1
        }} />

        <div className="container">
          <div style={{
            background: 'rgba(18, 21, 31, 0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(32px, 6vw, 60px)',
            boxShadow: 'var(--shadow-gold)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
              alignItems: 'center'
            }}>
              <div>
                <div className="gold-badge" style={{ marginBottom: '14px' }}>
                  <Award size={14} /> Tradição e Excelência
                </div>
                <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: '800', marginBottom: '16px' }}>
                  Momentos que Marcaram Nossa Trajetória
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '24px' }}>
                  Desde nossa primeira apresentação até os palcos atuais, o Grupo Eliade sempre levou emoção através da música. Nesta comemoração, preparamos arranjos musicais inéditos e uma recepção especial para todos os convidados.
                </p>
                <a href="#ingressos" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                  <Ticket size={18} /> Participar da Celebração
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--gold-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    flexShrink: 0
                  }}>
                    <Music size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Repertório Especial</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Músicas que marcaram os 15 anos de história.</p>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--gold-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    flexShrink: 0
                  }}>
                    <Sparkles size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Brinde Exclusivo</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lembrança personalizada inclusa em cada ingresso.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO DE SELEÇÃO E CHECKOUT DE INGRESSOS */}
      <TicketSelection />

      {/* FAQ - PERGUNTAS FREQUENTES */}
      <section style={{ padding: '60px 0 100px', background: 'rgba(0, 0, 0, 0.4)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="gold-badge" style={{ marginBottom: '12px' }}>
              <HelpCircle size={14} /> Dúvidas Frequentes
            </div>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: '800' }}>
              Tire suas Dúvidas
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '24px 28px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--gold-light)', marginBottom: '8px' }}>
                  {faq.q}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
