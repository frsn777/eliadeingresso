'use client';

import React from 'react';
import Link from 'next/link';
import { Music, ShieldCheck, Ticket, Calendar, MapPin } from 'lucide-react';

export default function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100,
      background: 'rgba(6, 11, 26, 0.88)',
      backdropFilter: 'blur(20px)',
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
            background: 'var(--beige-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#060b1a',
            boxShadow: 'var(--shadow-beige)'
          }}>
            <Music size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display" style={{
              fontSize: '1.2rem',
              fontWeight: '900',
              letterSpacing: '1px',
              color: 'var(--text-primary)'
            }}>
              GRUPO ELIADE
            </div>
            <div style={{
              fontSize: '0.72rem',
              letterSpacing: '1.8px',
              color: 'var(--beige-primary)',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              15 Anos de Gratidão
            </div>
          </div>
        </Link>

        {/* Resumo da data e local (visível em desktop/tablet) */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '16px',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }} className="header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} color="var(--beige-primary)" />
            <span>07 de Novembro &bull; 18h</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="var(--beige-primary)" />
            <span>Auditório Walkíria Lima</span>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/admin/scanner" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.82rem',
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            transition: 'all 0.2s'
          }}>
            <ShieldCheck size={16} />
            <span>Portaria</span>
          </Link>

          <a href="#ingressos" className="btn-primary" style={{
            padding: '10px 22px',
            fontSize: '0.92rem'
          }}>
            <Ticket size={18} />
            <span>Ingressos R$ 10</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 860px) {
          .header-info {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
