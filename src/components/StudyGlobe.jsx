import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import worldAtlas from 'world-atlas/countries-110m.json';
import { useLang } from '../context/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';

const HIGHLIGHTED_COUNTRIES = [
  {
    id: 'Argentina',
    color: '#22D46A',
    rotate: [64, 34],
    labels: { es: 'Argentina', en: 'Argentina', pt: 'Argentina' },
  },
  {
    id: 'Chile',
    color: '#60A5FA',
    rotate: [71, 35],
    labels: { es: 'Chile', en: 'Chile', pt: 'Chile' },
  },
  {
    id: 'Uruguay',
    color: '#FBBF24',
    rotate: [56, 33],
    labels: { es: 'Uruguay', en: 'Uruguay', pt: 'Uruguai' },
  },
  {
    id: 'Peru',
    color: '#A78BFA',
    rotate: [75, 9],
    labels: { es: 'Perú', en: 'Peru', pt: 'Peru' },
  },
  {
    id: 'Brazil',
    color: '#BAE6FD',
    rotate: [55, 12],
    labels: { es: 'Brasil', en: 'Brazil', pt: 'Brasil' },
  },
  {
    id: 'Colombia',
    color: '#F97316',
    rotate: [74, -4],
    labels: { es: 'Colombia', en: 'Colombia', pt: 'Colombia' },
  },
  {
    id: 'Venezuela',
    color: '#DDD6FE',
    rotate: [66, -7],
    labels: { es: 'Venezuela', en: 'Venezuela', pt: 'Venezuela' },
  },
  {
    id: 'Honduras',
    color: '#34D399',
    rotate: [86, -15],
    labels: { es: 'Honduras', en: 'Honduras', pt: 'Honduras' },
  },
];

const COUNTRY_INDEX = Object.fromEntries(
  HIGHLIGHTED_COUNTRIES.map((country) => [country.id, country]),
);

const WORLD_COUNTRIES = feature(worldAtlas, worldAtlas.objects.countries).features;
const GRATICULE = geoGraticule10();

function getCountryLabel(country, lang) {
  return country.labels[lang] || country.labels.es;
}

