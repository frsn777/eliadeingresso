'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Music2, HeartHandshake, QrCode } from 'lucide-react';

export default function EventDetails() {
  const highlights = [
    {
      icon: <Calendar size={26} color="var(--beige-light)" />,
      title: "Data Oficial",
      subtitle: "07 de Novembro de 2026",
      desc: "Uma noite inesquecível de louvor e gratidão a Deus pelos 15 anos."
    },
    {
      icon: <Clock size={26} color="var(--beige-light)" />,
      title: "Horário de Início",
      subtitle: "18:00 horas",
      desc: "Abertura dos portões a partir das 17h30. Chegue cedo para se acomodar."
    },
    {
      icon: <MapPin size={26} color="var(--beige-light)" />,
      title: "Local do Evento",
      subtitle: "Auditório Walkíria Lima",
      desc: "Centro de Educação Profissional de Música Walkíria Lima."
    },
    {
      icon: <Music2 size={26} color="var(--beige-light)" />,
      title: "Repertório Especial",
      subtitle: "15 Anos de Louvor",
      desc: "Uma seleção com arranjos musicais emocionantes que marcaram nossa caminhada."
    },
    {
      icon: <QrCode size={26} color="var(--beige-light)" />,
      title: "Ingresso Digital",
      subtitle: "QR Code Individual",
      desc: "Emissão instantânea na tela após o PIX, com nome de cada convidado."
    },
    {
      icon: <HeartHandshake size={26} color="var(--beige-light)" />,
      title: "Contribuição Simbólica",
      subtitle: "R$ 10,00 por Pessoa",
      desc: "Valor 100% destinado para a confraternização e celebração de 15 anos do grupo."
    }
  ];

  return (
    <section id="informacoes" style={{ padding: '60px 0 40px', position: 'relative' }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {highlights.map((item, index) => (
            <div key={index} className="glass-card" style={{
              padding: '24px 22px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(244, 237, 228, 0.08)',
                border: '1px solid var(--border-beige)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--beige-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {item.title}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginTop: '2px', marginBottom: '6px' }}>
                  {item.subtitle}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
