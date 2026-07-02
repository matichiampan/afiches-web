import React, { useMemo, useState } from 'react';
import { Mail, X } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ReportAccessModal({ report, onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const isValid = useMemo(() => EMAIL_RE.test(email.trim()), [email]);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');

    if (!isValid) {
      setError('Escribi un mail valido para abrir el estudio.');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/request-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), slug: report.slug }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || 'No pudimos guardar el mail.');
      }

      window.location.href = body.fileUrl || report.fileUrl;
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'No pudimos guardar el mail. Proba de nuevo.');
    }
  }

  if (!report) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(21,32,35,0.78)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: 'min(520px, 100%)',
          background: '#F0EBE1',
          color: '#152023',
          borderRadius: 18,
          padding: 24,
          boxShadow: '0 24px 70px rgba(0,0,0,0.32)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
          <div>
            <p style={{ color: report.cardColor, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.16em', marginBottom: 10 }}>
              ACCESO AL ESTUDIO
            </p>
            <h3 style={{ fontSize: '1.8rem', lineHeight: 1.05, fontWeight: 900 }}>
              Dejanos tu mail para abrir el PDF.
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              border: 0,
              background: 'rgba(21,32,35,0.08)',
              color: '#152023',
              borderRadius: 9999,
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flex: '0 0 auto',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ marginTop: 14, color: 'rgba(21,32,35,0.68)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          {report.title}. Guardamos el contacto asociado al estudio y despues habilitamos el PDF.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 22, display: 'grid', gap: 11 }}>
          <label style={{ display: 'grid', gap: 8, fontSize: '0.76rem', fontWeight: 900, letterSpacing: '0.08em' }}>
            MAIL
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
              style={{
                width: '100%',
                borderRadius: 9999,
                border: '1px solid rgba(21,32,35,0.18)',
                background: '#fff',
                color: '#152023',
                padding: '14px 16px',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 0,
              borderRadius: 9999,
              background: report.accentColor,
              color: '#152023',
              padding: '14px 18px',
              fontSize: '0.78rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              cursor: status === 'loading' ? 'wait' : 'pointer',
              opacity: status === 'loading' ? 0.72 : 1,
            }}
          >
            <Mail size={15} /> {status === 'loading' ? 'GUARDANDO...' : 'ABRIR ESTUDIO'}
          </button>

          {error ? <p style={{ color: '#BE123C', fontSize: '0.82rem', lineHeight: 1.45 }}>{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
