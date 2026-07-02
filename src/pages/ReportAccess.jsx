import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import BrandDots from '../components/BrandDots';
import { getReportBySlug } from '../data/reports';
import { useIsMobile } from '../hooks/useIsMobile';
import { supabase } from '../lib/customSupabaseClient';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setDevAccessCookie(slug) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `afiches_report_access_dev=${encodeURIComponent(slug)}; path=/; expires=${expires}; samesite=lax`;
}

async function requestAccess({ email, report }) {
  const response = await fetch('/api/request-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, slug: report.slug }),
  });

  const contentType = response.headers.get('content-type') || '';
  if (response.ok && contentType.includes('application/json')) {
    return response.json();
  }

  if (response.status !== 404 && contentType.includes('application/json')) {
    const body = await response.json();
    throw new Error(body.error || 'No pudimos guardar el mail.');
  }

  const { error } = await supabase.from('report_leads').insert({
    email,
    report_slug: report.slug,
    report_title: report.title,
    source_path: window.location.pathname,
    user_agent: navigator.userAgent,
  });
  if (error) throw new Error('No pudimos guardar el mail. Revisar la tabla report_leads en Supabase.');

  setDevAccessCookie(report.slug);
  return { fileUrl: report.fileUrl };
}

export default function ReportAccess() {
  const { slug } = useParams();
  const isMobile = useIsMobile();
  const report = getReportBySlug(slug);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const isValid = useMemo(() => EMAIL_RE.test(email.trim()), [email]);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');

    if (!report) return;
    if (!isValid) {
      setError('Escribi un mail valido para acceder al PDF.');
      return;
    }

    setStatus('loading');
    try {
      const result = await requestAccess({ email: email.trim().toLowerCase(), report });
      window.location.href = result.fileUrl || report.fileUrl;
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'No pudimos guardar el mail. Proba de nuevo.');
    }
  }

  if (!report) {
    return (
      <main style={{ minHeight: 'calc(100vh - 53px)', padding: isMobile ? '36px 20px' : '56px 48px', background: 'var(--bg)' }}>
        <Link to="/" style={{ color: 'var(--cream)', textDecoration: 'none', fontWeight: 900 }}>
          <ArrowLeft size={15} /> VOLVER
        </Link>
        <h1 style={{ marginTop: 56, color: 'var(--cream)', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900 }}>
          Estudio no encontrado.
        </h1>
      </main>
    );
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 53px)', background: 'var(--bg)', overflowX: 'clip' }}>
      <section style={{ padding: isMobile ? '30px 20px 48px' : '56px 48px 76px' }}>
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(340px, 0.72fr)',
            gap: 18,
            alignItems: 'stretch',
          }}
        >
          <section
            style={{
              background: report.cardColor,
              borderRadius: 20,
              padding: isMobile ? 24 : 36,
              color: '#F0EBE1',
              minHeight: isMobile ? 360 : 540,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: -30,
                top: 24,
                color: report.accentColor,
                opacity: 0.24,
                fontWeight: 900,
                fontSize: isMobile ? '8rem' : '13rem',
                lineHeight: 1,
              }}
            >
              {report.number}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.16)',
                    borderRadius: 9999,
                    padding: '7px 14px',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    letterSpacing: '0.16em',
                  }}
                >
                  ACCESO AL ESTUDIO
                </span>
                <BrandDots size={50} color="#F0EBE1" />
              </div>

              <div style={{ marginTop: isMobile ? 58 : 100, maxWidth: 700 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.18em', opacity: 0.72, marginBottom: 12 }}>
                  {report.category} / {report.period}
                </p>
                <h1 style={{ fontSize: 'clamp(2.35rem, 6vw, 6rem)', lineHeight: 0.94, fontWeight: 900, letterSpacing: '-0.05em' }}>
                  {report.title}
                </h1>
                <p style={{ marginTop: 20, color: 'rgba(240,235,225,0.78)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 620 }}>
                  {report.summary}
                </p>
              </div>
            </div>

            <Link
              to="/"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#F0EBE1',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                marginTop: 28,
              }}
            >
              <ArrowLeft size={15} /> VOLVER A REPORTES
            </Link>
          </section>

          <aside
            style={{
              background: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 18,
              padding: isMobile ? 22 : 28,
              color: 'var(--cream)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Mail size={30} color={report.accentColor} />
            <h2 style={{ marginTop: 18, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.05, fontWeight: 900 }}>
              Dejanos tu mail para abrir el PDF.
            </h2>
            <p style={{ marginTop: 14, color: 'rgba(240,235,225,0.62)', fontSize: '0.92rem', lineHeight: 1.65 }}>
              Guardamos el contacto asociado al estudio y habilitamos la descarga.
            </p>

            <form onSubmit={onSubmit} style={{ marginTop: 24, display: 'grid', gap: 12 }}>
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
                  border: '1px solid rgba(240,235,225,0.22)',
                  background: 'rgba(21,32,35,0.72)',
                  color: 'var(--cream)',
                  padding: '14px 16px',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
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
                <Download size={15} /> {status === 'loading' ? 'GUARDANDO...' : 'ABRIR PDF'}
              </button>
              {error ? <p style={{ color: '#F97316', fontSize: '0.82rem', lineHeight: 1.45 }}>{error}</p> : null}
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}
