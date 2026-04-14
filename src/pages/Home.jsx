import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';

const G  = '#22D46A';
const P  = '#7C3AED';
const O  = '#F97316';
const S  = '#BAE6FD';
const BG = '#152023';

const c = (outer, inner = null, anim = false) => ({ outer, inner, anim });

// 25 columnas — círculos más chicos, perfil en U fiel a page_10.png
const COLS = [
  // ── CLUSTER IZQUIERDO
  [c(S), c(S), c(S), c(G), c(G), c(G), c(G)],                 // 0 — 7
  [c(S), c(O,G,true), c(G), c(G), c(P), c(G), c(G)],          // 1 — 7
  [c(S), c(S), c(G,O,true), c(P), c(G), c(G)],                 // 2 — 6
  [c(S), c(S), c(G,O), c(O), c(P), c(G)],                      // 3 — 6
  [c(S), c(G), c(O,P,true), c(G), c(G)],                       // 4 — 5
  [c(G), c(O,G), c(P), c(G), c(S)],                            // 5 — 5
  [c(G), c(O,G,true), c(P), c(S)],                             // 6 — 4
  [c(O), c(P), c(S,O,true)],                                    // 7 — 3
  [c(P), c(G,O)],                                               // 8 — 2
  // ── TRANSICIÓN
  [c(G), c(S,G,true)],                                          // 9 — 2
  [c(O,P)],                                                     // 10 — 1
  [c(G)],                                                       // 11 — 1
  [c(S,O,true)],                                                // 12 — 1
  [c(P)],                                                       // 13 — 1
  [c(G,O)],                                                     // 14 — 1
  [c(O), c(G,P,true)],                                          // 15 — 2
  [c(S), c(P)],                                                 // 16 — 2
  // ── CLUSTER DERECHO
  [c(O), c(S), c(P)],                                           // 17 — 3
  [c(O), c(S), c(O,G,true), c(P), c(O)],                       // 18 — 5
  [c(S), c(O,P,true), c(O), c(G), c(S)],                       // 19 — 5
  [c(G), c(O), c(S), c(P), c(O), c(G)],                        // 20 — 6
  [c(S,O,true), c(O), c(G), c(P), c(O), c(S)],                 // 21 — 6
  [c(S), c(O), c(P), c(S), c(G), c(O), c(G)],                  // 22 — 7
  [c(O,G,true), c(G), c(S), c(P), c(O), c(G), c(S)],           // 23 — 7
  [c(O), c(G), c(S)],                                           // 24 — 3
];

// Animaciones de flotación — deterministas por posición
const FLOATS = [
  { y: [0, -5, 0],     x: [0, 0, 0],  dur: 3.2 },
  { y: [0, 4, 0],      x: [0, 0, 0],  dur: 2.9 },
  { y: [0, -3, 3, 0],  x: [0, 2, 0],  dur: 3.8 },
  { y: [0, 3, -2, 0],  x: [0, -2, 0], dur: 3.5 },
  { y: [0, -4, 0],     x: [0, 3, 0],  dur: 4.1 },
];

function Bubble({ outer, inner, anim, ci, bi }) {
  // Cada 4 círculos flota (excluye los del centro para no distraer)
  const shouldFloat = (ci + bi) % 4 === 1 && (ci < 9 || ci > 16);
  const floatIdx     = (ci * 3 + bi * 7) % FLOATS.length;
  const { y, x, dur } = FLOATS[floatIdx];
  const floatDelay   = ((ci * 0.4 + bi * 0.6) % 2.5);

  return (
    <motion.svg
      viewBox="0 0 100 100"
      style={{ display: 'block', width: '100%', aspectRatio: '1/1' }}
      // Entrada inicial
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: shouldFloat ? y : 0,
        x: shouldFloat ? x : 0,
      }}
      transition={shouldFloat
        ? {
            opacity: { duration: 0.4, delay: ci * 0.016 + bi * 0.022 },
            y: { repeat: Infinity, duration: dur, ease: 'easeInOut', delay: floatDelay },
            x: { repeat: Infinity, duration: dur * 1.1, ease: 'easeInOut', delay: floatDelay + 0.3 },
          }
        : {
            duration: 0.4,
            delay: ci * 0.016 + bi * 0.022,
            ease: 'easeOut',
          }
      }
    >
      <circle cx="50" cy="50" r="50" fill={outer} />
      {inner && (
        anim ? (
          <motion.circle
            cx="50" cy="50"
            fill={inner}
            animate={{ r: [0, 44, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: 'easeInOut',
              delay: ci * 0.25 + bi * 0.45,
              repeatDelay: 2,
            }}
          />
        ) : (
          <circle cx="50" cy="50" r="38" fill={inner} />
        )
      )}
    </motion.svg>
  );
}

function BubbleGrid() {
  return (
    <div className="flex items-end overflow-hidden w-full" style={{ zIndex: 1 }}>
      {COLS.map((col, ci) => (
        <div
          key={ci}
          className="flex flex-col-reverse flex-shrink-0"
          style={{ width: `${100 / COLS.length}%`, gap: 0, margin: 0, padding: 0 }}
        >
          {col.map(({ outer, inner, anim }, bi) => (
            <Bubble key={bi} outer={outer} inner={inner} anim={anim} ci={ci} bi={bi} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{
        background: BG,
        minHeight: 'calc(100svh - 53px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ flex: 1 }} />
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <img
            src="/afiches-logo.svg"
            alt="afiches"
            style={{ width: 'min(300px, 80vw)', display: 'block' }}
          />
        </motion.div>
        <div style={{ flex: 1 }} />
        <BubbleGrid />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: 'calc(100vh - 53px)', background: BG }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute flex flex-col items-center"
        style={{ top: '22%', left: 0, right: 0, zIndex: 10 }}
      >
        <img
          src="/afiches-logo.svg"
          alt="afiches"
          style={{ width: 'min(580px, 68vw)', display: 'block' }}
        />
      </motion.div>

      {/* Burbujas */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {COLS.map((col, ci) => (
          <div
            key={ci}
            className="flex flex-col-reverse flex-shrink-0"
            style={{ width: `${100 / COLS.length}%`, gap: 0, margin: 0, padding: 0 }}
          >
            {col.map(({ outer, inner, anim }, bi) => (
              <Bubble key={bi} outer={outer} inner={inner} anim={anim} ci={ci} bi={bi} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
