import React, { useEffect, useState } from 'react';
import { useSpeechless } from '../context/SpeechlessContext';
import { useTranslation } from 'react-i18next';
import { useImagePreload } from '../hooks/useImagePreload';
import { generateSpeechlessTheme } from '../firebase/gemini';
import ErrorFallback from '../components/common/ErrorFallback';

export const SpeechlessView: React.FC = () => {
  const { gameState, updateRound, resetGame } = useSpeechless();
  const { t } = useTranslation();

  const currentRound = gameState?.currentRound;
  const visualStyle = gameState?.visualStyle || null;
  const seed = gameState?.seed || '';

  const [keywords, setKeywords] = useState<string[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatingTheme, setGeneratingTheme] = useState<boolean>(false);

  // Genera il tema e le keywords all'avvio dell'INTRO
  useEffect(() => {
    if (!currentRound || currentRound.status !== 'INTRO') return;

    let active = true;

    async function initRound() {
      if (!currentRound) return;
      setGeneratingTheme(true);
      setGenerationError(null);
      try {
        const result = await generateSpeechlessTheme(currentRound.difficulty, seed, gameState?.language || 'it', currentRound.totalSlides);
        if (active) {
          setKeywords(result.keywords);
          // Salva il tema generato nel database insieme ai prompt delle slide
          await updateRound({ theme: result.theme, slidePrompts: result.slidePrompts });
        }
      } catch (err: any) {
        console.error("Errore generazione tema:", err);
        if (active) {
          setGenerationError(err.message || "Errore sconosciuto durante la generazione del tema.");
          await updateRound({ status: 'ERROR' });
        }
      } finally {
        if (active) {
          setGeneratingTheme(false);
        }
      }
    }

    initRound();

    return () => {
      active = false;
    };
  }, [currentRound?.status, currentRound?.difficulty, currentRound?.totalSlides, seed, gameState?.language, updateRound]);

  // Hook per il caricamento preventivo asincrono delle immagini delle slide
  const { slideQueue, preloadSlidesForCurrentIndex } = useImagePreload({
    difficulty: currentRound?.difficulty || 'Beginner',
    visualStyle,
    slidePrompts: currentRound?.slidePrompts,
    totalSlides: currentRound?.totalSlides || 5,
    active: !!currentRound && (currentRound.status === 'PLAYING' || currentRound.status === 'INTRO'),
  });

  // Pre-carica e genera le slide future in background basandosi sull'indice corrente
  useEffect(() => {
    if (!currentRound) return;
    if (currentRound.status === 'PLAYING') {
      preloadSlidesForCurrentIndex(currentRound.currentSlideIndex);
    } else if (currentRound.status === 'INTRO' && keywords.length > 0) {
      // Avvia la generazione di tutte le slide in background in parallelo per eliminare i lag visivi
      for (let i = 0; i < currentRound.totalSlides; i++) {
        preloadSlidesForCurrentIndex(i);
      }
    }
  }, [currentRound?.status, currentRound?.currentSlideIndex, currentRound?.totalSlides, keywords, preloadSlidesForCurrentIndex]);

  const handleNext = React.useCallback(() => {
    if (!currentRound) return;
    // Avanza se la slide corrente è pronta, altrimenti aspetta
    const currentSlide = slideQueue[currentRound.currentSlideIndex];
    if (currentSlide && currentSlide.status !== 'READY') {
      console.warn("La slide successiva non è ancora pronta. Attendi la generazione.");
      return;
    }

    if (currentRound.currentSlideIndex < currentRound.totalSlides - 1) {
      updateRound({ currentSlideIndex: currentRound.currentSlideIndex + 1 });
    } else {
      updateRound({ status: 'FINISHED' });
    }
  }, [currentRound, slideQueue, updateRound]);

  const handlePrev = React.useCallback(() => {
    if (!currentRound) return;
    if (currentRound.currentSlideIndex > 0) {
      updateRound({ currentSlideIndex: currentRound.currentSlideIndex - 1 });
    }
  }, [currentRound, updateRound]);

  // Gestione tasti di navigazione globali (ArrowRight, Space, Enter, ArrowLeft)
  useEffect(() => {
    if (!currentRound || currentRound.status !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentRound?.status, handleNext, handlePrev]);

  if (!currentRound) return null;

  if (currentRound.status === 'ERROR') {
    return <ErrorFallback error={generationError || "Errore sconosciuto API"} onReset={resetGame} />;
  }

  if (currentRound.status === 'INTRO') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', maxWidth: '800px', padding: '2rem' }}>
          <h3 style={introLabelStyle}>
            {t(`levels.${currentRound.difficulty.toLowerCase()}.name`)} Mode
          </h3>
          {generatingTheme ? (
            <div style={loadingThemeContainer}>
              <div style={spinnerStyle}></div>
              <p style={{ marginTop: '1rem', color: '#666' }}>{t('gameplay.loading.theme')}</p>
            </div>
          ) : (
            <h1 style={introTitleStyle}>
              {currentRound.theme}
            </h1>
          )}
          
          <button
            onClick={() => updateRound({ status: 'PLAYING' })}
            disabled={generatingTheme || !currentRound.theme}
            style={{
              ...buttonStyle,
              opacity: (generatingTheme || !currentRound.theme) ? 0.5 : 1,
              cursor: (generatingTheme || !currentRound.theme) ? 'not-allowed' : 'pointer',
            }}
          >
            {t('gameplay.start')}
          </button>
        </div>
      </div>
    );
  }

  if (currentRound.status === 'FINISHED') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
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

  const currentSlide = slideQueue[currentRound.currentSlideIndex];
  const isImageReady = currentSlide && currentSlide.status === 'READY';
  const isImageLoading = currentSlide && (currentSlide.status === 'PENDING' || currentSlide.status === 'GENERATING');
  const hasFailed = currentSlide && currentSlide.status === 'FAILED';

  // Slide Deck principale
  return (
    <div style={deckContainerStyle} onClick={handleNext}>
      {/* Sfondo slide: Mostra l'immagine se caricata, altrimenti spinner o errore */}
      {isImageReady && currentSlide.url ? (
        <div style={slideImageStyle(currentSlide.url)} />
      ) : isImageLoading ? (
        <div style={loadingSlideContainer}>
          <div style={spinnerStyle}></div>
          <h3 style={{ marginTop: '1.5rem', color: '#868e96' }}>{t('gameplay.loading.slides')}</h3>
        </div>
      ) : hasFailed ? (
        <div style={loadingSlideContainer}>
          <p style={{ color: '#dc3545', fontWeight: 'bold' }}>Generazione slide fallita.</p>
          <p style={{ fontSize: '0.9rem', color: '#868e96' }}>{currentSlide.error}</p>
        </div>
      ) : (
        <div style={slidePlaceholderStyle(currentRound.currentSlideIndex)}>
          <h2 style={{ fontSize: '2rem', color: '#adb5bd', fontWeight: 'bold' }}>
            [ Slide #{currentRound.currentSlideIndex + 1} - In attesa di avvio ]
          </h2>
        </div>
      )}

      {/* Tema bloccato in basso con sfondo semitrasparente scuro (glassmorphism) a tutta larghezza */}
      <div style={subtitleOverlayStyle}>
        <p style={{ margin: 0, fontSize: '1.7rem', fontWeight: '850', color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' }}>
          {currentRound.theme}
        </p>
        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '600', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>
          Slide {currentRound.currentSlideIndex + 1} di {currentRound.totalSlides}
        </p>
      </div>
    </div>
  );
};

// Stili Layout e UX chiari eleganti
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100vw',
  backgroundColor: '#f8f9fa',
  color: '#212529',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: '"Outfit", sans-serif',
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

const slideImageStyle = (url: string): React.CSSProperties => ({
  width: '100%',
  height: '100%',
  backgroundImage: `url(${url})`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: '#ffffff',
});

const loadingSlideContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  backgroundColor: '#f8f9fa',
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
  };
};

const subtitleOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  backdropFilter: 'blur(15px) saturate(150%)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '1.25rem 2rem',
  textAlign: 'center',
  boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
};

const introLabelStyle: React.CSSProperties = {
  textTransform: 'uppercase',
  color: '#6c757d',
  letterSpacing: '3px',
  margin: '0 0 1.5rem 0',
  fontSize: '1rem',
  fontWeight: 'bold',
};

const introTitleStyle: React.CSSProperties = {
  fontSize: '3.5rem',
  margin: '0 0 3rem 0',
  fontWeight: '950',
  color: '#1a1a1a',
  lineHeight: '1.25',
  letterSpacing: '-1.5px',
};

const loadingThemeContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  margin: '0 0 3rem 0',
};

const spinnerStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  border: '5px solid #e9ecef',
  borderTop: '5px solid #1a1a1a',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
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
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

// Aggiungi keyframes CSS per lo spinner
const styleSheet = document.styleSheets[0] || (() => {
  const style = document.createElement("style");
  document.head.appendChild(style);
  return style.sheet;
})();
try {
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
} catch (e) {}

export default SpeechlessView;
