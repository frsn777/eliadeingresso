'use client';

import React, { useState, useEffect } from 'react';

export default function Countdown({ targetDate = '2026-11-07T18:00:00' }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'DIAS', value: timeLeft.days },
    { label: 'HORAS', value: timeLeft.hours },
    { label: 'MINUTOS', value: timeLeft.minutes },
    { label: 'SEGUNDOS', value: timeLeft.seconds }
  ];

  return (
    <div style={{
      display: 'inline-flex',
      gap: '12px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: '28px'
    }}>
      {units.map((unit, idx) => (
        <div key={idx} style={{
          background: 'rgba(14, 26, 58, 0.85)',
          border: '1px solid var(--border-beige)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          minWidth: '85px',
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div className="font-display text-beige-gradient" style={{
            fontSize: '1.9rem',
            fontWeight: '800',
            lineHeight: 1
          }}>
            {String(unit.value).padStart(2, '0')}
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-secondary)',
            fontWeight: '700',
            letterSpacing: '1.5px',
            marginTop: '6px'
          }}>
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
