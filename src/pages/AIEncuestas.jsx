import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';

// Step colors — static
const STEP_COLORS = ['#BAE6FD', '#F97316', '#7C3AED'];

// Graph node/edge data — kept as example data (positions, colors, ids)
const NODES = [
  { id: 0, label: 'Marca',        x: 50,  y: 15,  color: '#22D46A' },
  { id: 1, label: 'Experiencia',  x: 80,  y: 36,  color: '#F97316' },
  { id: 2, label: 'Precio',       x: 68,  y: 72,  color: '#BAE6FD' },
  { id: 3, label: 'Servicio',     x: 30,  y: 70,  color: '#7C3AED' },
  { id: 4, label: 'Confianza',    x: 16,  y: 36,  color: '#22D46A' },
  { id: 5, label: 'Calidad',      x: 50,  y: 46,  color: '#F97316' },
];
const EDGES = [
  { from: 0, to: 5, w: 3 }, { from: 0, to: 1, w: 1 },
  { from: 1, to: 5, w: 2 }, { from: 1, to: 2, w: 1 },
  { from: 2, to: 5, w: 2 }, { from: 2, to: 3, w: 1 },
  { from: 3, to: 5, w: 3 }, { from: 3, to: 4, w: 2 },
  { from: 4, to: 0, w: 1 }, { from: 4, to: 5, w: 2 },
];

// Bar data — values/colors static, labels come from quali items in translations
// Note: P (padding) is now computed inside the component using isMobile
const BAR_DATA = [
  { pct: 78, color: '#22D46A' },
  { pct: 61, color: '#F97316' },
  { pct: 44, color: '#BAE6FD' },
  { pct: 38, color: '#7C3AED' },
];

// Quali accent colors — static
const QUALI_ACCENTS = ['#22D46A', '#F97316', '#BAE6FD'];

// P is now defined inside the component — removed from top-level

function NodeGraph() {
  const [hovered, setHovered] = useState(null);
  return (
    <svg viewBox="0 0 100 90" style={{ width: '100%', display: 'block' }}>
      {EDGES.map((e, i) => {
        const a = NODES[e.from], b = NODES[e.to];
        const active = hovered === e.from || hovered === e.to;
        return (
          <motion.line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={active ? '#22D46A' : 'rgba(240,235,225,0.15)'}
            strokeWidth={active ? e.w * 0.55 : e.w * 0.22}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
            style={{ transition: 'stroke 0.25s, stroke-width 0.25s' }}
          />
        );
      })}
      {NODES.map((n) => {
        const isHov = hovered === n.id;
        return (
          <g key={n.id} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }}>
            <motion.circle cx={n.x} cy={n.y} r={isHov ? 8 : 5.8} fill={n.color}
              initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.6 + n.id * 0.09, duration: 0.4, type: 'spring' }}
              style={{ transition: 'r 0.2s' }}
            />
            {isHov && <circle cx={n.x} cy={n.y} r={11} fill="none" stroke={n.color} strokeWidth={0.6} opacity={0.45} />}
            <text x={n.x} y={n.y + (n.y > 50 ? -9 : 11)} textAnchor="middle"
              fontSize={3.8} fill="#F0EBE1" opacity={isHov ? 1 : 0.55}
              style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, pointerEvents: 'none', transition: 'opacity 0.2s' }}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function VideoPlayer({ isMobile }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(v);
    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(m => !m);
    }
  };

  return (
    <div style={{ padding: isMobile ? '0 20px 32px' : '0 48px 48px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ borderRadius: 16, overflow: 'hidden', background: '#000', position: 'relative' }}
      >
        <video
          ref={videoRef}
          src="/videos/afiches-ia.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', display: 'block' }}
        />
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute', bottom: 14, right: 14,
            background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: 9999, width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', fontSize: '1rem',
            backdropFilter: 'blur(6px)',
          }}
          title={muted ? 'Activar sonido' : 'Silenciar'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </motion.div>
    </div>
  );
}

