'use client';

import React from 'react';
import Link from 'next/link';
import { Music, ShieldCheck, Heart, MapPin, Calendar, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: '#040712',
      padding: '50px 0 28px',
      color: 'var(--text-secondary)'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Identidade */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--beige-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#060b1a'
            }}>
              <Music size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                GRUPO ELIADE
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--beige-primary)', letterSpacing: '1px' }}>
                Culto Musical de Gratidão &bull; 15 Anos
              </div>
            </div>
          </div>

          {/* Links e Atalho */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.86rem', flexWrap: 'wrap' }}>
            <a href="#ingressos" style={{ color: 'var(--beige-warm)', textDecoration: 'none', fontWeight: '600' }}>
              Comprar Ingresso (R$ 10)
            </a>
            <a href="#informacoes" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Informações do Evento
            </a>
            <Link href="/admin/scanner" style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>
              <ShieldCheck size={14} /> Validador Portaria
            </Link>
          </div>
        </div>

        {/* Linha Inferior */}
        <div style={{
          borderTop: '1px solid rgba(244, 237, 228, 0.06)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} Grupo Musical Eliade. Auditório do Centro de Educação Profissional de Música Walkíria Lima.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Celebrando com <Heart size={14} color="var(--beige-primary)" fill="var(--beige-primary)" /> 15 anos de história e louvor.
          </div>
        </div>
      </div>
    </footer>
  );
}
