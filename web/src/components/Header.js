'use client';

import React from 'react';
import Link from 'next/link';
import { Music, ShieldCheck, Ticket } from 'lucide-react';

export default function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100,
      background: 'rgba(7, 8, 12, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Logo / Nome do Grupo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--gold-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            boxShadow: 'var(--shadow-gold)'
          }}>
            <Music size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display" style={{
              fontSize: '1.25rem',
              fontWeight: '900',
              letterSpacing: '1.5px',
              color: 'var(--text-primary)'
            }}>
              GRUPO ELIADE
            </div>
            <div style={{
              fontSize: '0.72rem',
              letterSpacing: '2px',
              color: 'var(--gold-light)',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              15 Anos de História
            </div>
          </div>
        </Link>

        {/* Links de Navegação */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#sobre" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}>
            O Evento
          </a>
          <a href="#ingressos" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}>
            Ingressos
          </a>
          <Link href="/admin/scanner" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            transition: 'all 0.2s'
          }}>
            <ShieldCheck size={16} />
            Portaria
          </Link>
          <a href="#ingressos" className="btn-primary" style={{
            padding: '10px 20px',
            fontSize: '0.9rem'
          }}>
            <Ticket size={18} />
            Comprar R$ 10
          </a>
        </nav>
      </div>
    </header>
  );
}
