import React from 'react';
import Link from 'next/link';
import { Music, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: '#050608',
      padding: '60px 0 30px',
      color: 'var(--text-secondary)'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--gold-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000'
            }}>
              <Music size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                GRUPO ELIADE
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-light)' }}>
                15 Anos de Celebração e Música
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.88rem' }}>
            <a href="#sobre" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Sobre o Evento</a>
            <a href="#ingressos" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Ingressos</a>
            <Link href="/admin/scanner" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Validador Portaria
            </Link>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} Grupo Musical Eliade. Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Feito com <Heart size={14} color="var(--gold-primary)" fill="var(--gold-primary)" /> para a celebração de 15 anos.
          </div>
        </div>
      </div>
    </footer>
  );
}
