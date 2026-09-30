import React from 'react';
import Header from '@/components/Header';
import Countdown from '@/components/Countdown';
import EventDetails from '@/components/EventDetails';
import TicketSelection from '@/components/TicketSelection';
import Footer from '@/components/Footer';
import { Sparkles, Ticket, Calendar, Clock, MapPin, HelpCircle, ShieldCheck, Music2, Heart } from 'lucide-react';

export default function HomePage() {
  const faqs = [
    {
      q: 'Como vou receber o meu ingresso após o pagamento via PIX?',
      a: 'Assim que o PIX é confirmado, o site exibe os ingressos imediatamente na sua tela com opção de baixar o arquivo PDF ou salvar a imagem com o QR Code. Atenção: os ingressos não são enviados por e-mail, portanto salve o arquivo no seu celular ao finalizar a compra.'
    },
    {
      q: 'Posso comprar múltiplos ingressos de uma só vez?',
      a: 'Sim! Você pode selecionar a quantidade desejada e digitar o nome de cada pessoa. O sistema gera um QR Code exclusivo com o nome de cada participante.'
    },
    {
      q: 'E se eu esquecer ou perder o arquivo do ingresso no dia do evento?',
      a: 'Fique tranquilo! A nossa equipe de portaria terá acesso à Lista Oficial de Presença no sistema e poderá consultar o seu nome ou do comprador para liberar a sua entrada normalmente.'
    },
    {
      q: 'Para onde é destinado o valor do ingresso de R$ 10,00?',
      a: 'O valor simbólico de R$ 10,00 por ingresso é 100% destinado para a confraternização e comemoração de aniversário de 15 anos dos membros do Grupo Eliade.'
    }
  ];

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <Header />

      {/* HERO SECTION COM FOTOS EM ESTILO POLAROID DE ALTO DESTAQUE */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 0 70px',
        overflow: 'hidden'
      }}>
        {/* Luz Ambiente de Fundo */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw',
          maxWidth: '1000px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(30, 55, 122, 0.3) 0%, rgba(6, 11, 26, 0) 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '980px', textAlign: 'center' }}>
          
          {/* Badge Comemorativo */}
          <div className="badge-beige pulse-beige" style={{ marginBottom: '18px' }}>
            <Sparkles size={16} color="var(--beige-light)" /> 
            <span>15 Anos do Grupo Eliade &bull; 2011 - 2026</span>
          </div>

          {/* Título Principal */}
          <h1 className="font-display" style={{
            fontSize: 'clamp(2.3rem, 5vw, 4.2rem)',
            fontWeight: '900',
            lineHeight: '1.15',
            letterSpacing: '0.5px',
            marginBottom: '14px',
            color: '#ffffff'
          }}>
            Culto Musical de <br />
            <span className="text-beige-gradient">Gratidão</span>
          </h1>

          {/* Subtítulo */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
            color: 'var(--beige-warm)',
            fontWeight: '600',
            letterSpacing: '0.5px',
            marginBottom: '26px'
          }}>
            15 Anos de História, Amizade e Louvor &bull; Grupo Eliade
          </p>

          {/* Badges de Data, Hora e Local */}
          <div style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '30px',
            maxWidth: '850px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(14, 26, 58, 0.85)',
              border: '1px solid var(--border-beige)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.94rem',
              color: '#ffffff',
              backdropFilter: 'blur(12px)'
            }}>
              <Calendar size={18} color="var(--beige-primary)" />
              <strong>07 de Novembro</strong>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(14, 26, 58, 0.85)',
              border: '1px solid var(--border-beige)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.94rem',
              color: '#ffffff',
              backdropFilter: 'blur(12px)'
            }}>
              <Clock size={18} color="var(--beige-primary)" />
              <strong>18:00h</strong>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(14, 26, 58, 0.85)',
              border: '1px solid var(--border-beige)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.94rem',
              color: '#ffffff',
              backdropFilter: 'blur(12px)'
            }}>
              <MapPin size={18} color="var(--beige-primary)" />
              <span>Auditório Walkíria Lima</span>
            </div>
          </div>

          {/* Botão de Compra Direta */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <a href="#ingressos" className="btn-primary" style={{ padding: '18px 42px', fontSize: '1.15rem' }}>
              <Ticket size={22} />
              <span>Garantir Ingresso &bull; R$ 10</span>
            </a>
          </div>

          {/* FOTOS EM ESTILO POLAROID RETRÔ MODERNO */}
          <div className="polaroid-wrapper">
            
            {/* Polaroid 1 */}
            <div className="polaroid-card polaroid-left">
              <div className="polaroid-tape" />
              <div className="polaroid-img-box">
                <img
                  src="/images/eliade-foto1.jpeg"
                  alt="Grupo Eliade 15 Anos"
                />
              </div>
              <div className="polaroid-caption">
                Grupo Eliade
              </div>
              <div className="polaroid-subcaption">
                15 Anos de Gratidão
              </div>
            </div>

            {/* Polaroid 2 */}
            <div className="polaroid-card polaroid-right">
              <div className="polaroid-tape" />
              <div className="polaroid-img-box">
                <img
                  src="/images/eliade-foto2.jpeg"
                  alt="Louvor Grupo Eliade"
                />
              </div>
              <div className="polaroid-caption">
                Culto Especial
              </div>
              <div className="polaroid-subcaption">
                07 de Novembro &bull; 18h
              </div>
            </div>

          </div>

          {/* Contador Regressivo */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>
              Contagem Regressiva para a Celebração
            </div>
            <Countdown targetDate="2026-11-07T18:00:00" />
          </div>

        </div>
      </section>

      {/* DETALHES PRÁTICOS DO EVENTO */}
      <EventDetails />

      {/* ÁREA DE SELEÇÃO E AQUISIÇÃO DE INGRESSOS PIX */}
      <TicketSelection />

      {/* PERGUNTAS FREQUENTES & ORIENTAÇÕES */}
      <section style={{ padding: '60px 0 90px', background: 'rgba(4, 8, 20, 0.6)' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="badge-beige" style={{ marginBottom: '10px' }}>
              <HelpCircle size={14} /> Dúvidas Frequentes
            </div>
            <h2 className="font-display" style={{ fontSize: '1.9rem', fontWeight: '800', color: '#ffffff' }}>
              Informações Importantes
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '22px 26px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--beige-warm)', marginBottom: '8px' }}>
                  {faq.q}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
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
