import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Download, FileText, Mail, X } from 'lucide-react';
import SectionIntro from '../components/SectionIntro';
import BrandDots from '../components/BrandDots';
import { reports } from '../data/reports';
import { useLang } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';

const SERVICE_STYLES = [
  { bg: '#7C3AED', color: '#F0EBE1', accent: '#22D46A' },
  { bg: '#BAE6FD', color: '#152023', accent: '#7C3AED' },
  { bg: '#F97316', color: '#152023', accent: '#7C3AED' },
  { bg: '#DDD6FE', color: '#152023', accent: '#F97316' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ReportAccessModal({ report, onClose }) {
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

function ReportStats({ stats, dark = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            borderRadius: 12,
            padding: '10px 12px',
            background: dark ? 'rgba(21,32,35,0.35)' : 'rgba(255,255,255,0.09)',
            border: dark ? '1px solid rgba(21,32,35,0.12)' : '1px solid rgba(255,255,255,0.08)',
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', opacity: 0.55 }}>
            {stat.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 'clamp(1rem, 1.7vw, 1.35rem)', fontWeight: 900, lineHeight: 1.05 }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedReport({ report, labels, isMobile, onRequestAccess }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: report.cardColor,
        borderRadius: 18,
        padding: isMobile ? 24 : 34,
        minHeight: isMobile ? 420 : 520,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        color: '#F0EBE1',
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: isMobile ? -28 : -34,
          top: isMobile ? 44 : 28,
          fontSize: isMobile ? '8rem' : '11rem',
          fontWeight: 900,
          lineHeight: 1,
          color: report.accentColor,
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      >
        {report.number}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <span
            style={{
              background: 'rgba(255,255,255,0.16)',
              color: '#F0EBE1',
              borderRadius: 9999,
              padding: '7px 14px',
              fontSize: '0.68rem',
              fontWeight: 900,
              letterSpacing: '0.16em',
            }}
          >
            {labels.featured}
          </span>
          <BarChart3 size={28} color="#F0EBE1" opacity={0.72} />
        </div>

        <div style={{ marginTop: isMobile ? 58 : 92, maxWidth: 620 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.18em', opacity: 0.7, marginBottom: 12 }}>
            {report.category} / {report.period}
          </p>
          <h3 style={{ fontSize: 'clamp(2.1rem, 5.2vw, 4.8rem)', lineHeight: 0.98, fontWeight: 900, letterSpacing: '-0.04em' }}>
            {report.title}
          </h3>
          <p style={{ marginTop: 18, maxWidth: 560, color: 'rgba(240,235,225,0.76)', lineHeight: 1.65, fontSize: '0.98rem', overflowWrap: 'break-word' }}>
            {report.summary}
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ReportStats stats={report.teaserStats} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link
            to={`/reportes/${report.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#F0EBE1',
              color: '#152023',
              borderRadius: 9999,
              padding: '13px 20px',
              fontSize: '0.78rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            {labels.dashboard} <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            onClick={() => onRequestAccess(report)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#F0EBE1',
              border: '2px solid rgba(240,235,225,0.48)',
              borderRadius: 9999,
              padding: '11px 18px',
              fontSize: '0.78rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <Download size={15} /> {labels.download}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function ReportCard({ report, labels, index, onRequestAccess }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.055)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 16,
        padding: 20,
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'var(--cream)',
        minWidth: 0,
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 22 }}>
          <span
            style={{
              background: report.cardColor,
              color: '#F0EBE1',
              borderRadius: 9999,
              padding: '5px 10px',
              fontSize: '0.62rem',
              fontWeight: 900,
              letterSpacing: '0.14em',
            }}
          >
            {report.category}
          </span>
          <FileText size={22} color={report.accentColor} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.12, marginBottom: 10 }}>
          {report.title}
        </h3>
        <p style={{ color: 'rgba(240,235,225,0.58)', fontSize: '0.84rem', lineHeight: 1.55 }}>
          {report.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22 }}>
        <ReportStats stats={report.teaserStats} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link
            to={`/reportes/${report.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: report.accentColor,
              color: '#152023',
              borderRadius: 9999,
              padding: '9px 13px',
              fontSize: '0.68rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            {labels.dashboard}
          </Link>
          <button
            type="button"
            onClick={() => onRequestAccess(report)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--cream)',
              border: '1.5px solid rgba(240,235,225,0.28)',
              borderRadius: 9999,
              padding: '8px 12px',
              fontSize: '0.68rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <Download size={13} /> PDF
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function ServiceRail({ labels, services }) {
  return (
    <aside
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 18,
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
        <div>
          <p style={{ color: '#22D46A', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.18em', marginBottom: 8 }}>
            {labels.servicesEyebrow}
          </p>
          <h3 style={{ color: 'var(--cream)', fontSize: 'clamp(1.2rem, 1.8vw, 1.55rem)', fontWeight: 900, lineHeight: 1.08 }}>
            {labels.servicesTitle}
          </h3>
        </div>
        <BrandDots size={44} color="#F97316" />
      </div>

      <p style={{ color: 'rgba(240,235,225,0.58)', fontSize: '0.86rem', lineHeight: 1.65, marginBottom: 18 }}>
        {labels.servicesBody}
      </p>

      <div style={{ display: 'grid', gap: 10 }}>
        {services.map((service, index) => {
          const style = SERVICE_STYLES[index % SERVICE_STYLES.length];
          return (
            <motion.div
              key={service.label}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: style.bg,
                color: style.color,
                borderRadius: 14,
                padding: 16,
                minHeight: 126,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '1rem', lineHeight: 1.05, fontWeight: 900, whiteSpace: 'pre-line' }}>
                  {service.label}
                </h4>
                <span style={{ color: style.accent, fontSize: '0.72rem', fontWeight: 900 }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p style={{ marginTop: 14, fontSize: '0.78rem', lineHeight: 1.5, opacity: 0.74 }}>
                {service.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </aside>
  );
}

export default function OpenData() {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const [selectedReport, setSelectedReport] = useState(null);
  const featured = reports[0];
  const secondaryReports = reports.slice(1);
  const labels = {
    sectionTitle: t.reports?.sectionTitle || 'Reportes',
    eyebrow: t.reports?.eyebrow || 'REPORTES + SERVICIOS',
    headline: t.reports?.headline || 'Reportes que muestran como investigamos, medimos y leemos el presente.',
    body: t.reports?.body || 'Cada informe funciona como una muestra concreta de nuestras capacidades: diseno de estudios, campo, lectura cualitativa, analisis de datos y comunicacion estrategica.',
    featured: t.reports?.featured || 'ULTIMO INFORME',
    dashboard: t.reports?.dashboard || 'VER DASHBOARD',
    download: t.reports?.download || 'DESCARGAR PDF',
    servicesEyebrow: t.reports?.servicesEyebrow || 'QUE HACEMOS',
    servicesTitle: t.reports?.servicesTitle || 'Servicios conectados a datos reales',
    servicesBody: t.reports?.servicesBody || 'Los reportes son la evidencia publica del trabajo: investigacion, medicion, analisis y estrategia aplicada.',
  };

  return (
    <div style={{ background: 'var(--bg)' }}>
      <SectionIntro number="03" title={labels.sectionTitle} accent="#22D46A" marqueeColor="#22D46A" />

      <section style={{ padding: isMobile ? '28px 20px 44px' : '42px 48px 68px' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.9fr) minmax(320px, 0.8fr)',
              gap: isMobile ? 24 : 20,
              alignItems: 'stretch',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.45fr) minmax(220px, 0.55fr)',
                  gap: 18,
                  alignItems: 'end',
                }}
              >
                <div>
                  <p style={{ color: 'var(--green)', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.22em', marginBottom: 14 }}>
                    {labels.eyebrow}
                  </p>
                  <h2 style={{ color: 'var(--cream)', fontSize: 'clamp(2.15rem, 5vw, 5.2rem)', lineHeight: 0.96, fontWeight: 900, letterSpacing: '-0.05em' }}>
                    {labels.headline}
                  </h2>
                </div>
                <p style={{ color: 'rgba(240,235,225,0.58)', lineHeight: 1.75, fontSize: '0.95rem' }}>
                  {labels.body}
                </p>
              </motion.div>

              <FeaturedReport report={featured} labels={labels} isMobile={isMobile} onRequestAccess={setSelectedReport} />

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
                {secondaryReports.map((report, index) => (
                  <ReportCard key={report.slug} report={report} labels={labels} index={index} onRequestAccess={setSelectedReport} />
                ))}
              </div>
            </div>

            <ServiceRail labels={labels} services={t.services.items} />
          </div>
        </div>
      </section>

      {selectedReport ? (
        <ReportAccessModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      ) : null}
    </div>
  );
}
