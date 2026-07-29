import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Leggi l'API key di Gemini dal file di configurazione .env caricato da Vite
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';

// Inizializza l'SDK di Google Gen AI
export const ai = new GoogleGenerativeAI(apiKey);

export interface GeneratedThemeResponse {
  theme: string;
  keywords: string[];
  slidePrompts: string[];
}

// Configurazione standard filtri di sicurezza Vertex AI tollerante per gioco goliardico GDG
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
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
 * Genera il tema, le parole chiave e i soggetti delle slide per Speechless basandosi su difficoltà, seed, lingua e numero di slide.
 */
export async function generateSpeechlessTheme(
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Legend',
  seed: string,
  language: 'it' | 'en',
  slidesCount: number
): Promise<GeneratedThemeResponse> {
  if (!apiKey) {
    throw new Error("API Key di Gemini non configurata nel file .env.");
  }

  // Definisci il modello corretto richiesto (Gemini 3.6 Flash)
  const model = ai.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      responseMimeType: 'application/json', // forza la risposta strutturata JSON
    },
    safetySettings,
    systemInstruction: `Sei il motore di Speechless, un PowerPoint Karaoke divertente per meetup tech (GDG Pescara).
Il tuo compito è generare:
1. Un singolo Titolo di presentazione in lingua ${language === 'it' ? 'Italiano' : 'Inglese'} basato sul livello di difficoltà "${difficulty}" e sul Seed dell'evento "${seed || 'nessuno'}". Il titolo deve essere goliardico, originale e adatto alla difficoltà impostata.
2. Un array JSON di esattamente ${slidesCount} descrizioni testuali in lingua INGLESE ("slidePrompts") da usare come prompt per generare immagini per le slide.
Restituisci l'output rigorosamente in formato JSON rispettando lo schema:
{
  "theme": "titolo generato",
  "keywords": ["parola1", "parola2", "parola3"],
  "slidePrompts": [
    "description of slide 1 subject in English",
    "description of slide 2 subject in English",
    ...
  ]
}`,
  });

  // Regole di prompt engineering per influenzare il modello in base alla difficoltà
  let promptDetails = '';
  switch (difficulty) {
    case 'Beginner':
      promptDetails = `Genera un titolo molto semplice, di argomento quotidiano, banale e comprensibile a chiunque. Le 3 keywords nel JSON devono essere strettamente correlate al titolo.
Gli esattamente ${slidesCount} slidePrompts devono essere descrizioni di immagini semplici e divertenti DIRETTAMENTE correlate e pertinenti al tema (es. se parli di pizza, descrivi l'impasto, il forno, ecc.).`;
      break;
    case 'Intermediate':
      promptDetails = `Genera un titolo divertente di media complessità che unisca un tema comune con un concetto vagamente tecnico o nerd. Le 3 keywords devono essere solo parzialmente correlate al titolo.
Gli esattamente ${slidesCount} slidePrompts devono essere descrizioni di immagini ironiche o bizzarre, solo parzialmente o indirettamente collegate al tema.`;
      break;
    case 'Advanced':
      promptDetails = `Genera un titolo tecnico, paradossale o marcatamente nerd/settoriale. Le 3 keywords devono essere quasi completamente scorrelate dal titolo.
Gli esattamente ${slidesCount} slidePrompts devono essere descrizioni di soggetti completamente CASUALI, assurdi e stravaganti, del tutto privi di attinenza semantica con il titolo o tra di loro.`;
      break;
    case 'Legend':
      promptDetails = `Genera un titolo estremamente assurdo, astratto, contorto e goliardico. Le 3 keywords fornite devono essere del tutto causali.
Gli esattamente ${slidesCount} slidePrompts devono essere descrizioni di soggetti totalmente ASSURDI, privi di nesso logico con il tema e del tutto indipendenti l'uno dall'altro (es. "a medieval knight playing laser tag", "a cat flying on a slice of bread").`;
      break;
  }

  if (seed) {
    promptDetails += ` IMPORTANTE: Il titolo DEVE includere o fare esplicito riferimento semantico a queste parole chiave del Seed dell'evento: "${seed}".`;
  }

  const response = await model.generateContent(promptDetails);
  const text = response.response.text();
  
  if (!text) {
    throw new Error("Gemini ha restituito una risposta vuota.");
  }

  const parsed = JSON.parse(text) as GeneratedThemeResponse;
  
  if (!parsed.theme || !Array.isArray(parsed.keywords) || !Array.isArray(parsed.slidePrompts)) {
    throw new Error("La risposta di Gemini non rispetta lo schema JSON atteso.");
  }

  return parsed;
}
