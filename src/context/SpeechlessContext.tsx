import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSpeechlessState } from '../hooks/useSpeechlessState';
import type { SessionState } from '../firebase/services';
import { updateHostConfiguration, updateRoundState, resetSession } from '../firebase/services';

interface SpeechlessContextType {
  gameState: SessionState | null;
  loading: boolean;
  error: Error | null;
  updateHostConfig: typeof updateHostConfiguration;
  updateRound: typeof updateRoundState;
  resetGame: typeof resetSession;
}

const SpeechlessContext = createContext<SpeechlessContextType | undefined>(undefined);

export const SpeechlessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { gameState, loading, error } = useSpeechlessState();

  return (
    <SpeechlessContext.Provider
      value={{
        gameState,
        loading,
        error,
        updateHostConfig: updateHostConfiguration,
        updateRound: updateRoundState,
        resetGame: resetSession,
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