export default function AIEncuestas() {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const P = isMobile ? '28px 20px' : '44px 48px';

  const steps = t.ai.steps.map((s, i) => ({
    n: String(i + 1).padStart(2, '0'),
    label: s.label,
    desc: s.desc,
    color: STEP_COLORS[i],
  }));

  const quali = t.ai.quali.map((q, i) => ({
    label: q.label,
    desc: q.desc,
    items: q.items,
    accent: QUALI_ACCENTS[i],
  }));

  const bars = BAR_DATA.map((b, i) => ({
    ...b,
    label: t.ai.quali[0].items[i] ?? t.ai.statsLabels[i],
  }));

  // Bar labels: use first quali card items (Marca/Brand/Marca) — the 4 items from nodes/bars
  // Actually bars correspond to: Marca, Experiencia, Precio, Servicio — these are graph node labels
  // which stay in Spanish as example data. But we should at least use the quali[0].items for the first 3.
  // The 4th bar (Servicio) is not in translations, so we keep it from NODES.
  const barLabels = [
    t.ai.quali[0].items[0], // Marca / Brand / Marca
    NODES[1].label,          // Experiencia (graph node, kept as example)
    t.ai.quali[0].items[2], // Precio / Price / Preço
    NODES[3].label,          // Servicio (graph node, kept as example)
  ];

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Franja de entrada — sin número, sin marquee */}
      <div style={{ borderTop: '1px solid rgba(240,235,225,0.07)' }} />

      {/* ── 1. Hero + pasos — una sola franja ── */}
      <div style={{ padding: P, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 56, alignItems: 'center' }}>

        {/* Título */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
          <p style={{ color: '#22D46A', fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.22em', marginBottom: 14 }}>{t.ai.label}</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.4rem)', fontWeight: 900, fontStyle: 'italic',
            color: 'var(--cream)', lineHeight: 1.1, marginBottom: 16 }}>
            {t.ai.title}<br />
            <span style={{ color: '#22D46A' }}>{t.ai.titleAccent}</span>
          </h2>
          <p style={{ color: 'rgba(240,235,225,0.6)', fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)', lineHeight: 1.7 }}>
            {t.ai.body}
          </p>
        </motion.div>

        {/* Pasos — verticales compactos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: 16,
                background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                padding: '14px 20px', borderLeft: `3px solid ${s.color}` }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#152023' }}>{s.n}</span>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '0.95rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(240,235,225,0.45)', marginTop: 2 }}>{s.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 2. Video de marca ── */}
      <VideoPlayer isMobile={isMobile} />

      {/* ── 3. Cualitativo + Co-ocurrencias + Barras — todo en una grilla ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: P }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 0 : 40, alignItems: 'start' }}>

          {/* Columna 1: cards cualitativas (apiladas) */}
          <div>
            <p style={{ color: 'var(--lavender)', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.2em', marginBottom: 20 }}>{t.ai.qualiLabel}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quali.map((q, i) => (
                <motion.div key={q.label}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14,
                    padding: '20px 20px', borderLeft: `2.5px solid ${q.accent}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ background: q.accent, color: '#152023', fontSize: '0.65rem',
                      fontWeight: 800, letterSpacing: '0.15em', padding: '3px 10px', borderRadius: 9999 }}>
                      {q.label.toUpperCase()}
                    </span>
                    <span style={{ color: 'rgba(240,235,225,0.4)', fontSize: '0.75rem' }}>{q.desc}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {q.items.map((item) => (
                      <li key={item} style={{ color: 'var(--cream)', fontSize: '0.85rem',
                        paddingLeft: 12, borderLeft: `2px solid ${q.accent}50`, lineHeight: 1.4 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
              <p style={{ color: 'rgba(240,235,225,0.2)', fontSize: '0.72rem', marginTop: 4, letterSpacing: '0.07em' }}>
                {t.ai.qualiFooter}
              </p>
            </div>
          </div>

          {/* Columna 2: grafo — oculta en mobile */}
          {!isMobile && (
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <p style={{ color: '#22D46A', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', marginBottom: 10 }}>
                {t.ai.coocLabel}
              </p>
              <h4 style={{ color: 'var(--cream)', fontWeight: 800, fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                marginBottom: 10, lineHeight: 1.2 }}>
                {t.ai.coocTitle}
              </h4>
              <p style={{ color: 'rgba(240,235,225,0.5)', fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.6 }}>
                {t.ai.coocBody}
              </p>
              <NodeGraph />
            </motion.div>
          )}

          {/* Columna 3: barras + stats — oculta en mobile */}
          {!isMobile && (
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <p style={{ color: '#F97316', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', marginBottom: 10 }}>
                {t.ai.barsLabel}
              </p>
              <h4 style={{ color: 'var(--cream)', fontWeight: 800, fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                marginBottom: 10, lineHeight: 1.2 }}>
                {t.ai.barsTitle}
              </h4>
              <p style={{ color: 'rgba(240,235,225,0.5)', fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.6 }}>
                {t.ai.barsBody}
              </p>
              {BAR_DATA.map((b, i) => (
                <div key={barLabels[i]} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--cream)', fontWeight: 600 }}>{barLabels[i]}</span>
                    <span style={{ fontSize: '0.88rem', color: 'rgba(240,235,225,0.45)' }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 9999, background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      initial={{ width: 0 }} whileInView={{ width: `${b.pct}%` }} viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.09, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: '100%', borderRadius: 9999, background: b.color }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}
