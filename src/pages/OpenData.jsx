import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionIntro from '../components/SectionIntro';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';

// ─── Agregá docs acá. Cada PDF va en /public/docs/ ───────────────────────────
const DOCS = [
  {
    id: 1,
    title: 'Crisis en Venezuela',
    subtitle: 'Percepciones regionales: Venezuela, Colombia, Brasil y Argentina',
    category: 'INVESTIGACIÓN',
    year: '2025',
    size: '—',
    fileUrl: '/docs/crisis-venezuela.pdf',
    cardColor: '#7C3AED',
    stackColors: ['#F97316', '#DDD6FE'],
    number: '01',
  },
  // {
  //   id: 2,
  //   title: 'Encuesta CABA',
  //   subtitle: 'Estudio preelectoral',
  //   category: 'ENCUESTA',
  //   year: '2025',
  //   size: '—',
  //   fileUrl: '/docs/caba.pdf',
  //   cardColor: '#F97316',
  //   stackColors: ['#7C3AED', '#DDD6FE'],
  //   number: '02',
  // },
];
// ─────────────────────────────────────────────────────────────────────────────

function DocCard({ doc, stacked = false, viewLabel, downloadLabel }) {
  return (
    <div
      className="relative rounded-2xl flex flex-col justify-between"
      style={{ background: doc.cardColor, padding: 28, minHeight: stacked ? 380 : 340, borderRadius: 16 }}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold tracking-widest px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#F0EBE1' }}>
          {doc.category}
        </span>
        <span className="text-xs font-bold" style={{ color: 'rgba(240,235,225,0.55)' }}>
          ( {doc.year} )
        </span>
      </div>

      <div className="font-black select-none"
        style={{ fontSize: '6rem', color: '#22D46A', opacity: 0.9, lineHeight: 1, marginTop: 8 }}>
        {doc.number}
      </div>

      <div>
        <h2 className="font-bold text-xl leading-tight mb-1" style={{ color: '#F0EBE1' }}>
          {doc.title}
        </h2>
        <p className="text-xs font-medium mb-5" style={{ color: 'rgba(240,235,225,0.55)' }}>
          {doc.subtitle}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold tracking-widest px-4 py-2 rounded-full transition-all hover:bg-white/20"
            style={{ border: '2px solid rgba(240,235,225,0.5)', color: '#F0EBE1' }}>
            {viewLabel}
          </a>
          <a href={doc.fileUrl} download
            className="flex items-center gap-1 text-xs font-bold tracking-widest px-4 py-2 rounded-full transition-all hover:bg-white/20"
            style={{ border: '2px solid rgba(240,235,225,0.5)', color: '#F0EBE1' }}>
            <Download size={13} />
            {downloadLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

function CarouselView({ viewLabel, downloadLabel, isMobile }) {
  const [current, setCurrent] = useState(0);
  const doc = DOCS[current];

  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: isMobile ? '28px 20px 40px' : '48px 24px 64px', overflow: 'hidden' }}>
      <div className="relative flex items-center" style={{ gap: isMobile ? 0 : 64, overflow: 'visible' }}>
        {!isMobile && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setCurrent(i => (i - 1 + DOCS.length) % DOCS.length)}
            className="z-20 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 44, height: 44, border: '2px solid rgba(240,235,225,0.2)', color: 'var(--cream)' }}>
            <ChevronLeft size={22} />
          </motion.button>
        )}

        <div className="relative flex-shrink-0" style={{ width: isMobile ? 'min(320px, calc(100vw - 40px))' : 'min(320px, 60vw)' }}>
          {doc.stackColors.map((bg, i) => (
            <div key={i} className="absolute inset-0 rounded-2xl"
              style={{
                background: bg,
                transform: i === 0 ? 'rotate(4deg) translate(14px,-6px) scale(0.97)' : 'rotate(-2.5deg) translate(-10px,-3px) scale(0.985)',
                zIndex: i + 1, borderRadius: 16, minHeight: 380,
              }}
            />
          ))}
          <AnimatePresence mode="wait">
            <motion.div key={doc.id}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}
              style={{ position: 'relative', zIndex: 3 }}>
              <DocCard doc={doc} stacked viewLabel={viewLabel} downloadLabel={downloadLabel} />
            </motion.div>
          </AnimatePresence>
        </div>

        {!isMobile && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setCurrent(i => (i + 1) % DOCS.length)}
            className="z-20 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 44, height: 44, border: '2px solid rgba(240,235,225,0.2)', color: 'var(--cream)' }}>
            <ChevronRight size={22} />
          </motion.button>
        )}
      </div>

      {DOCS.length > 1 && (
        <div className="flex gap-2 mt-10">
          {DOCS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 9999,
                background: i === current ? 'var(--green)' : 'rgba(240,235,225,0.2)',
                transition: 'all 0.3s', border: 'none', cursor: 'pointer' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GridView({ viewLabel, downloadLabel }) {
  return (
    <div style={{ padding: '48px 48px 64px' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DOCS.map((doc, i) => (
          <motion.div key={doc.id}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <DocCard doc={doc} viewLabel={viewLabel} downloadLabel={downloadLabel} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function OpenData() {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const useGrid = DOCS.length >= 3;

  return (
    <div style={{ background: 'var(--bg)' }}>
      <SectionIntro number="03" title={t.sectionIntro.portfolio} accent="#22D46A" marqueeColor="#22D46A" />

      {/* Layout 50/50 — descripción izquierda, documentos derecha */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: isMobile ? 'unset' : 520, alignItems: 'center' }}>

        {/* Izquierda: descripción */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ padding: isMobile ? '32px 20px' : '56px 48px' }}
        >
          <p style={{
            fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
            color: 'rgba(240,235,225,0.75)',
            lineHeight: 1.7,
            marginBottom: 16,
          }}>
            {t.portfolio.description}
          </p>
          <p style={{
            fontSize: '0.88rem',
            color: 'rgba(240,235,225,0.35)',
            lineHeight: 1.6,
          }}>
            {t.portfolio.description2}
          </p>
        </motion.div>

        {/* Derecha: documentos */}
        <div style={{ borderLeft: isMobile ? 'none' : '1px solid rgba(240,235,225,0.07)' }}>
          {useGrid
            ? <GridView viewLabel={t.portfolio.view} downloadLabel={t.portfolio.download} />
            : <CarouselView viewLabel={t.portfolio.view} downloadLabel={t.portfolio.download} isMobile={isMobile} />
          }
        </div>

      </div>
    </div>
  );
}
