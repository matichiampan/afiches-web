import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';
import StudyGlobe from '../components/StudyGlobe';

const CLIENTS_MAIN = [
  { src: '/logos/asociacion_conciencia.png', alt: 'Asociación Conciencia' },
  { src: '/logos/logo-def.png',              alt: 'DEF' },
];

const CLIENTS_MEDIA = [
  { src: '/logos/infobae.png', alt: 'Infobae' },
];

function Card({ children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.055)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 24,
      padding: 'clamp(18px, 2.2vw, 24px)',
      height: '100%',
      minWidth: 0,
    }}>
      {children}
    </div>
  );
}

function LogoCard({ src, alt, delay, variant = 'md' }) {
  const isLg = variant === 'lg';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.085)',
        borderRadius: 18,
        padding: isLg ? '10px 12px' : '22px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isLg ? 290 : 112,
        width: '100%',
        overflow: 'visible',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: isLg ? '100%' : 'auto',
          height: isLg ? '100%' : 68,
          maxWidth: '100%',
          maxHeight: isLg ? 250 : 'none',
          objectFit: 'contain',
          display: 'block',
          borderRadius: isLg ? 14 : 0,
        }}
      />
    </motion.div>
  );
}

export default function Clients() {
  const { t } = useLang();
  const isMobile = useIsMobile();

  return (
    <div style={{
      background: 'var(--bg)',
      borderTop: '1px solid rgba(240,235,225,0.07)',
      padding: 'clamp(32px, 6vw, 56px) clamp(16px, 6vw, 48px)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr)',
        gap: 16,
        alignItems: 'stretch',
      }}>

        {/* CLIENTES */}
        <Card>
          <p style={{
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em',
            color: 'rgba(240,235,225,0.45)', marginBottom: 12,
          }}>
            {t.clients.clientsLabel}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 14,
            alignItems: 'stretch',
          }}>
            {CLIENTS_MAIN.map((c, i) => (
              <LogoCard key={c.alt} src={c.src} alt={c.alt} delay={i * 0.08} />
            ))}
            {CLIENTS_MEDIA.map((c, i) => (
              <div key={c.alt} style={{ gridColumn: '1 / -1' }}>
                <LogoCard src={c.src} alt={c.alt} delay={0.16 + i * 0.08} variant="lg" />
              </div>
            ))}
          </div>
        </Card>

        {/* ALAS */}
        <Card>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'flex-start',
            }}
          >
            <p style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: 'rgba(240,235,225,0.45)',
              margin: 0,
              marginBottom: 10,
            }}>
              {t.clients.alasLabel}
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: isMobile ? 6 : 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              minWidth: 0,
              flex: '1 1 auto',
              minHeight: isMobile ? 230 : 300,
            }}>
              <img
                src="/logos/logo-alas.png"
                alt="ALAS"
                style={{
                  width: '100%',
                  maxWidth: isMobile ? 520 : 820,
                  maxHeight: isMobile ? 260 : 360,
                  height: '100%',
                  display: 'block',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.22))',
                }}
              />
            </div>

            <h3 style={{
              fontSize: 'clamp(1.0rem, 1.6vw, 1.25rem)',
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: '-0.01em',
              color: 'var(--cream)',
              margin: 0,
              marginBottom: 8,
            }}>
              {t.clients.alasTitle}
            </h3>
            <p style={{
              fontSize: '0.84rem',
              lineHeight: 1.6,
              color: 'rgba(240,235,225,0.68)',
              margin: 0,
              minWidth: 0,
            }}>
              {t.clients.alasBody}
            </p>
          </motion.div>
        </Card>

        {/* Globo */}
        <StudyGlobe />
      </div>
    </div>
  );
}
