# SPEC003: AI Generation Engine

## 1. Obiettivo
Implementare il motore di intelligenza artificiale per la generazione dei temi (tramite Gemini) e delle immagini delle slide (tramite il modello `gemini-3.1-flash-lite-image`) integrato con Vertex AI in Firebase (GEAP).

---

## 2. Dettagli Implementativi

### 2.1 Prompt Engineering per Gemini (Generazione Tema e Soggetti)
L'applicazione invia una richiesta a Gemini strutturando il prompt in base alle impostazioni di lingua, difficoltà, seed dell'host e numero di slide (`slidesCount`).

#### Prompt di Sistema (System Instructions):
```text
Sei il motore di Speechless, un PowerPoint Karaoke divertente per meetup tech (GDG).
Il tuo compito è generare:
1. Un singolo Titolo di presentazione in lingua {language} basato sulla difficoltà "{difficulty}" e sul Seed "{seed}". Il titolo deve essere goliardico, originale e in linea con la difficoltà.
2. Un array JSON di esattamente {slidesCount} prompt/soggetti testuali in lingua INGLESE ("slidePrompts") da passare a un generatore di immagini AI.
Restituisci l'output rigorosamente in formato JSON:
{
  "theme": "titolo generato",
  "keywords": ["parola1", "parola2", "parola3"],
  "slidePrompts": [
    "detailed description of slide 1 subject in English",
    "detailed description of slide 2 subject in English",
    ...
  ]
}
```

#### Regole per Difficoltà nel Prompt (Generazione Soggetti Slide):
* **Beginner:** I soggetti descritti in `slidePrompts` devono essere semplici, divertenti e direttamente connessi al tema generato (es. se il tema è sulla pizza, i soggetti saranno "dough kneading", "pizza oven", ecc.).
* **Intermediate:** I soggetti devono essere moderatamente stravaganti e solo parzialmente o ironicamente correlati al tema della presentazione.
* **Legend / Advanced:** I soggetti in `slidePrompts` devono essere completamente casuali, assurdi, privi di nesso logico con il tema e del tutto indipendenti l'uno dall'altro.

### 2.2 Prompt Engineering per Imagen/Nano Banana (Generazione Slide)
L'applicazione non usa più soggetti hardcoded, ma invia direttamente a Imagen il soggetto estratto da `slidePrompts[index]` restituito da Gemini:
* **Prevenzione di Numeri e Grafici Ripetitivi:** I prompt inviati a Imagen **non devono contenere riferimenti al numero di slide** (es. vietato `"slide number X"`) né gergo strutturale di presentazione (es. vietato `"presentation slide format"`). Al loro posto, il soggetto di Gemini viene arricchito con suffissi di stile.
* **Varietà degli stili visivi:** Se l'host non ha configurato uno stile globale, l'applicazione assegna a ciascun prompt una tecnica artistica differente scelta da una lista estesa di 16 stili visivi premium (es. *isometric pixel art*, *vibrant 3D claymation*, *retro 80s synthwave neon*, *vintage gouache*, *pop art comic book with halftone*, *medieval manuscript*, *steampunk blueprint*, *chibi anime sticker*, ecc.) per massimizzare la varietà grafica del round.
* **Iniezione Stile (se configurato):** Se l'host ha configurato uno stile visivo (es. *Pixel Art*), la stringa `, style: Pixel Art, high quality` viene accodata in fondo a ogni prompt d'immagine generato.

### 2.3 Gestione degli Errori e Safety Settings
* Le chiamate API a Vertex AI includeranno impostazioni di sicurezza tolleranti ma conformi (`blockNone` o `blockLow` sui filtri di molestia/odio per evitare falsi positivi su termini goliardici).
* Se una chiamata fallisce (es. per rate limit o blocco di sicurezza), l'Engine restituisce una risposta d'errore strutturata che attiva lo stato `ERROR` nell'applicazione.

---

## 3. Criteri di Accettazione (Acceptance Criteria)
* **AC-03.1:** Il tema generato da Gemini deve rispettare la lingua impostata dall'host (se l'host imposta "it", il titolo deve essere in italiano).
* **AC-03.2:** Se viene definito un seed dall'host (es. "pasta alla carbonara"), il tema generato da Gemini deve fare riferimento o contenere concetti legati a quel seed.
* **AC-03.3:** Le chiamate a `gemini-3.1-flash-lite-image` per le immagini delle slide devono rispettare lo stile grafico globale impostato (es. se "Cyberpunk" è attivo, l'immagine deve essere chiaramente in stile cyberpunk).
* **AC-03.4:** Se un prompt tocca un limite dei filtri o l'API fallisce, l'app non deve andare in crash ma mostrare la schermata d'errore goliardica entro 10 secondi di timeout.
