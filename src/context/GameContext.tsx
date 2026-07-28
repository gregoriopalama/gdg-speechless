import React, { createContext, useContext, ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';
import { SessionState, updateHostConfiguration, updateRoundState, resetSession } from '../firebase/services';

interface GameContextType {
  gameState: SessionState | null;
  loading: boolean;
  error: Error | null;
  updateHostConfig: typeof updateHostConfiguration;
  updateRound: typeof updateRoundState;
  resetGame: typeof resetSession;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { gameState, loading, error } = useGameState();

  return (
    <GameContext.Provider
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
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
