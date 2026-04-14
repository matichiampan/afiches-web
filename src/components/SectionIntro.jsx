// Banner de sección: número + título animados al scroll + marquee opcional
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';

export default function SectionIntro({ number, title, accent = '#F97316', marqueeColor }) {
  const { t } = useLang();
  const mColor = marqueeColor || accent;
  const marqueeItems = t.sectionIntro.marquee;

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Marquee strip */}
      <div
        style={{
          background: mColor,
          padding: '10px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              style={{
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.18em',
                color: '#152023',
                paddingRight: '2rem',
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Título de sección */}
      <div className="px-5 md:px-8 pt-8 md:pt-12 pb-4" style={{ overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-baseline gap-5"
        >
          <span
            style={{
              color: accent,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              opacity: 0.8,
            }}
          >
            {number}
          </span>
          <h2
            style={{
              color: 'var(--cream)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {title}
          </h2>
        </motion.div>
        {/* Línea decorativa */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: 2, background: accent, marginTop: 16, opacity: 0.35 }}
        />
      </div>
    </div>
  );
}
