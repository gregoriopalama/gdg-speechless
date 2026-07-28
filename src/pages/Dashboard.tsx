import React from 'react';
import { useSpeechless } from '../context/SpeechlessContext';
import { useTranslation } from 'react-i18next';

export const Dashboard: React.FC = () => {
  const { gameState, loading, error, updateRound } = useSpeechless();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loaderStyle}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#d32f2f' }}>{t('gameplay.error.title')}</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const handleSelectDifficulty = async (difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Legend') => {
    try {
      await updateRound({
        id: `round_${Date.now()}`,
        difficulty,
        status: 'INTRO',
        theme: '', 
        currentSlideIndex: 0,
        totalSlides: gameState?.slidesCount || 5,
        slideQueue: [],
      });
    } catch (err) {
      console.error("Errore durante l'avvio del round:", err);
    }
  };

  const levels: Array<'beginner' | 'intermediate' | 'advanced' | 'legend'> = [
    'beginner',
    'intermediate',
    'advanced',
    'legend',
  ];

  return (
    <div style={containerStyle}>
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={titleStyle}>{t('app.title')}</h1>
        <p style={subtitleStyle}>{t('app.tagline')}</p>
      </header>

      <main style={gridStyle}>
        {levels.map((lvl) => {
          const capitalized = (lvl.charAt(0).toUpperCase() + lvl.slice(1)) as
            | 'Beginner'
            | 'Intermediate'
            | 'Advanced'
            | 'Legend';
          return (
            <div
              key={lvl}
              onClick={() => handleSelectDifficulty(capitalized)}
              style={cardStyle}
            >
              <h2 style={cardTitleStyle(lvl)}>{t(`levels.${lvl}.name`)}</h2>
              <p style={cardDescStyle}>{t(`levels.${lvl}.description`)}</p>
            </div>
          );
        })}
      </main>

      {gameState?.seed && (
        <footer style={{ marginTop: '4rem', fontSize: '0.9rem', color: '#666' }}>
          Seed attivo: <strong>{gameState.seed}</strong>
        </footer>
      )}
    </div>
  );
};

// Design elegante su sfondo chiaro neutro (bianco/grigio chiarissimo per proiezione)
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  color: '#212529',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2.5rem',
  fontFamily: '"Outfit", "Inter", sans-serif',
  boxSizing: 'border-box',
};

const titleStyle: React.CSSProperties = {
  fontSize: '4rem',
  fontWeight: '900',
  color: '#1a1a1a',
  margin: '0 0 0.5rem 0',
  letterSpacing: '-1.5px',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  color: '#495057',
  margin: 0,
  fontWeight: '500',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '2rem',
  width: '100%',
  maxWidth: '1000px',
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #dee2e6',
  borderRadius: '16px',
  padding: '2rem',
  cursor: 'pointer',
  backgroundColor: '#ffffff',
  transition: 'transform 0.15s, box-shadow 0.15s',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  textAlign: 'left',
  minHeight: '140px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
};

const cardTitleStyle = (lvl: string): React.CSSProperties => {
  let color = '#2b6cb0'; // beginner (blu elegante)
  if (lvl === 'intermediate') color = '#319795'; // intermediate (ottanio)
  if (lvl === 'advanced') color = '#805ad5'; // advanced (viola)
  if (lvl === 'legend') color = '#d69e2e'; // legend (oro caldo)

  return {
    fontSize: '1.8rem',
    margin: '0 0 0.75rem 0',
    fontWeight: 'bold',
    color,
  };
};

const cardDescStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#495057',
  margin: 0,
  lineHeight: '1.45',
};

const loaderStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  color: '#1a1a1a',
  fontWeight: 'bold',
};

export default Dashboard;
