import React from 'react';
import { useSpeechless } from '../context/SpeechlessContext';
import { useTranslation } from 'react-i18next';

export const SpeechlessView: React.FC = () => {
  const { gameState, updateRound, resetGame } = useSpeechless();
  const { t } = useTranslation();

  const currentRound = gameState?.currentRound;

  if (!currentRound) return null;

  const isIntro = currentRound.status === 'INTRO';
  const isFinished = currentRound.status === 'FINISHED';

  const startPresentation = () => {
    updateRound({ status: 'PLAYING', theme: 'Un Titolo di Esempio Generato dall\'AI', currentSlideIndex: 0 });
  };

  const handleNext = () => {
    if (currentRound.currentSlideIndex < currentRound.totalSlides - 1) {
      updateRound({ currentSlideIndex: currentRound.currentSlideIndex + 1 });
    } else {
      updateRound({ status: 'FINISHED' });
    }
  };

  const handlePrev = () => {
    if (currentRound.currentSlideIndex > 0) {
      updateRound({ currentSlideIndex: currentRound.currentSlideIndex - 1 });
    }
  };

  if (isIntro) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h3 style={{ textTransform: 'uppercase', color: '#666', letterSpacing: '3px', margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 'bold' }}>
            {t(`levels.${currentRound.difficulty.toLowerCase()}.name`)} Mode
          </h3>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 3rem 0', fontWeight: '900', color: '#1a1a1a', lineHeight: '1.2' }}>
            {currentRound.theme || t('gameplay.loading.theme')}
          </h1>
          <button onClick={startPresentation} style={buttonStyle}>
            {t('gameplay.start')}
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: '#1a1a1a', fontWeight: '900' }}>
            {t('gameplay.finalSlide.title')}
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#495057', marginBottom: '3.5rem' }}>
            {t('gameplay.finalSlide.applause')}
          </p>
          <button onClick={() => resetGame()} style={buttonStyle}>
            {t('gameplay.finalSlide.reset')}
          </button>
        </div>
      </div>
    );
  }

  // Slide Deck principale su sfondo bianco/neutro per proiezioni chiare
  return (
    <div style={deckContainerStyle} onClick={handleNext}>
      {/* Contenuto della slide (gradiente chiaro sobrio ed elegante prima dell'AI) */}
      <div style={slidePlaceholderStyle(currentRound.currentSlideIndex)}>
        <h2 style={{ fontSize: '2rem', color: '#adb5bd', fontWeight: 'bold' }}>
          [ Slide #{currentRound.currentSlideIndex + 1} - Image placeholder ]
        </h2>
      </div>

      {/* Tema bloccato in basso con sfondo semitrasparente chiaro (glassmorphism su bianco) */}
      <div style={subtitleOverlayStyle} onClick={(e) => e.stopPropagation()}>
        <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#1a1a1a' }}>{currentRound.theme}</p>
        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.95rem', color: '#495057', fontWeight: '500' }}>
          Slide {currentRound.currentSlideIndex + 1} di {currentRound.totalSlides}
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', justifyContent: 'center' }}>
          <button onClick={handlePrev} disabled={currentRound.currentSlideIndex === 0} style={navButtonStyle}>
            &larr; {t('gameplay.prev')}
          </button>
          <button onClick={handleNext} style={navButtonStyle}>
            {t('gameplay.next')} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100vw',
  backgroundColor: '#f8f9fa',
  color: '#212529',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: '"Outfit", sans-serif',
  padding: '2rem',
  boxSizing: 'border-box',
};

const deckContainerStyle: React.CSSProperties = {
  height: '100vh',
  width: '100vw',
  backgroundColor: '#ffffff',
  color: '#212529',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: '"Outfit", sans-serif',
  overflow: 'hidden',
  cursor: 'pointer',
};

const slidePlaceholderStyle = (index: number): React.CSSProperties => {
  const hues = [210, 150, 330, 45, 270];
  const hue = hues[index % hues.length];
  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: `linear-gradient(135deg, hsl(${hue}, 30%, 98%), hsl(${hue + 20}, 30%, 93%))`,
    transition: 'background 0.5s ease',
  };
};

const subtitleOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '2.5rem',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: '18px',
  padding: '1.5rem 3rem',
  textAlign: 'center',
  width: '80%',
  maxWidth: '750px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  border: 'none',
  padding: '1rem 2.5rem',
  borderRadius: '10px',
  fontSize: '1.15rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'transform 0.15s, background-color 0.15s',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const navButtonStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  color: '#1a1a1a',
  border: 'none',
  padding: '0.5rem 1.2rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

export default SpeechlessView;
