import { useState, useEffect, useRef, useCallback } from 'react';
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
  slidePrompts?: string[];
  totalSlides: number;
  active: boolean;
}

const EMPTY_ARRAY: string[] = [];

export function useImagePreload({
  difficulty,
  visualStyle,
  slidePrompts = EMPTY_ARRAY,
  totalSlides,
  active,
}: UseImagePreloadProps) {
  const [slideQueue, setSlideQueue] = useState<SlideQueueItem[]>([]);
  const queueRef = useRef<SlideQueueItem[]>([]);

  // Costruisce il prompt della singola slide in base al soggetto di Gemini ed allo stile
  const buildPromptForSlide = useCallback((index: number): string => {
    // Se i prompt dinamici di Gemini sono già generati ed esiste quello per questo indice, usalo
    const basePrompt = (slidePrompts && slidePrompts[index]) 
      ? slidePrompts[index] 
      : `an abstract digital art concept related to ${difficulty} level`;

    // Se non è stato impostato uno stile globale dall'host, ne applichiamo uno casuale per ciascuna slide per massimizzare la varietà grafica
    if (!visualStyle) {
      const defaultStyles = [
        'isometric pixel art, 16-bit retro video game style',
        'vibrant 3D claymation, cute plasticine characters',
        'retro 80s synthwave neon vector illustration',
        'vintage gouache illustration, children\'s book style',
        'pop art comic book style, dotted halftone shading, bold outlines',
        'cyberpunk digital painting, glowing neon lights and wires',
        'minimalist flat vector illustration, pastel color palette',
        'whimsical watercolor painting with ink outlines',
        'medieval manuscript illumination style, gold leaf accents',
        'steampunk blueprint schematic, detailed chalk drawing on blackboard',
        'low-poly 3D papercraft model, colorful folded paper textures',
        'vintage tarot card design, mystical borders and engravings',
        'psychedelic 70s poster art, swirling patterns, vibrant colors',
        'cute chibi anime sticker design, glossy outline',
        'expressionist oil painting, thick impasto brushstrokes',
        'constructivist propaganda poster, bold geometric shapes, red and black'
      ];
      const randomStyle = defaultStyles[index % defaultStyles.length];
      return `${basePrompt}, ${randomStyle}`;
    }

    return basePrompt;
  }, [difficulty, slidePrompts, visualStyle]);

  // Inizializza la coda dei compiti delle slide
  useEffect(() => {
    if (!active || totalSlides <= 0) return;

    // Se stiamo aspettando i prompt delle slide generati da Gemini, non inizializziamo la coda finché non sono pronti
    if (active && (!slidePrompts || slidePrompts.length === 0)) {
      return;
    }

    const initialQueue: SlideQueueItem[] = Array.from({ length: totalSlides }, (_, i) => ({
      index: i,
      url: null,
      status: 'PENDING',
      prompt: buildPromptForSlide(i),
    }));

    setSlideQueue(initialQueue);
    queueRef.current = initialQueue;
  }, [active, totalSlides, buildPromptForSlide, slidePrompts]);

  const updateQueueItem = useCallback((index: number, updates: Partial<SlideQueueItem>) => {
    const updated = queueRef.current.map((item) =>
      item.index === index ? { ...item, ...updates } : item
    );
    queueRef.current = updated;
    setSlideQueue(updated);
  }, []);

  // Gestore della coda asincrona di generazione e preloading delle immagini
  const triggerGenerationForIndex = useCallback(async (index: number) => {
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
  }, [visualStyle, updateQueueItem]);

  // Gestione dinamica del pipelining progressivo (vantaggio di 2 slide)
  const preloadSlidesForCurrentIndex = useCallback((currentIndex: number) => {
    if (!active || queueRef.current.length === 0) return;

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
  }, [active, totalSlides, triggerGenerationForIndex]);

  return { slideQueue, preloadSlidesForCurrentIndex };
}
export default useImagePreload;
