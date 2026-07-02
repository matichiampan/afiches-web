import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, FileText, Layers, LineChart, Search } from 'lucide-react';
import { getReportBySlug } from '../data/reports';
import BrandDots from '../components/BrandDots';
import ReportAccessModal from '../components/ReportAccessModal';
import { useIsMobile } from '../hooks/useIsMobile';

const MODULES = [
  { icon: BarChart3, title: 'KPIs principales', body: 'Espacio reservado para indicadores, tamanos de muestra y variables centrales.' },
  { icon: LineChart, title: 'Graficos del estudio', body: 'Aca se cargaran visualizaciones comparables y lectura por segmentos.' },
  { icon: Search, title: 'Hallazgos', body: 'Bloque preparado para conclusiones ejecutivas y puntos accionables.' },
  { icon: Layers, title: 'Cruces y bases', body: 'Modulo listo para cortes demograficos, paises, cohortes o variables del dashboard final.' },
];

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255,255,255,0.06)',
        color: 'var(--cream)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 9999,
        padding: '10px 15px',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: 900,
        letterSpacing: '0.08em',
      }}
    >
      <ArrowLeft size={15} />
      VOLVER A REPORTES
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.055)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 16,
        padding: 18,
      }}
    >
      <p style={{ color, fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.16em', marginBottom: 8 }}>
        {label.toUpperCase()}
      </p>
      <p style={{ color: 'var(--cream)', fontSize: 'clamp(1.35rem, 3vw, 2.25rem)', fontWeight: 900, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

export default function ReportDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [accessReport, setAccessReport] = useState(null);
  const report = getReportBySlug(slug);

  const goBackToReports = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('reportes')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  if (!report) {
    return (
      <main style={{ minHeight: 'calc(100vh - 53px)', background: 'var(--bg)', padding: isMobile ? '36px 20px' : '56px 48px', overflowX: 'clip' }}>
        <BackButton onClick={goBackToReports} />
        <div style={{ maxWidth: 760, marginTop: 72 }}>
          <p style={{ color: '#F97316', fontWeight: 900, letterSpacing: '0.18em', fontSize: '0.72rem', marginBottom: 14 }}>
            REPORTE NO ENCONTRADO
          </p>
          <h1 style={{ color: 'var(--cream)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1, fontWeight: 900 }}>
            No encontramos ese dashboard.
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 53px)', background: 'var(--bg)', overflowX: 'clip' }}>
      <section style={{ padding: isMobile ? '30px 20px 44px' : '46px 48px 64px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <BackButton onClick={goBackToReports} />

          <div
            style={{
              marginTop: 28,
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.4fr) minmax(320px, 0.6fr)',
              gap: 18,
              alignItems: 'stretch',
              minWidth: 0,
            }}
          >
            <section
              style={{
                background: report.cardColor,
                borderRadius: 20,
                padding: isMobile ? 24 : 36,
                color: '#F0EBE1',
                minHeight: isMobile ? 420 : 540,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                minWidth: 0,
                width: isMobile ? 'calc(100vw - 60px)' : '100%',
                maxWidth: isMobile ? 'calc(100vw - 60px)' : undefined,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: -26,
                  top: 18,
                  color: report.accentColor,
                  opacity: 0.22,
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
                    DASHBOARD
                  </span>
                  <BrandDots size={50} color="#F0EBE1" />
                </div>

                <div style={{ marginTop: isMobile ? 62 : 96, maxWidth: 760 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.18em', opacity: 0.72, marginBottom: 12 }}>
                    {report.category} / {report.period}
                  </p>
                  <h1 style={{ fontSize: 'clamp(2.35rem, 6vw, 6.3rem)', lineHeight: 0.92, fontWeight: 900, letterSpacing: '-0.06em', overflowWrap: 'break-word' }}>
                    {report.title}
                  </h1>
                  <p style={{ marginTop: 20, color: 'rgba(240,235,225,0.78)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 620, overflowWrap: 'break-word' }}>
                    {report.summary}
                  </p>
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 34 }}>
                <button
                  type="button"
                  onClick={() => setAccessReport(report)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#F0EBE1',
                    color: '#152023',
                    borderRadius: 9999,
                    padding: '13px 18px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    border: 0,
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={15} /> ABRIR PDF
                </button>
                <button
                  type="button"
                  onClick={() => setAccessReport(report)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#F0EBE1',
                    border: '2px solid rgba(240,235,225,0.45)',
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
                  <Download size={15} /> DESCARGAR
                </button>
              </div>
            </section>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, width: isMobile ? 'calc(100vw - 60px)' : '100%', maxWidth: isMobile ? 'calc(100vw - 60px)' : undefined }}>
              {report.teaserStats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} color={report.accentColor} />
              ))}

              <div
                style={{
                  background: 'rgba(255,255,255,0.055)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 16,
                  padding: 20,
                  color: 'var(--cream)',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <p style={{ color: '#22D46A', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.16em', marginBottom: 12 }}>
                  ESTADO
                </p>
                <h2 style={{ fontSize: '1.35rem', lineHeight: 1.12, fontWeight: 900, marginBottom: 10 }}>
                  Dashboard en preparacion
                </h2>
                <p style={{ color: 'rgba(240,235,225,0.58)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  La ruta y la estructura ya estan listas. Cuando esten los dashboards finales, este espacio se reemplaza por los datos cargados del reporte.
                </p>
              </div>
            </aside>
          </div>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))',
              gap: 14,
              marginTop: 18,
              minWidth: 0,
            }}
          >
            {MODULES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: 20,
                  minHeight: 170,
                  color: 'var(--cream)',
                  minWidth: 0,
                }}
              >
                <Icon size={26} color={report.accentColor} />
                <h3 style={{ fontSize: '1.02rem', fontWeight: 900, lineHeight: 1.15, marginTop: 18, marginBottom: 10 }}>
                  {title}
                </h3>
                <p style={{ color: 'rgba(240,235,225,0.55)', fontSize: '0.84rem', lineHeight: 1.6 }}>
                  {body}
                </p>
              </article>
            ))}
          </section>
        </div>
      </section>
      {accessReport ? (
        <ReportAccessModal report={accessReport} onClose={() => setAccessReport(null)} />
      ) : null}
    </main>
  );
}
