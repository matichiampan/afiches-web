import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import SectionIntro from '../components/SectionIntro';
import ReportAccessModal from '../components/ReportAccessModal';
import { reports } from '../data/reports';
import { useLang } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';

function DocCard({ report, stacked = false, viewLabel, downloadLabel, onRequestAccess }) {
  const openAccess = () => onRequestAccess(report);

  return (
    <div
      className="relative rounded-2xl flex flex-col justify-between"
      style={{ background: report.cardColor, padding: 28, minHeight: stacked ? 380 : 340, borderRadius: 16 }}
    >
      <div className="flex justify-between items-start">
        <span
          className="text-xs font-bold tracking-widest px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#F0EBE1' }}
        >
          {report.category}
        </span>
      </div>

      <div
        className="font-black select-none"
        style={{ fontSize: '6rem', color: '#22D46A', opacity: 0.9, lineHeight: 1, marginTop: 8 }}
      >
        {report.number}
      </div>

      <div>
        <h2 className="font-bold text-xl leading-tight mb-1" style={{ color: '#F0EBE1' }}>
          {report.title}
        </h2>
        <p className="text-xs font-medium mb-5" style={{ color: 'rgba(240,235,225,0.55)' }}>
          {report.subtitle}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openAccess}
            className="flex items-center gap-1 text-xs font-bold tracking-widest px-4 py-2 rounded-full transition-all hover:bg-white/20"
            style={{ border: '2px solid rgba(240,235,225,0.5)', color: '#F0EBE1', background: 'transparent' }}
          >
            {viewLabel}
          </button>
          <button
            type="button"
            onClick={openAccess}
            className="flex items-center gap-1 text-xs font-bold tracking-widest px-4 py-2 rounded-full transition-all hover:bg-white/20"
            style={{ border: '2px solid rgba(240,235,225,0.5)', color: '#F0EBE1', background: 'transparent' }}
          >
            <Download size={13} />
            {downloadLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CarouselView({ viewLabel, downloadLabel, isMobile, onRequestAccess }) {
  const [current, setCurrent] = useState(0);
  const report = reports[current];

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ padding: isMobile ? '28px 20px 40px' : '48px 24px 64px', overflow: 'hidden' }}
    >
      <div className="relative flex items-center" style={{ gap: isMobile ? 0 : 64, overflow: 'visible' }}>
        {!isMobile && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrent((i) => (i - 1 + reports.length) % reports.length)}
            className="z-20 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 44, height: 44, border: '2px solid rgba(240,235,225,0.2)', color: 'var(--cream)' }}
          >
            <ChevronLeft size={22} />
          </motion.button>
        )}

        <div
          className="relative flex-shrink-0"
          style={{ width: isMobile ? 'min(320px, calc(100vw - 40px))' : 'min(320px, 60vw)' }}
        >
          {report.stackColors.map((bg, i) => (
            <div
              key={bg}
              className="absolute inset-0 rounded-2xl"
              style={{
                background: bg,
                transform: i === 0
                  ? 'rotate(4deg) translate(14px,-6px) scale(0.97)'
                  : 'rotate(-2.5deg) translate(-10px,-3px) scale(0.985)',
                zIndex: i + 1,
                borderRadius: 16,
                minHeight: 380,
              }}
            />
          ))}
          <AnimatePresence mode="wait">
            <motion.div
              key={report.slug}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              style={{ position: 'relative', zIndex: 3 }}
            >
              <DocCard
                report={report}
                stacked
                viewLabel={viewLabel}
                downloadLabel={downloadLabel}
                onRequestAccess={onRequestAccess}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {!isMobile && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrent((i) => (i + 1) % reports.length)}
            className="z-20 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 44, height: 44, border: '2px solid rgba(240,235,225,0.2)', color: 'var(--cream)' }}
          >
            <ChevronRight size={22} />
          </motion.button>
        )}
      </div>

      {reports.length > 1 && (
        <div className="flex gap-2 mt-10">
          {reports.map((item, i) => (
            <button
              type="button"
              key={item.slug}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === current ? 'var(--green)' : 'rgba(240,235,225,0.2)',
                transition: 'all 0.3s',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GridView({ viewLabel, downloadLabel, onRequestAccess }) {
  return (
    <div className="px-5 sm:px-8 lg:px-12 pt-12 pb-16">
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}
      >
        {reports.map((report, i) => (
          <motion.div
            key={report.slug}
            className="min-w-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <DocCard
              report={report}
              viewLabel={viewLabel}
              downloadLabel={downloadLabel}
              onRequestAccess={onRequestAccess}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function OpenData() {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const useGrid = reports.length >= 3;
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div style={{ background: 'var(--bg)' }}>
      <SectionIntro number="03" title={t.sectionIntro.portfolio} accent="#22D46A" marqueeColor="#22D46A" />

      <div
        className="grid grid-cols-1 xl:grid-cols-2"
        style={{
          minHeight: isMobile ? 'unset' : 520,
          alignItems: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ padding: isMobile ? '32px 20px' : '56px 48px' }}
        >
          <p
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              color: 'var(--cream)',
              fontWeight: 800,
              lineHeight: 1.12,
              maxWidth: 520,
            }}
          >
            {t.portfolio.description}
          </p>
        </motion.div>

        <div className="border-t border-[rgba(240,235,225,0.07)] xl:border-t-0 xl:border-l">
          {useGrid ? (
            <GridView
              viewLabel={t.portfolio.view}
              downloadLabel={t.portfolio.download}
              onRequestAccess={setSelectedReport}
            />
          ) : (
            <CarouselView
              viewLabel={t.portfolio.view}
              downloadLabel={t.portfolio.download}
              isMobile={isMobile}
              onRequestAccess={setSelectedReport}
            />
          )}
        </div>
      </div>

      <ReportAccessModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}
