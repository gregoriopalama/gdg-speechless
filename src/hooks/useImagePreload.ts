import { useState, useEffect, useRef } from 'react';
import { generateSpeechlessSlide } from '../firebase/slides';

export interface SlideQueueItem {
  index: number;
  url: string | null;
  status: 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';
  prompt: string;
  error?: string;
}

interface UseImagePreloadProps {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Legend';
  visualStyle: string | null;
  keywords: string[];
  totalSlides: number;
  active: boolean;
}

export function useImagePreload({
  difficulty,
  visualStyle,
  keywords,
  totalSlides,
  active,
}: UseImagePreloadProps) {
  const [slideQueue, setSlideQueue] = useState<SlideQueueItem[]>([]);
  const queueRef = useRef<SlideQueueItem[]>([]);

  // Funzione helper per generare un prompt casuale per il livello Legend ed Advanced
  const generateRandomPrompt = (index: number): string => {
    const subjects = ['a coding cat', 'a flying pig', 'a database crash', 'a dinosaur coding in assembly', 'a cup of coffee overflowing', 'a pixel art rocket'];
    const actions = ['drinking coffee', 'exploding in space', 'screaming at a server', 'dancing in a server room', 'floating in a bubble'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    return `${randomSubject} ${randomAction}, slide number ${index + 1}`;
  };

  // Costruisce il prompt della singola slide in base alla difficoltà ed alle keyword di Gemini
  const buildPromptForSlide = (index: number): string => {
    if (difficulty === 'Beginner' && keywords.length > 0) {
      // Per beginner, usa le parole chiave generate da Gemini
      const kw = keywords[index % keywords.length];
      return `A clear illustration showing ${kw}, flat presentation vector slide format`;
    }
    // Per Legend o Advanced, genera prompt totalmente slegati e astratti
    return generateRandomPrompt(index);
  };

  // Inizializza la coda dei compiti delle slide
  useEffect(() => {
    if (!active || totalSlides <= 0) return;

    const initialQueue: SlideQueueItem[] = Array.from({ length: totalSlides }, (_, i) => ({
      index: i,
      url: null,
      status: 'PENDING',
      prompt: buildPromptForSlide(i),
    }));

    setSlideQueue(initialQueue);
    queueRef.current = initialQueue;
  }, [active, difficulty, keywords, totalSlides]);

  // Gestore della coda asincrona di generazione e preloading delle immagini
  const triggerGenerationForIndex = async (index: number) => {
    // Evita generazioni duplicate
    const currentItem = queueRef.current[index];
    if (!currentItem || currentItem.status !== 'PENDING') return;

    // Aggiorna lo stato in GENERATING
    updateQueueItem(index, { status: 'GENERATING' });

    try {
      // Chiama Vertex AI per generare l'immagine
      const url = await generateSpeechlessSlide(currentItem.prompt, visualStyle);

      // Pre-carica l'immagine in cache nel browser per evitare lag visivi
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Errore durante il pre-rendering dell'immagine"));
      });

      // Aggiorna in READY con l'URL dell'immagine pre-caricata
      updateQueueItem(index, { url, status: 'READY' });
    } catch (err: any) {
      console.error(`Errore generazione slide #${index + 1}:`, err);
      updateQueueItem(index, { status: 'FAILED', error: err.message });
    }
  };

  const updateQueueItem = (index: number, updates: Partial<SlideQueueItem>) => {
    const updated = queueRef.current.map((item) =>
      item.index === index ? { ...item, ...updates } : item
    );
    queueRef.current = updated;
    setSlideQueue(updated);
  };

  // Gestione dinamica del pipelining progressivo (vantaggio di 2 slide)
  const preloadSlidesForCurrentIndex = (currentIndex: number) => {
    if (!active || slideQueue.length === 0) return;

    // Genera e carica in anticipo: slide corrente (N), N+1 e N+2
    const targetIndices = [currentIndex, currentIndex + 1, currentIndex + 2].filter(
      (idx) => idx >= 0 && idx < totalSlides
    );

    targetIndices.forEach((idx) => {
      const item = queueRef.current[idx];
      if (item && item.status === 'PENDING') {
        triggerGenerationForIndex(idx);
      }
    });
  };

  return { slideQueue, preloadSlidesForCurrentIndex };
}
export default useImagePreload;
