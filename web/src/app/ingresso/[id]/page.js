'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Music, Calendar, Clock, MapPin, Printer, ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, Download, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function TicketPage() {
  const params = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/tickets/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.ticket) {
          setTicket(data.ticket);
        } else {
          setError(data.error || 'Ingresso não encontrado.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Erro ao carregar os dados do ingresso.');
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  // Gera e baixa a IMAGEM COMPLETA DO INGRESSO (Cartão Oficial PNG em Alta Resolução)
  const handleDownloadCardImage = () => {
    if (!ticket?.qrCodeImage || isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = 800;
      const height = 1140;
      canvas.width = width;
      canvas.height = height;

      // Fundo Gradiente Azul Marinho Nobre
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#060b1a');
      grad.addColorStop(0.5, '#0f1c3d');
      grad.addColorStop(1, '#060b1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Moldura Dourada / Bege
      ctx.strokeStyle = '#e8dcce';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.strokeStyle = 'rgba(244, 237, 228, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Cabeçalho
      ctx.textAlign = 'center';
      ctx.fillStyle = '#faf6f0';
      ctx.font = 'bold 36px "Cinzel", Georgia, serif';
      ctx.fillText('GRUPO ELIADE', width / 2, 110);

      ctx.fillStyle = '#e8dcce';
      ctx.font = 'bold 18px "Outfit", Arial, sans-serif';
      ctx.fillText('CULTO MUSICAL DE GRATIDÃO • 15 ANOS', width / 2, 148);

      // Linha divisória
      ctx.strokeStyle = 'rgba(232, 220, 206, 0.35)';
      ctx.beginPath();
      ctx.setLineDash([8, 8]);
      ctx.moveTo(80, 185);
      ctx.lineTo(width - 80, 185);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nome do Portador
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '15px "Outfit", Arial, sans-serif';
      ctx.fillText('PARTICIPANTE / PORTADOR', width / 2, 230);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px "Outfit", Arial, sans-serif';
      ctx.fillText(ticket.attendee_name || 'Convidado', width / 2, 280);

      // Caixa de Informações
      ctx.fillStyle = 'rgba(6, 11, 26, 0.85)';
      ctx.fillRect(70, 320, width - 140, 110);
      ctx.strokeStyle = 'rgba(232, 220, 206, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(70, 320, width - 140, 110);

      // Informações internas
      ctx.fillStyle = '#e8dcce';
      ctx.font = 'bold 14px "Outfit", Arial, sans-serif';
      ctx.fillText('DATA', 190, 355);
      ctx.fillText('HORÁRIO', width / 2, 355);
      ctx.fillText('LOCAL', width - 190, 355);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Outfit", Arial, sans-serif';
      ctx.fillText('07/Nov/2026', 190, 395);
      ctx.fillText('18:00h', width / 2, 395);
      ctx.fillText('Walkíria Lima', width - 190, 395);

      // Carrega imagem do QR Code
      const qrImg = new window.Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        const qrBoxSize = 350;
        const qrBoxX = (width - qrBoxSize) / 2;
        const qrBoxY = 465;

        // Fundo branco do QR
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
        ctx.strokeStyle = '#e8dcce';
        ctx.lineWidth = 3;
        ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

        // Imagem do QR Code
        const qrPadding = 18;
        ctx.drawImage(
          qrImg,
          qrBoxX + qrPadding,
          qrBoxY + qrPadding,
          qrBoxSize - qrPadding * 2,
          qrBoxSize - qrPadding * 2
        );

        // Código do Ingresso
        ctx.fillStyle = '#faf6f0';
        ctx.font = 'bold 24px "Outfit", Arial, sans-serif';
        ctx.fillText(`Código: ${ticket.ticket_code}`, width / 2, 875);

        // Informações de Validação
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px "Outfit", Arial, sans-serif';
        ctx.fillText('Apresente este QR Code na portaria do evento', width / 2, 920);

        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 18px "Outfit", Arial, sans-serif';
        ctx.fillText('✓ Ingresso Oficial Individual', width / 2, 960);

        // Rodapé
        ctx.fillStyle = 'rgba(232, 220, 206, 0.5)';
        ctx.font = '14px "Outfit", Arial, sans-serif';
        ctx.fillText('Auditório do Centro de Educação Profissional de Música Walkíria Lima', width / 2, 1040);

        // Trigger Download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `ingresso-eliade-${ticket.attendee_name?.toLowerCase().replace(/\s+/g, '-') || 'oficial'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsGeneratingImage(false);
      };
      qrImg.src = ticket.qrCodeImage;
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      setIsGeneratingImage(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060b1a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '44px',
            height: '44px',
            border: '3px solid rgba(244, 237, 228, 0.2)',
            borderTopColor: 'var(--beige-primary)',
            borderRadius: '50%',
            animation: 'spin 1s infinite linear',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Carregando seu ingresso oficial...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#060b1a' }}>
        <div className="glass-card" style={{ maxWidth: '440px', padding: '36px', textAlign: 'center' }}>
          <AlertTriangle size={48} color="var(--status-error)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#ffffff' }}>Ingresso Não Encontrado</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
          <Link href="/" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const isUsed = ticket.status === 'used';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, #0f1c3d 0%, #060b1a 100%)',
      padding: '40px 20px 80px'
    }} className="ticket-page-root">
      <div className="container" style={{ maxWidth: '640px' }}>
        
        {/* Aviso de Orientação no topo */}
        <div className="no-print" style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fef3c7',
          fontSize: '0.86rem'
        }}>
          <AlertCircle size={20} color="#fbbf24" style={{ flexShrink: 0 }} />
          <div>
            <strong>Salve seu ingresso:</strong> Baixe a imagem do ingresso completo na sua galeria ou salve o PDF para apresentar no dia 07/Nov.
          </div>
        </div>

        {/* Barra superior de ações */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}>
            <ArrowLeft size={16} /> Página Inicial
          </Link>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadCardImage}
              disabled={isGeneratingImage}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              <ImageIcon size={15} />
              <span>{isGeneratingImage ? 'Gerando Imagem...' : 'Salvar Imagem do Ingresso'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.84rem' }}
            >
              <Printer size={15} /> Baixar / Imprimir PDF
            </button>
          </div>
        </div>

        {/* CARTÃO DO INGRESSO OFICIAL */}
        <div className="ticket-stub print-ticket" style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(244, 237, 228, 0.15)'
        }}>
          {/* Topo do Ingresso */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(244, 237, 228, 0.1), rgba(6, 11, 26, 0.8))',
            padding: '24px 30px',
            borderBottom: '1px dashed var(--border-beige)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--beige-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060b1a'
              }}>
                <Music size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-display" style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff' }}>
                  GRUPO ELIADE
                </h1>
                <div style={{ fontSize: '0.72rem', color: 'var(--beige-primary)', fontWeight: '700', letterSpacing: '1px' }}>
                  CULTO MUSICAL DE GRATIDÃO &bull; 15 ANOS
                </div>
              </div>
            </div>

            <div style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: isUsed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: `1px solid ${isUsed ? 'var(--status-error)' : 'var(--status-success)'}`,
              color: isUsed ? '#fca5a5' : '#86efac',
              fontSize: '0.78rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {isUsed ? (
                <>
                  <AlertTriangle size={14} /> ENTRADA UTILIZADA
                </>
              ) : (
                <>
                  <CheckCircle size={14} /> INGRESSO VÁLIDO
                </>
              )}
            </div>
          </div>

          {/* Corpo do Ingresso */}
          <div style={{ padding: '28px 30px' }}>
            <div style={{ marginBottom: '22px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Participante / Portador
              </span>
              <div className="font-display" style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--beige-warm)', marginTop: '2px' }}>
                {ticket.attendee_name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Código do Ingresso: <strong style={{ color: '#ffffff' }}>{ticket.ticket_code}</strong>
              </div>
            </div>

            {/* Detalhes do Evento */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '14px',
              padding: '16px',
              background: 'rgba(6, 11, 26, 0.65)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="var(--beige-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>DATA</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>07/Nov/2026</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="var(--beige-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>HORÁRIO</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>18:00h</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={18} color="var(--beige-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>LOCAL</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>Auditório Walkíria Lima</div>
                </div>
              </div>
            </div>

            {/* QR CODE PARA APRESENTAR NA ENTRADA */}
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              width: '230px',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
            }}>
              {ticket.qrCodeImage && (
                <img
                  src={ticket.qrCodeImage}
                  alt="QR Code de Validação"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              )}
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Apresente este QR Code na portaria do Auditório Walkíria Lima (pelo celular ou impresso).
            </p>
          </div>

          {/* Rodapé do Ingresso */}
          <div style={{
            padding: '14px 30px',
            background: 'rgba(4, 7, 18, 0.7)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--beige-primary)" />
              Ingresso Oficial &bull; Grupo Eliade
            </div>
            <div>ID: {ticket.id.substring(0, 8)}...</div>
          </div>
        </div>

      </div>

      {/* Estilos para Impressão / Salvar PDF Limpo */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .ticket-page-root {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .print-ticket {
            box-shadow: none !important;
            border: 2px solid #000 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-ticket * {
            color: #000000 !important;
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
