import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSpeechlessState } from '../hooks/useSpeechlessState';
import type { SessionState, RoundState } from '../firebase/services';
import { updateHostConfiguration, updateRoundState, resetSession } from '../firebase/services';

interface SpeechlessContextType {
  gameState: SessionState | null;
  loading: boolean;
  error: Error | null;
  updateHostConfig: (config: Partial<Pick<SessionState, 'seed' | 'language' | 'slidesCount' | 'visualStyle'>>) => Promise<void>;
  updateRound: (roundUpdate: Partial<RoundState>) => Promise<void>;
  resetGame: () => Promise<void>;
}

const SpeechlessContext = createContext<SpeechlessContextType | undefined>(undefined);

// Variabile temporanea per simulare lo stato in memoria RAM locale in caso di assenza di rete / Firestore offline
let memoryDbState: SessionState = {
  seed: '',
  language: 'it',
  slidesCount: 5,
  visualStyle: null,
  currentRound: {
    id: '',
    difficulty: 'Beginner',
    status: 'SETUP',
    theme: '',
    currentSlideIndex: 0,
    totalSlides: 5,
    slideQueue: [],
  },
};

export const SpeechlessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { gameState: cloudState, loading: cloudLoading, error: cloudError, isOffline: cloudIsOffline } = useSpeechlessState();
  const [localState, setLocalState] = useState<SessionState>(memoryDbState);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Sincronizza lo stato locale in base al cloud se disponibile, altrimenti passa in modalità locale in RAM
  useEffect(() => {
    if (cloudIsOffline) {
      setIsOfflineMode(true);
    } else if (cloudState) {
      setLocalState(cloudState);
      memoryDbState = cloudState;
      setIsOfflineMode(false);
    } else if (!cloudLoading && (cloudError || !cloudState)) {
      setIsOfflineMode(true);
    }
  }, [cloudState, cloudLoading, cloudError, cloudIsOffline]);

  // Se dopo 3 secondi Firestore non ha risposto, forziamo la modalità offline in RAM
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cloudLoading && !cloudState) {
        setIsOfflineMode(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [cloudLoading, cloudState]);

  // Implementazione sicura delle funzioni di mutazione che operano sia sul Cloud sia sulla memoria locale
  const handleUpdateHostConfig = async (config: Partial<Pick<SessionState, 'seed' | 'language' | 'slidesCount' | 'visualStyle'>>) => {
    if (!isOfflineMode) {
      try {
        await updateHostConfiguration(config);
        return;
      } catch (e) {
        console.warn("Chiamata Firestore fallita, eseguo fallback locale.", e);
        setIsOfflineMode(true);
      }
    }
    const updated = { ...memoryDbState, ...config };
    memoryDbState = updated;
    setLocalState(updated);
  };

  const handleUpdateRound = async (roundUpdate: Partial<RoundState>) => {
    if (!isOfflineMode) {
      try {
        await updateRoundState(roundUpdate);
        return;
      } catch (e) {
        console.warn("Chiamata Firestore fallita, eseguo fallback locale.", e);
        setIsOfflineMode(true);
      }
    }
    const currentRound = memoryDbState.currentRound || {
      id: '',
      difficulty: 'Beginner' as const,
      status: 'SETUP' as const,
      theme: '',
      currentSlideIndex: 0,
      totalSlides: 5,
      slideQueue: [],
    };
    const updatedRound = { ...currentRound, ...roundUpdate };
    const updated = { ...memoryDbState, currentRound: updatedRound };
    memoryDbState = updated;
    setLocalState(updated);
  };

  const handleResetGame = async () => {
    if (!isOfflineMode) {
      try {
        await resetSession();
        return;
      } catch (e) {
        console.warn("Chiamata Firestore fallita, eseguo fallback locale.", e);
        setIsOfflineMode(true);
      }
    }
    const updated = {
      ...memoryDbState,
      currentRound: {
        id: '',
        difficulty: 'Beginner' as const,
        status: 'SETUP' as const,
        theme: '',
        currentSlideIndex: 0,
        totalSlides: memoryDbState.slidesCount,
        slideQueue: [],
      },
    };
    memoryDbState = updated;
    setLocalState(updated);
  };

  // Se stiamo ancora caricando e non siamo in modalità offline di emergenza, mostra il caricamento
  const isLoading = cloudLoading && !isOfflineMode;

  return (
    <SpeechlessContext.Provider
      value={{
        gameState: localState,
        loading: isLoading,
        error: isOfflineMode ? null : cloudError,
        updateHostConfig: handleUpdateHostConfig,
        updateRound: handleUpdateRound,
        resetGame: handleResetGame,
      }}
    >
      {children}
    </SpeechlessContext.Provider>
  );
};

export const useSpeechless = () => {
  const context = useContext(SpeechlessContext);
  if (!context) {
    throw new Error('useSpeechless must be used within a SpeechlessProvider');
  }
  return context;
};
