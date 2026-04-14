import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionIntro from '../components/SectionIntro';
import BrandDots from '../components/BrandDots';
import { useLang } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';

const SERVICE_STYLES = [
  { bg: '#7C3AED', pill: { bg: '#F0EBE1', color: '#7C3AED' }, dotsColor: '#F0EBE1' },
  { bg: '#BAE6FD', pill: { bg: '#152023', color: '#BAE6FD' }, dotsColor: '#7C3AED' },
  { bg: '#F97316', pill: { bg: '#152023', color: '#F97316' }, dotsColor: '#7C3AED' },
  { bg: '#DDD6FE', pill: { bg: '#152023', color: '#7C3AED' }, dotsColor: '#152023' },
];

function Cell({ svc, index, meInteresa, contactanos }) {
  const [hovered, setHovered] = useState(false);
  const darkBg = svc.bg === '#152023';
  const overlayBg = darkBg ? 'rgba(21,32,35,0.96)' : `${svc.bg}F2`;
  const textColor = darkBg ? '#F0EBE1' : '#152023';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered(v => !v)}
      className="relative overflow-hidden cursor-pointer"
      style={{ background: svc.bg, flex: 1 }}
    >
      <div className="flex flex-col justify-between h-full p-6" style={{ minHeight: 160 }}>
        <div className="flex justify-end">
          <BrandDots size={32} color={svc.dotsColor} />
        </div>
        <span
          className="inline-block font-bold leading-tight"
          style={{
            background: svc.pill.bg,
            color: svc.pill.color,
            borderRadius: 9999,
            padding: '9px 20px',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.2rem)',
            whiteSpace: 'pre-line',
          }}
        >
          {svc.label}
        </span>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex flex-col justify-between p-6"
            style={{ background: overlayBg }}
          >
            <p className="font-medium text-sm leading-relaxed" style={{ color: textColor }}>
              {svc.description}
            </p>
            <div className="flex flex-col gap-2">
              <span
                className="inline-block font-bold leading-tight"
                style={{
                  background: svc.pill.bg, color: svc.pill.color,
                  borderRadius: 9999, padding: '7px 18px',
                  fontSize: '0.95rem', whiteSpace: 'pre-line', alignSelf: 'flex-start',
                }}
              >
                {svc.label}
              </span>
              <button
                onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-0 cursor-pointer p-0 text-left"
              >
                <span className="text-xs font-bold tracking-widest" style={{ color: svc.pill.bg }}>
                  {contactanos}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function IACard({ t, isMobile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: '#22D46A',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isMobile ? 28 : 40,
        minHeight: isMobile ? 280 : undefined,
        height: isMobile ? undefined : '100%',
      }}
    >
      <BrandDots size={32} color="#152023" />

      <div>
        <h3 style={{
          fontSize: 'clamp(1.6rem, 2.4vw, 2.2rem)',
          fontWeight: 900,
          fontStyle: 'italic',
          color: '#152023',
          lineHeight: 1.08,
          marginBottom: 18,
          whiteSpace: 'pre-line',
        }}>
          {t.services.iaTagline}
        </h3>
        <p style={{ color: 'rgba(21,32,35,0.62)', fontSize: '0.92rem', lineHeight: 1.65 }}>
          {t.services.iaDescription}
        </p>
      </div>

      <button
        onClick={() => document.getElementById('encuestas-ia')?.scrollIntoView({ behavior: 'smooth' })}
        style={{
          background: '#152023', color: '#22D46A',
          border: 'none', borderRadius: 9999,
          padding: '12px 28px', fontWeight: 700,
          fontSize: '0.88rem', cursor: 'pointer',
          alignSelf: 'flex-start', letterSpacing: '0.04em',
        }}
      >
        {t.services.iaButton} ->
      </button>
    </motion.div>
  );
}

export default function Services() {
  const { t } = useLang();
  const isMobile = useIsMobile();

  const items = SERVICE_STYLES.map((style, i) => ({
    ...style,
    label: t.services.items[i].label,
    description: t.services.items[i].description,
  }));

  return (
    <div style={{ background: 'var(--bg)' }}>
      <SectionIntro number="02" title={t.sectionIntro.servicios} accent="#F97316" />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 3 }}>

        {/* Izquierda â€” cards compactas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {items.map((svc, i) => (
            <Cell key={i} svc={svc} index={i}
              meInteresa={t.services.meInteresa}
              contactanos={t.services.contactanos} />
          ))}
        </div>

        {/* Derecha â€” IA grande */}
        <IACard t={t} isMobile={isMobile} />

      </div>
    </div>
  );
}
