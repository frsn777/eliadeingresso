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
  Zap
} from 'lucide-react';
import Link from 'next/link';

// Sintetizador de Som Nativo (Web Audio API) para feedback instantâneo sem arquivos externos
function playSound(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      // Tom agudo e agradável de sucesso (880Hz -> 1174Hz)
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
      // Tom grave de erro/alerta duplo (150Hz)
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
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerStats, setScannerStats] = useState({ scannedCount: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [autoReset, setAutoReset] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');

  const html5QrCodeRef = useRef(null);

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

  // Inicializa e gerencia a câmera do Android
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    let scannerInstance = null;

    async function initScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        // Lista câmeras traseiras e dianteiras disponíveis no Android
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setCameras(devices);
            // Procura câmera traseira ("back" / "rear" / "environment")
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
        console.warn('Erro ao inicializar leitor de câmera no Android:', err);
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
  }, [isAuthenticated, selectedCamera]);

  // Alternar Lanterna / Flash no Android
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

  // Processamento do Scan
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
          scannedBy: 'Portaria Android'
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
        // Vibração tátil no Android (1 vibração curta de sucesso)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(120);
        }
        if (soundEnabled) playSound('success');
        setScannerStats((prev) => ({ scannedCount: prev.scannedCount + 1 }));

        // Se auto-reset estiver ativo, volta a escanear após 2.5 segundos
        if (autoReset) {
          setTimeout(() => {
            setScanResult((curr) => (curr === data ? null : curr));
          }, 2500);
        }
      } else {
        // Vibração de erro no Android (2 vibrações intensas)
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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode) {
      handleTicketScanned(manualCode);
      setManualCode('');
    }
  };

  const resetScanResult = () => {
    setScanResult(null);
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle, #12151f 0%, #07080c 100%)'
      }}>
        <div className="glass-card gold-border-glow" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--gold-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-gold)'
            }}>
              <Smartphone size={28} />
            </div>
            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: '800' }}>
              Portaria Mobile
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Validador de ingressos para celular Android / iOS.
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
              <Lock size={18} /> Acessar Scanner
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07080c', padding: '16px 12px 60px' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        
        {/* Barra Superior de Controle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          background: 'rgba(255,255,255,0.03)',
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
            <ArrowLeft size={16} /> Início
          </Link>

          {/* Botões rápidos: Som, Lanterna, Modo Rápido */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Som Ligado' : 'Som Mudo'}
              style={{
                background: soundEnabled ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                color: soundEnabled ? 'var(--gold-light)' : 'var(--text-muted)',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={toggleTorch}
              title="Lanterna / Flash"
              style={{
                background: torchEnabled ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                color: torchEnabled ? 'var(--gold-light)' : 'var(--text-muted)',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Flashlight size={16} />
            </button>

            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--status-success)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              color: '#86efac',
              fontWeight: '700'
            }}>
              Entradas: {scannerStats.scannedCount}
            </div>
          </div>
        </div>

        {/* FEEDBACK DO SCAN (SE HOUVER) */}
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
                <div style={{ fontSize: '0.85rem', color: 'var(--gold-light)', marginTop: '4px' }}>
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
          /* MOLDURA DA CÂMERA DO ANDROID */
          <div className="glass-card gold-border-glow" style={{ padding: '16px', marginBottom: '16px' }}>
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

            {/* Seletor de Câmera se o Android tiver múltiplas lentes */}
            {cameras.length > 1 && (
              <div style={{ marginTop: '12px' }}>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(10, 12, 18, 0.9)',
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
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Digitação Manual (caso a tela do cliente esteja trincada):
          </div>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Código ou ID do ingresso"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{ padding: '10px 12px', fontSize: '0.85rem' }}
            />
            <button type="submit" disabled={isProcessing} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              Validar
            </button>
          </form>
        </div>

        {/* Dica de PWA / Atalho no Android */}
        <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.4' }}>
          💡 <strong>Dica para o dia do evento:</strong> Abra no Google Chrome do celular e toque em <strong>"Adicionar à tela inicial"</strong> para usar como um aplicativo de tela cheia.
        </div>

      </div>
    </div>
  );
}
