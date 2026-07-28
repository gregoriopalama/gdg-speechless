import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SessionState, initializeSessionIfNeeded } from '../firebase/services';

const SESSION_DOC_PATH = 'sessions/active_session';

export function useGameState() {
  const [gameState, setGameState] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Inizializza la sessione su db se non presente, poi attiva il listener
    let unsubscribe: () => void;

    async function setupListener() {
      try {
        await initializeSessionIfNeeded();
        const docRef = doc(db, SESSION_DOC_PATH);

        unsubscribe = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setGameState(docSnap.data() as SessionState);
            }
            setLoading(false);
          },
          (err) => {
            console.error("Firestore snapshot error:", err);
            setError(err);
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error("Error setting up GameState listener:", err);
        setError(err);
        setLoading(false);
      }
    }

    setupListener();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { gameState, loading, error };
}
export default useGameState;
