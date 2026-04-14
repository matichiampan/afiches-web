import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import OpenData from '@/pages/OpenData';
import AIEncuestas from '@/pages/AIEncuestas';
import Contact from '@/pages/Contact';
import Clients from '@/pages/Clients';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
    <div style={{ background: 'var(--bg)' }}>
      <Helmet>
        <title>Afiches - Investigación de mercado y análisis de opinión pública</title>
        <meta name="description" content="Afiches interpreta el pulso del presente con un enfoque innovador, personalizado y estratégico." />
      </Helmet>

      <Header />

      <main>
        <section id="inicio">
          <Home />
        </section>
        <section id="servicios">
          <Services />
        </section>
        <section id="encuestas-ia">
          <AIEncuestas />
        </section>
        <section id="portfolio">
          <OpenData />
        </section>
        <section id="clientes">
          <Clients />
        </section>
        <section id="contacto">
          <Contact />
        </section>
      </main>

      <Footer />
      <Toaster />
    </div>
    </LanguageProvider>
  );
}

export default App;
