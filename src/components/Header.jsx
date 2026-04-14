import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandDots from './BrandDots';
import { useLang } from '../context/LanguageContext';

const LANGS = [
  { code: 'es', flagSrc: 'https://flagcdn.com/24x18/ar.png', label: 'ES' },
  { code: 'en', flagSrc: 'https://flagcdn.com/24x18/us.png', label: 'EN' },
  { code: 'pt', flagSrc: 'https://flagcdn.com/24x18/br.png', label: 'PT' },
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Header() {
  const { lang, setLang, t } = useLang();
  const [active, setActive] = useState('inicio');
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { id: 'inicio',       label: t.nav.inicio },
    { id: 'servicios',    label: t.nav.servicios },
    { id: 'encuestas-ia', label: t.nav.encuestasIa },
    { id: 'portfolio',    label: t.nav.portfolio },
    { id: 'contacto',     label: t.nav.contacto },
  ];

  // Detecta qué sección está visible con IntersectionObserver
  useEffect(() => {
    const ids = ['inicio', 'servicios', 'encuestas-ia', 'portfolio', 'contacto'];
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3, rootMargin: '-60px 0px -40% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(obs => obs?.disconnect());
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ background: 'var(--bg)', borderBottom: '1px solid rgba(240,235,225,0.08)' }}
    >
      <div className="w-full px-6 py-3 flex items-center justify-between relative">

        {/* Left — nav links desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="text-sm font-semibold tracking-widest transition-all duration-200 bg-transparent border-0 cursor-pointer"
              style={active === id
                ? { background: 'var(--lavender)', color: 'var(--bg)', padding: '4px 16px', borderRadius: 9999 }
                : { color: 'var(--cream)', padding: '4px 0' }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Center — brand dots del logo oficial */}
        <button
          onClick={() => scrollToSection('inicio')}
          className="absolute left-1/2 -translate-x-1/2 bg-transparent border-0 cursor-pointer p-0"
        >
          <BrandDots size={60} color="#F97316" />
        </button>

        {/* Right — language switcher desktop */}
        <div className="hidden md:flex items-center gap-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {LANGS.map(({ code, flagSrc, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                style={{
                  background: lang === code ? 'rgba(240,235,225,0.12)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 6,
                  padding: '3px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: lang === code ? 'var(--cream)' : 'rgba(240,235,225,0.4)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s',
                  opacity: lang === code ? 1 : 0.5,
                }}
              >
                <img src={flagSrc} alt={label} style={{ width: 20, height: 15, borderRadius: 2, objectFit: 'cover' }} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto bg-transparent border-0 cursor-pointer"
          style={{ color: 'var(--cream)' }}
          onClick={() => setMenuOpen(o => !o)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Línea de acento lavanda */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#D0A7E8', opacity: 0.7 }} />

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: 'var(--bg)', borderTop: '1px solid rgba(240,235,225,0.08)', overflow: 'hidden' }}
          >
            <nav className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => { scrollToSection(id); setMenuOpen(false); }}
                  className="text-left bg-transparent border-0 cursor-pointer"
                  style={active === id
                    ? { background: 'var(--lavender)', color: 'var(--bg)', padding: '4px 16px', borderRadius: 9999, fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.1em' }
                    : { color: 'var(--cream)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.1em' }}
                >
                  {label}
                </button>
              ))}
              {/* Language switcher mobile */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid rgba(240,235,225,0.08)' }}>
                {LANGS.map(({ code, flagSrc, label }) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    style={{
                      background: lang === code ? 'rgba(240,235,225,0.12)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 6,
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: lang === code ? 'var(--cream)' : 'rgba(240,235,225,0.4)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      opacity: lang === code ? 1 : 0.5,
                    }}
                  >
                    <img src={flagSrc} alt={label} style={{ width: 22, height: 16, borderRadius: 2, objectFit: 'cover' }} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
