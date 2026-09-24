import React from 'react';
import { Calendar, Clock, MapPin, Gift, Sparkles, HeartHandshake } from 'lucide-react';

export default function EventDetails() {
  const highlights = [
    {
      icon: <Calendar className="text-gold-gradient" size={28} />,
      title: "Data do Concerto",
      subtitle: "15 de Novembro de 2026",
      desc: "Uma noite especial e inesquecível para celebrar nossa trajetória."
    },
    {
      icon: <Clock className="text-gold-gradient" size={28} />,
      title: "Horário",
      subtitle: "Abertura às 19:00",
      desc: "Início pontual às 19h30 com repertório comemorativo."
    },
    {
      icon: <MapPin className="text-gold-gradient" size={28} />,
      title: "Localização",
      subtitle: "Teatro / Auditório Central",
      desc: "Ambiente climatizado, com acessibilidade e poltronas confortáveis."
    },
    {
      icon: <Gift className="text-gold-gradient" size={28} />,
      title: "Brindes Exclusivos",
      subtitle: "Lembranças de 15 Anos",
      desc: "Todo participante receberá uma lembrança personalizada do evento."
    },
    {
      icon: <HeartHandshake className="text-gold-gradient" size={28} />,
      title: "100% Revertido",
      subtitle: "Custeio Comunitário",
      desc: "O valor simbólico de R$ 10 cobre os brindes e o passeio comemorativo do grupo."
    },
    {
      icon: <Sparkles className="text-gold-gradient" size={28} />,
      title: "Apresentação de Gala",
      subtitle: "Músicas Clássicas & Inéditas",
      desc: "Arranjos especiais preparados com dedicação para este marco."
    }
  ];

  return (
    <section id="sobre" style={{ padding: '90px 0 60px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 60px' }}>
          <div className="gold-badge" style={{ marginBottom: '16px' }}>
            <Sparkles size={14} /> Celebração Histórica
          </div>
          <h2 className="font-display" style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '18px'
          }}>
            15 Anos de Harmonia, Amizade e Louvor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
            Para comemorar uma década e meia de música e histórias, preparamos uma noite de gala emocionante. Venha celebrar conosco e fazer parte desta memória!
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {highlights.map((item, index) => (
            <div key={index} className="glass-card" style={{
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {item.title}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {item.subtitle}
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
