import React from 'react';
import { Twitter, Linkedin, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid rgba(240,235,225,0.08)',
        color: 'var(--cream)',
      }}
      className="py-6"
    >
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm font-semibold" style={{ color: 'rgba(240,235,225,0.4)' }}>
          © 2026 Afiches. Todos los derechos reservados.
        </span>
        <div className="flex gap-5">
          <motion.a
            href="https://x.com/AfichesAC"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2 }}
            style={{ color: 'rgba(240,235,225,0.5)' }}
            className="hover:text-white transition-colors"
          >
            <Twitter size={22} />
          </motion.a>
          <motion.a
            href="https://www.instagram.com/afiches_consultora/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2 }}
            style={{ color: 'rgba(240,235,225,0.5)' }}
            className="hover:text-white transition-colors"
          >
            <Instagram size={22} />
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/company/afiches-consultora"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2 }}
            style={{ color: 'rgba(240,235,225,0.5)' }}
            className="hover:text-white transition-colors"
          >
            <Linkedin size={22} />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
