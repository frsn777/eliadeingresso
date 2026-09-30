'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Camera,
  CheckCircle,
  AlertOctagon,
  RefreshCw,
  Flashlight,
  Volume2,
  VolumeX,
  Smartphone,
  ArrowLeft,
  Search,
  Users,
  UserCheck,
  Clock,
  Check,
  UserX,
  Phone,
  QrCode
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
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn('Erro ao reproduzir áudio:', e);
  }
}

export default function AdminScannerPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Abas: 'camera' ou 'list'
  const [activeTab, setActiveTab] = useState('camera');

  // Scanner states
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [autoReset, setAutoReset] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const html5QrCodeRef = useRef(null);

  // Attendees list states
  const [attendees, setAttendees] = useState([]);
  const [attendeeStats, setAttendeeStats] = useState({ total: 0, used: 0, valid: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [manualCheckinLoadingId, setManualCheckinLoadingId] = useState(null);

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
        setAttendeeStats({
          total: data.total || 0,
          used: data.usedCount || 0,
          valid: data.validCount || 0
        });
      }
    } catch (err) {
      console.error('Erro ao buscar lista de participantes:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Carrega a lista ao autenticar ou mudar de aba
  useEffect(() => {
    if (isAuthenticated) {
      fetchAttendees();
    }
  }, [isAuthenticated, activeTab]);

  // Inicializa a câmera apenas quando estiver na aba 'camera'
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'camera') {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {}
      }
      return;
    }

    let isMounted = true;
    let scannerInstance = null;

    async function initScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setCameras(devices);
            const backCam = devices.find((d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('traseira') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
            );
            setSelectedCamera(backCam ? backCam.id : devices[0].id);
          }
        } catch (camErr) {
          console.warn('Câmeras não listadas diretamente:', camErr);
        }

        scannerInstance = new Html5Qrcode("reader");
        html5QrCodeRef.current = scannerInstance;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0
        };

        const cameraIdOrConfig = selectedCamera
          ? { deviceId: { exact: selectedCamera } }
          : { facingMode: "environment" };

        await scannerInstance.start(
          cameraIdOrConfig,
          config,
          (decodedText) => {
            handleTicketScanned(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.warn('Erro ao inicializar leitor de câmera:', err);
      }
    }

    initScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, [isAuthenticated, activeTab, selectedCamera]);

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current) return;
    try {
      const nextState = !torchEnabled;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }]
      });
      setTorchEnabled(nextState);
    } catch (e) {
      console.warn('Lanterna não suportada neste dispositivo:', e);
    }
  };

  const handleTicketScanned = async (ticketId) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticketId.trim(),
          password: password,
          scannedBy: 'Portaria Walkíria Lima'
        })
      });

      const data = await res.json();

      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('eliade_scanner_pass');
        setAuthError('Senha expirada ou inválida.');
        return;
      }

      setScanResult(data);

      if (data.success) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(120);
        }
        if (soundEnabled) playSound('success');
        fetchAttendees();

        if (autoReset) {
          setTimeout(() => {
            setScanResult((curr) => (curr === data ? null : curr));
          }, 2500);
        }
      } else {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        if (soundEnabled) playSound('error');
      }
    } catch (err) {
      console.error(err);
      if (soundEnabled) playSound('error');
      setScanResult({
        success: false,
        reason: 'NETWORK_ERROR',
        message: 'Erro de conexão com o servidor de validação.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Entrada Manual pela Lista de Presença
  const handleManualCheckIn = async (ticketId, attendeeName) => {
    if (manualCheckinLoadingId) return;
    setManualCheckinLoadingId(ticketId);

    try {
      const res = await fetch('/api/admin/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticketId,
          password: password,
          scannedBy: 'Entrada Manual por Lista'
        })
      });

      const data = await res.json();

      if (data.success) {
        if (soundEnabled) playSound('success');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(120);
        }
        // Atualiza a lista localmente
        setAttendees((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? { ...t, status: 'used', used_at: new Date().toISOString() }
              : t
          )
        );
        setAttendeeStats((prev) => ({
          ...prev,
          used: prev.used + 1,
          valid: Math.max(0, prev.valid - 1)
        }));
      } else {
        if (soundEnabled) playSound('error');
        alert(data.message || 'Não foi possível validar a entrada.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar entrada manual.');
    } finally {
      setManualCheckinLoadingId(null);
    }
  };

  const handleManualCodeSubmit = (e) => {
    e.preventDefault();
    if (manualCode) {
      handleTicketScanned(manualCode);
      setManualCode('');
    }
  };

  const resetScanResult = () => {
    setScanResult(null);
  };

  // Filtragem da Lista de Participantes
  const filteredAttendees = attendees.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (t.attendee_name && t.attendee_name.toLowerCase().includes(q)) ||
      (t.buyer_name && t.buyer_name.toLowerCase().includes(q)) ||
      (t.ticket_code && t.ticket_code.toLowerCase().includes(q)) ||
      (t.buyer_phone && t.buyer_phone.includes(q))
    );
  });

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
              <Smartphone size={28} />
            </div>
            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
              Portaria Walkíria Lima
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Validador de Ingressos & Lista de Presença &bull; Grupo Eliade
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="input-label">Senha de Portaria</label>
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
              <Lock size={18} /> Acessar Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060b1a', padding: '16px 12px 60px' }}>
      <div className="container" style={{ maxWidth: '620px' }}>
        
        {/* Barra Superior de Controle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          background: 'rgba(255,255,255,0.04)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.82rem'
          }}>
            <ArrowLeft size={16} /> Site
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Som Ligado' : 'Som Mudo'}
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

            {activeTab === 'camera' && (
              <button
                onClick={toggleTorch}
                title="Lanterna / Flash"
                style={{
                  background: torchEnabled ? 'rgba(244, 237, 228, 0.25)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: torchEnabled ? 'var(--beige-light)' : 'var(--text-muted)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Flashlight size={16} />
              </button>
            )}

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

        {/* Resumo de Presença */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'rgba(14, 26, 58, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Ingressos</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
              {attendeeStats.total}
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#86efac', textTransform: 'uppercase' }}>Presentes</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#86efac', marginTop: '2px' }}>
              {attendeeStats.used}
            </div>
          </div>

          <div style={{
            background: 'rgba(244, 237, 228, 0.08)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--beige-primary)', textTransform: 'uppercase' }}>Restantes</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--beige-warm)', marginTop: '2px' }}>
              {attendeeStats.valid}
            </div>
          </div>
        </div>

        {/* SELETOR DE ABAS: CÂMERA vs LISTA DE PRESENÇA */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '16px',
          background: 'rgba(255,255,255,0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('camera')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'camera' ? 'var(--beige-gradient)' : 'transparent',
              color: activeTab === 'camera' ? '#060b1a' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Camera size={16} /> Leitor QR Code
          </button>

          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'list' ? 'var(--beige-gradient)' : 'transparent',
              color: activeTab === 'list' ? '#060b1a' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} /> Lista de Presença ({attendees.length})
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: SCANNER DE CÂMERA */}
        {activeTab === 'camera' && (
          <div>
            {/* FEEDBACK DO SCAN */}
            {scanResult ? (
              <div className="glass-card" style={{
                padding: '28px 20px',
                textAlign: 'center',
                borderColor: scanResult.success ? 'var(--status-success)' : 'var(--status-error)',
                background: scanResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                marginBottom: '16px',
                boxShadow: scanResult.success ? '0 0 35px rgba(16, 185, 129, 0.3)' : '0 0 35px rgba(239, 68, 68, 0.3)'
              }}>
                {scanResult.success ? (
                  <div>
                    <div style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.25)',
                      border: '2px solid var(--status-success)',
                      color: 'var(--status-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}>
                      <CheckCircle size={40} />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#86efac' }}>
                      ENTRADA LIBERADA!
                    </div>
                    <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>
                      {scanResult.ticket?.attendee_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--beige-primary)', marginTop: '4px' }}>
                      Código: {scanResult.ticket?.ticket_code}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.25)',
                      border: '2px solid var(--status-error)',
                      color: 'var(--status-error)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}>
                      <AlertOctagon size={40} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fca5a5' }}>
                      {scanResult.reason === 'ALREADY_USED' ? 'INGRESSO JÁ UTILIZADO!' : 'ENTRADA NÃO AUTORIZADA!'}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                      {scanResult.message}
                    </p>
                    {scanResult.ticket && (
                      <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <strong>Titular:</strong> {scanResult.ticket.attendee_name} <br />
                        <strong>Usado em:</strong> {new Date(scanResult.ticket.used_at).toLocaleTimeString('pt-BR')}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={resetScanResult}
                  className="btn-primary"
                  style={{ marginTop: '20px', width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  <RefreshCw size={18} /> Escanear Próximo
                </button>
              </div>
            ) : (
              /* MOLDURA DA CÂMERA */
              <div className="glass-card beige-border-glow" style={{ padding: '16px', marginBottom: '16px', background: '#0a1329' }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '300px',
                  background: '#000',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div id="reader" style={{ width: '100%' }}></div>
                  <div className="scanner-laser" />
                </div>

                {cameras.length > 1 && (
                  <div style={{ marginTop: '12px' }}>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'rgba(10, 19, 42, 0.95)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {cameras.map((cam) => (
                        <option key={cam.id} value={cam.id}>
                          📷 {cam.label || `Câmera ${cam.id.substring(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* VALIDAÇÃO MANUAL / DIGITAÇÃO */}
            <div className="glass-card" style={{ padding: '16px', background: '#0a1329' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Digitação Rápida do Código do Ingresso:
              </div>
              <form onSubmit={handleManualCodeSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: ELI-X8Y9Z-1 ou ID"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  style={{ padding: '10px 12px', fontSize: '0.85rem' }}
                />
                <button type="submit" disabled={isProcessing} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  Validar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: LISTA DE PRESENÇA & BUSCA POR NOME */}
        {activeTab === 'list' && (
          <div>
            {/* Campo de Busca */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Buscar por nome do convidado, comprador ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '42px', fontSize: '0.9rem' }}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Dica da Lista */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Exibindo {filteredAttendees.length} de {attendees.length} participantes</span>
              <span style={{ color: 'var(--beige-primary)' }}>💡 Caso o convidado perca o ingresso</span>
            </div>

            {/* Lista de Participantes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredAttendees.length === 0 ? (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum participante encontrado com &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredAttendees.map((t) => {
                  const isUsed = t.status === 'used';
                  const isLoadingThis = manualCheckinLoadingId === t.id;

                  return (
                    <div key={t.id} className="glass-card" style={{
                      padding: '14px 16px',
                      background: isUsed ? 'rgba(16, 185, 129, 0.06)' : 'rgba(14, 26, 58, 0.75)',
                      border: isUsed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '800', fontSize: '1.02rem', color: isUsed ? '#86efac' : '#ffffff' }}>
                            {t.attendee_name}
                          </span>
                          {isUsed && (
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#86efac',
                              fontWeight: '700',
                              border: '1px solid var(--status-success)'
                            }}>
                              ENTROU
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          Comprado por: <strong>{t.buyer_name}</strong> {t.buyer_phone ? `(${t.buyer_phone})` : ''}
                        </div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--beige-primary)', marginTop: '2px' }}>
                          Código: {t.ticket_code} &bull; ID: {t.id.substring(0, 8)}...
                          {t.used_at && ` • Entrada às ${new Date(t.used_at).toLocaleTimeString('pt-BR')}`}
                        </div>
                      </div>

                      <div>
                        {isUsed ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--status-success)',
                            fontSize: '0.82rem',
                            fontWeight: '700'
                          }}>
                            <Check size={16} /> Entrada Validada
                          </div>
                        ) : (
                          <button
                            onClick={() => handleManualCheckIn(t.id, t.attendee_name)}
                            disabled={isLoadingThis}
                            className="btn-primary"
                            style={{
                              padding: '8px 16px',
                              fontSize: '0.82rem',
                              background: 'var(--beige-gradient)'
                            }}
                          >
                            <UserCheck size={14} />
                            <span>{isLoadingThis ? 'Validando...' : 'Liberar Entrada'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