export default function StudyGlobe() {
  const { lang, t } = useLang();
  const isMobile = useIsMobile();
  // Start centered on Latin America.
  const [rotation, setRotation] = useState([65, 10]);
  const [activeCountryId, setActiveCountryId] = useState('Brazil');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const activeCountry = COUNTRY_INDEX[activeCountryId] || HIGHLIGHTED_COUNTRIES[0];
  const globeSize = isMobile ? 260 : 340;
  const sphereRadius = globeSize * 0.39;

  const scheduleAutoResume = (delay = 3200) => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      setAutoRotate(true);
    }, delay);
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(resumeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!autoRotate || isDragging) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRotation(([lon, lat]) => {
        // Very slow, subtle rotation.
        const nextLon = lon - 0.02 < -180 ? 180 : lon - 0.02;
        return [nextLon, lat];
      });
    }, 80);

    return () => window.clearInterval(interval);
  }, [autoRotate, isDragging]);

  const { spherePath, graticulePath, countryShapes } = useMemo(() => {
    const projection = geoOrthographic()
      .translate([globeSize / 2, globeSize / 2])
      .scale(globeSize * 0.39)
      .rotate(rotation)
      .clipAngle(90)
      .precision(0.5);

    const pathGenerator = geoPath(projection);

    return {
      spherePath: pathGenerator({ type: 'Sphere' }),
      graticulePath: pathGenerator(GRATICULE),
      countryShapes: WORLD_COUNTRIES.map((country) => {
        const shape = pathGenerator(country);
        if (!shape) {
          return null;
        }

        return {
          id: country.id,
          name: country.properties.name,
          shape,
          highlight: COUNTRY_INDEX[country.properties.name] || null,
        };
      }).filter(Boolean),
    };
  }, [globeSize, rotation]);

  const focusCountry = (country, delay = 5000) => {
    window.clearTimeout(resumeTimerRef.current);
    setActiveCountryId(country.id);
    setRotation(country.rotate);
    setAutoRotate(false);
    scheduleAutoResume(delay);
  };

  const activateCountry = (country, delay = 3200) => {
    window.clearTimeout(resumeTimerRef.current);
    setActiveCountryId(country.id);
    setAutoRotate(false);
    scheduleAutoResume(delay);
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    window.clearTimeout(resumeTimerRef.current);
    setAutoRotate(false);
    setIsDragging(true);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !dragRef.current) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;

    dragRef.current = { x: event.clientX, y: event.clientY };

    setRotation(([lon, lat]) => {
      const nextLon = lon + deltaX * 0.24;
      const nextLat = Math.max(-55, Math.min(55, lat - deltaY * 0.12));
      return [nextLon, nextLat];
    });
  };

  const handlePointerUp = () => {
    if (!isDragging) {
      return;
    }

    dragRef.current = null;
    setIsDragging(false);
    scheduleAutoResume();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        padding: isMobile ? 16 : 18,
        minHeight: '100%',
      }}
    >
      <p style={{
        fontSize: '0.62rem',
        fontWeight: 700,
        letterSpacing: '0.22em',
        color: 'rgba(240,235,225,0.42)',
        marginBottom: 10,
      }}>
        {t.clients.studiesLabel}
      </p>

      <div
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          padding: isMobile ? '2px 0 0' : '6px 0',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
          <svg
            viewBox={`0 0 ${globeSize} ${globeSize}`}
            width="100%"
            style={{ display: 'block', maxWidth: globeSize, overflow: 'visible', opacity: 0.92 }}
            onPointerDown={handlePointerDown}
          >
            <defs>
              <radialGradient id="globeOcean" cx="35%" cy="30%">
                <stop offset="0%" stopColor="rgba(186,230,253,0.38)" />
                <stop offset="55%" stopColor="rgba(124,58,237,0.18)" />
                <stop offset="100%" stopColor="rgba(21,32,35,0.96)" />
              </radialGradient>
              <clipPath id="globeClip">
                <path d={spherePath} />
              </clipPath>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx={globeSize / 2}
              cy={globeSize / 2}
              r={sphereRadius + 14}
              fill="rgba(34,212,106,0.035)"
              stroke="rgba(34,212,106,0.12)"
              strokeWidth="1"
            />

            <path d={spherePath} fill="url(#globeOcean)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.6" />

            <g clipPath="url(#globeClip)">
              <path d={graticulePath} fill="none" stroke="rgba(240,235,225,0.11)" strokeWidth="0.8" />

              {countryShapes.map((country) => {
                const isActive = country.highlight?.id === activeCountryId;
                const fill = country.highlight
                  ? country.highlight.color
                  : 'rgba(240,235,225,0.12)';

                return (
                  <path
                    key={`${country.id}-${country.name}`}
                    d={country.shape}
                    fill={fill}
                    opacity={country.highlight ? (isActive ? 0.98 : 0.7) : 0.82}
                    stroke={country.highlight ? 'rgba(21,32,35,0.85)' : 'rgba(255,255,255,0.08)'}
                    strokeWidth={country.highlight ? 1.15 : 0.5}
                    style={{
                      cursor: country.highlight ? 'pointer' : 'default',
                      filter: isActive ? 'url(#glow)' : 'none',
                      transition: 'opacity 180ms ease, fill 180ms ease',
                    }}
                    onMouseEnter={() => {
                      if (country.highlight) {
                        activateCountry(country.highlight, 4200);
                      }
                    }}
                  />
                );
              })}
            </g>

            <circle
              cx={globeSize / 2}
              cy={globeSize / 2}
              r={sphereRadius}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.2"
            />
          </svg>
      </div>

      <p style={{
        fontSize: '0.78rem',
        lineHeight: 1.45,
        color: 'rgba(240,235,225,0.42)',
        margin: '10px 0 0',
      }}>
        {t.clients.dragHint}
      </p>
    </motion.div>
  );
}
