import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

// Interfacce per la tipizzazione coerente con SPEC002
export interface RoundState {
  id: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Legend';
  status: 'SETUP' | 'INTRO' | 'PLAYING' | 'FINISHED' | 'ERROR';
  theme: string;
  currentSlideIndex: number;
  totalSlides: number;
  slideQueue: string[];
}

export interface SessionState {
  seed: string;
  language: 'it' | 'en';
  slidesCount: number;
  visualStyle: string | null;
  currentRound: RoundState | null;
}

// Riferimento al documento fisso in Firestore
const SESSION_DOC_PATH = 'sessions/active_session';
const sessionDocRef = doc(db, SESSION_DOC_PATH);

// Stato di default iniziale
const DEFAULT_SESSION_STATE: SessionState = {
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

/**
 * Inizializza la sessione attiva su Firestore con valori di default se non esiste.
 */
export async function initializeSessionIfNeeded(): Promise<SessionState> {
  const snapshot = await getDoc(sessionDocRef);
  if (!snapshot.exists()) {
    await setDoc(sessionDocRef, DEFAULT_SESSION_STATE);
    return DEFAULT_SESSION_STATE;
  }
  return snapshot.data() as SessionState;
}

/**
 * Aggiorna i parametri di configurazione dell'host (seed, lingua, numero slide, stile visivo).
 */
export async function updateHostConfiguration(
  config: Partial<Pick<SessionState, 'seed' | 'language' | 'slidesCount' | 'visualStyle'>>
): Promise<void> {
  await updateDoc(sessionDocRef, config);
}

/**
 * Aggiorna lo stato del round corrente (avvio round, cambio slide, fine round).
 */
export async function updateRoundState(
  roundUpdate: Partial<RoundState>
): Promise<void> {
  // Costruisce la query nidificata per aggiornare solo i campi di currentRound
  const updatePayload: Record<string, any> = {};
  Object.entries(roundUpdate).forEach(([key, value]) => {
    updatePayload[`currentRound.${key}`] = value;
  });
  await updateDoc(sessionDocRef, updatePayload);
}

/**
 * Resetta la sessione riportandola allo stato di SETUP.
 */
export async function resetSession(): Promise<void> {
  await updateDoc(sessionDocRef, {
    'currentRound.status': 'SETUP',
    'currentRound.id': '',
    'currentRound.theme': '',
    'currentRound.currentSlideIndex': 0,
    'currentRound.slideQueue': [],
  });
}
