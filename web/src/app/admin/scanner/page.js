'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  UserCheck,
  Undo2,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  Lock,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Phone,
  Mail,
  Filter
} from 'lucide-react';
import Link from 'next/link';

// Sintetizador de Som Nativo (Web Audio API)
function playSound(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.warn('Erro ao reproduzir áudio:', e);
  }
}

export default function AdminAttendeesPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Attendees list states
  const [attendees, setAttendees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'used'
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Recupera autenticação prévia da sessão
  useEffect(() => {
    const savedPass = sessionStorage.getItem('eliade_scanner_pass');
    if (savedPass) {
      setPassword(savedPass);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!password) {
      setAuthError('Digite a senha da portaria.');
      return;
    }
    sessionStorage.setItem('eliade_scanner_pass', password);
    setIsAuthenticated(true);
  };

  // Carrega a lista de participantes
  const fetchAttendees = async () => {
    if (!password) return;
    setIsLoadingList(true);
    try {
      const res = await fetch(`/api/admin/attendees?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAttendees(data.tickets || []);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('eliade_scanner_pass');
        setAuthError('Senha inválida.');
      }
    } catch (err) {
      console.error('Erro ao buscar lista de participantes:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAttendees();
    }
  }, [isAuthenticated]);

  // Ação de Liberar Entrada (Check-In)
  const handleCheckIn = async (ticketId) => {
    if (actionLoadingId) return;
    setActionLoadingId(ticketId);

    try {
      const res = await fetch('/api/admin/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          password,
          action: 'checkin',
          scannedBy: 'Portaria Walkíria Lima'
        })
      });

      const data = await res.json();

      if (data.success) {
        if (soundEnabled) playSound('success');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(100);
        }
        setAttendees((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? { ...t, status: 'used', used_at: new Date().toISOString() }
              : t
          )
        );
      } else {
        alert(data.message || 'Não foi possível registrar a entrada.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar entrada.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Ação de Desfazer Entrada (Undo)
  const handleUndoCheckIn = async (ticketId) => {
    if (actionLoadingId) return;
    setActionLoadingId(ticketId);

    try {
      const res = await fetch('/api/admin/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          password,
          action: 'undo'
        })
      });

      const data = await res.json();

      if (data.success) {
        if (soundEnabled) playSound('undo');
        setAttendees((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? { ...t, status: 'valid', used_at: null }
              : t
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao desfazer entrada.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Exportar para CSV / Excel
  const handleExportCSV = () => {
    if (attendees.length === 0) return;

    const headers = ['Nome do Participante', 'Status Entrada', 'Horário Entrada', 'Comprador', 'Telefone', 'Email', 'Codigo'];
    const rows = attendees.map((t) => [
      `"${t.attendee_name || ''}"`,
      `"${t.status === 'used' ? 'PRESENTE' : 'AGUARDANDO'}"`,
      `"${t.used_at ? new Date(t.used_at).toLocaleTimeString('pt-BR') : '-'}"`,
      `"${t.buyer_name || ''}"`,
      `"${t.buyer_phone || ''}"`,
      `"${t.buyer_email || ''}"`,
      `"${t.ticket_code || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lista-presenca-eliade-15-anos-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtragem e Busca
  const filteredAttendees = attendees.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || (
      (t.attendee_name && t.attendee_name.toLowerCase().includes(q)) ||
      (t.buyer_name && t.buyer_name.toLowerCase().includes(q)) ||
      (t.buyer_phone && t.buyer_phone.includes(q)) ||
      (t.ticket_code && t.ticket_code.toLowerCase().includes(q))
    );

    if (!matchesQuery) return false;

    if (filterStatus === 'used') return t.status === 'used';
    if (filterStatus === 'pending') return t.status === 'valid';
    return true;
  });

  // Estatísticas
  const totalCount = attendees.length;
  const usedCount = attendees.filter((t) => t.status === 'used').length;
  const pendingCount = totalCount - usedCount;

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle, #0f1c3d 0%, #060b1a 100%)'
      }}>
        <div className="glass-card beige-border-glow" style={{ maxWidth: '400px', width: '100%', padding: '32px', background: '#0a1329' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--beige-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#060b1a',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-beige)'
            }}>
              <Users size={28} />
            </div>
            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
              Portaria Walkíria Lima
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Lista Oficial de Entrada &bull; Grupo Eliade 15 Anos
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="input-label">Senha da Portaria</label>
              <input
                type="password"
                className="input-field"
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            {authError && (
              <div style={{ color: '#fca5a5', fontSize: '0.85rem' }}>{authError}</div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Lock size={18} /> Acessar Lista de Entrada
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060b1a', padding: '16px 12px 60px' }} className="admin-list-root">
      <div className="container" style={{ maxWidth: '820px' }}>
        
        {/* Barra Superior de Controle */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          background: 'rgba(255,255,255,0.04)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.84rem'
          }}>
            <ArrowLeft size={16} /> Site Oficial
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Som Ativado' : 'Sem Som'}
              style={{
                background: soundEnabled ? 'rgba(244, 237, 228, 0.15)' : 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                color: soundEnabled ? 'var(--beige-light)' : 'var(--text-muted)',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={handleExportCSV}
              title="Baixar Planilha CSV"
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <FileSpreadsheet size={15} /> Exportar CSV
            </button>

            <button
              onClick={() => window.print()}
              title="Imprimir Lista Completa"
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Printer size={15} /> Imprimir Lista
            </button>

            <button
              onClick={fetchAttendees}
              disabled={isLoadingList}
              title="Atualizar Dados"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} className={isLoadingList ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Cabeçalho do Painel */}
        <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 className="font-display" style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
            Portaria & Lista Oficial de Entrada
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
            Culto 15 Anos Grupo Eliade &bull; Auditório Walkíria Lima &bull; 07/Nov
          </p>
        </div>

        {/* Resumo de Presença / Contadores */}
        <div className="no-print" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'rgba(14, 26, 58, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
              Total na Lista
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
              {totalCount}
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.74rem', color: '#86efac', textTransform: 'uppercase', fontWeight: '700' }}>
              Entraram
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#86efac', marginTop: '2px' }}>
              {usedCount}
            </div>
          </div>

          <div style={{
            background: 'rgba(244, 237, 228, 0.08)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--beige-primary)', textTransform: 'uppercase', fontWeight: '700' }}>
              Aguardando
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: '900', color: 'var(--beige-warm)', marginTop: '2px' }}>
              {pendingCount}
            </div>
          </div>
        </div>

        {/* Busca e Filtros Rápidos */}
        <div className="no-print" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Campo de Busca Instantânea */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Digite o nome do participante ou comprador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '44px', fontSize: '0.95rem' }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.82rem'
                }}
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtros de Status */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                background: filterStatus === 'all' ? 'var(--beige-gradient)' : 'rgba(255,255,255,0.04)',
                color: filterStatus === 'all' ? '#060b1a' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Todos ({totalCount})
            </button>

            <button
              onClick={() => setFilterStatus('pending')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                background: filterStatus === 'pending' ? 'var(--beige-gradient)' : 'rgba(255,255,255,0.04)',
                color: filterStatus === 'pending' ? '#060b1a' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Aguardando Entrada ({pendingCount})
            </button>

            <button
              onClick={() => setFilterStatus('used')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                background: filterStatus === 'used' ? 'var(--beige-gradient)' : 'rgba(255,255,255,0.04)',
                color: filterStatus === 'used' ? '#060b1a' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Já Entraram ({usedCount})
            </button>
          </div>
        </div>

        {/* LISTAGEM DE NOMES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredAttendees.length === 0 ? (
            <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum participante encontrado para &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredAttendees.map((t, idx) => {
              const isUsed = t.status === 'used';
              const isLoadingThis = actionLoadingId === t.id;

              return (
                <div key={t.id || idx} className="glass-card attendee-item-card" style={{
                  padding: '14px 18px',
                  background: isUsed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(14, 26, 58, 0.85)',
                  border: isUsed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '1.08rem',
                        fontWeight: '800',
                        color: isUsed ? '#86efac' : '#ffffff'
                      }}>
                        {t.attendee_name}
                      </span>

                      {isUsed && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(16, 185, 129, 0.25)',
                          color: '#86efac',
                          fontWeight: '700',
                          border: '1px solid var(--status-success)'
                        }}>
                          ENTROU
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Comprador: <strong>{t.buyer_name}</strong> {t.buyer_phone ? `\u2022 Tel: ${t.buyer_phone}` : ''}
                    </div>

                    {isUsed && t.used_at && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--beige-primary)', marginTop: '2px' }}>
                        Entrada liberada às {new Date(t.used_at).toLocaleTimeString('pt-BR')}
                      </div>
                    )}
                  </div>

                  <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isUsed ? (
                      <>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--status-success)',
                          fontSize: '0.84rem',
                          fontWeight: '700',
                          padding: '6px 12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '8px'
                        }}>
                          <CheckCircle size={16} /> Liberado
                        </div>

                        <button
                          onClick={() => handleUndoCheckIn(t.id)}
                          disabled={isLoadingThis}
                          title="Desmarcar entrada"
                          style={{
                            background: 'none',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Undo2 size={13} /> Desfazer
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(t.id)}
                        disabled={isLoadingThis}
                        className="btn-primary"
                        style={{
                          padding: '9px 20px',
                          fontSize: '0.86rem',
                          background: 'var(--beige-gradient)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <UserCheck size={16} />
                        <span>{isLoadingThis ? 'Liberando...' : 'Liberar Entrada'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ESTILOS DE IMPRESSÃO LIMPOS PARA PRANCHETA A4 */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          .admin-list-root {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .attendee-item-card {
            background: #ffffff !important;
            border-bottom: 1px solid #ddd !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            color: #000000 !important;
            padding: 8px 0 !important;
            box-shadow: none !important;
          }
          .attendee-item-card * {
            color: #000000 !important;
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
