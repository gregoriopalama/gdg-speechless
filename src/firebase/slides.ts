import { ai } from './gemini';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Configurazione standard filtri di sicurezza tolleranti per Imagen/Nano Banana
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

/**
 * Genera un'immagine basata sul prompt fornito usando il modello gemini-3.1-flash-lite-image.
 * Restituisce l'URL dell'immagine generata (in formato base64 URI o URL pubblico in base all'SDK).
 */
export async function generateSpeechlessSlide(
  prompt: string,
  visualStyle: string | null
): Promise<string> {
  const model = ai.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-image',
    safetySettings
  });

  // Componi il prompt finale includendo lo stile visivo configurato dall'host
  let finalPrompt = prompt;
  if (visualStyle) {
    finalPrompt += `, style: ${visualStyle}, high quality, clean presentation slide format`;
  } else {
    finalPrompt += `, simple graphic presentation slide format`;
  }

  // Esegue la chiamata al modello di generazione immagini
  const response = await model.generateContent(finalPrompt);
  
  // Il modello restituisce i byte dell'immagine nel testo o come allegato inline.
  // In caso di risposte basate su base64 inline, convertiamo i byte in Data URL.
  const candidates = response.response.candidates;
  if (candidates && candidates.length > 0) {
    const part = candidates[0].content.parts[0];
    if (part.inlineData) {
      const mimeType = part.inlineData.mimeType;
      const base64Data = part.inlineData.data;
      return `data:${mimeType};base64,${base64Data}`;
    }
  }

  // Fallback se la risposta non è strutturata con inlineData (tenta di leggere il testo/URL)
  const textResult = response.response.text();
  if (textResult && (textResult.startsWith('data:image') || textResult.startsWith('http'))) {
    return textResult.trim();
  }

  throw new Error("Impossibile estrarre i dati dell'immagine generata da gemini-3.1-flash-lite-image.");
}
