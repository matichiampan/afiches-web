import React from 'react';
import { motion } from 'framer-motion';
import SectionIntro from '../components/SectionIntro';
import { useLang } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';

const SERVICE_COLORS = ['#22D46A', '#F97316', '#BAE6FD', '#7C3AED'];

export default function Contact() {
  const { t } = useLang();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: 'var(--bg)' }}>
      <SectionIntro number="04" title={t.sectionIntro.contacto} accent="#DDD6FE" marqueeColor="#7C3AED" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 32 : 64,
          alignItems: 'center',
          padding: isMobile ? '40px 20px' : '64px 48px',
        }}
      >
        {/* Izquierda — texto */}
        <div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 2.8vw, 2.4rem)',
            fontWeight: 900,
            fontStyle: 'italic',
            color: 'var(--lavender)',
            lineHeight: 1.08,
            marginBottom: 20,
            whiteSpace: 'pre-line',
          }}>
            {t.contact.title}
          </h2>
          <p style={{
            fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
            color: 'rgba(240,235,225,0.55)',
            lineHeight: 1.7,
          }}>
            {t.contact.body}
          </p>
        </div>

        {/* Derecha — acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 32 }}>

          {/* Email grande */}
          <a href="mailto:info@afiches.net" style={{ textDecoration: 'none', display: 'block' }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(221,214,254,0.2)',
                borderRadius: 16,
                padding: '28px 32px',
                cursor: 'pointer',
              }}
            >
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--lavender)', marginBottom: 8 }}>
                {t.contact.cardLabel}
              </p>
              <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.3rem)', fontWeight: 700, color: 'var(--cream)' }}>
                info@afiches.net
              </p>
            </motion.div>
          </a>

          <a
            href="mailto:info@afiches.net"
            style={{
              display: 'block',
              textAlign: 'center',
              background: 'var(--green)', color: 'var(--bg)',
              fontWeight: 700, fontSize: '1rem',
              padding: '15px 32px', borderRadius: 9999, cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            {t.contact.button} →
          </a>
        </div>
      </motion.div>
    </div>
  );
}
