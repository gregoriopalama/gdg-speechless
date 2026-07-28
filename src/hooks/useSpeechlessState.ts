import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { SessionState } from '../firebase/services';
import { initializeSessionIfNeeded } from '../firebase/services';

const SESSION_DOC_PATH = 'sessions/active_session';

export function useSpeechlessState() {
  const [gameState, setGameState] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    async function setupListener() {
      // Innesca un timeout di 3 secondi. Se Firestore non risponde (es. emulator non attivo), carica lo stato in locale in memoria.
      const fallbackTimeout = setTimeout(() => {
        console.warn("Firestore non risponde. Avvio in modalità demo locale in RAM.");
        const localMockState: SessionState = {
          seed: 'GDG Pescara (Demo Locale)',
          language: 'it',
          slidesCount: 5,
          visualStyle: null,
          currentRound: {
            id: 'demo-id',
            difficulty: 'Beginner',
            status: 'SETUP',
            theme: '',
            currentSlideIndex: 0,
            totalSlides: 5,
            slideQueue: [],
          },
        };
        setGameState(localMockState);
        setLoading(false);
      }, 3000);

      try {
        await initializeSessionIfNeeded();
        clearTimeout(fallbackTimeout);
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
        console.error("Error setting up SpeechlessState listener:", err);
        clearTimeout(fallbackTimeout);
        const localMockState: SessionState = {
          seed: 'GDG Pescara (Local Memory Mode)',
          language: 'it',
          slidesCount: 5,
          visualStyle: null,
          currentRound: {
            id: 'demo-id',
            difficulty: 'Beginner',
            status: 'SETUP',
            theme: '',
            currentSlideIndex: 0,
            totalSlides: 5,
            slideQueue: [],
          },
        };
        setGameState(localMockState);
        setLoading(false);
      }
    }

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { gameState, loading, error };
}
export default useSpeechlessState;
