# SPEC003: AI Generation Engine

## 1. Obiettivo
Implementare il motore di intelligenza artificiale per la generazione dei temi (tramite Gemini) e delle immagini delle slide (tramite il modello `gemini-3.1-flash-lite-image`) integrato con Vertex AI in Firebase (GEAP).

---

## 2. Dettagli Implementativi

### 2.1 Prompt Engineering per Gemini (Generazione Tema)
L'applicazione invia una richiesta a Gemini strutturando il prompt in base alle impostazioni di lingua, difficoltà e seed dell'host.

#### Prompt di Sistema (System Instructions):
```text
Sei il motore di Speechless, un PowerPoint Karaoke game divertente per meetup tech (GDG).
Il tuo compito è generare un singolo Titolo di presentazione in lingua {language} basato sul livello di difficoltà {difficulty} e sul Seed dell'evento {seed}.
Il titolo deve essere goliardico, originale e in linea con il livello impostato.
Restituisci l'output rigorosamente in formato JSON:
{
  "theme": "titolo generato",
  "keywords": ["parola1", "parola2", "parola3"]
}
```

#### Regole per Difficoltà nel Prompt:
* **Beginner:** Temi quotidiani e semplici (es. "L'impatto dei gatti sulla produttività degli sviluppatori"). Le keywords fornite in JSON devono riflettere strettamente il tema (serviranno per generare le immagini).
* **Intermediate / Advanced:** Temi più complessi o marcatamente nerd/tech (es. "Ottimizzare Kubernetes usando l'astrologia").
* **Legend:** Temi assurdi, paradossali e complessi (es. "La teoria quantistica della fila alle poste"). Le keywords fornite devono essere astratte o disconnesse dal tema.

### 2.2 Prompt Engineering per Nano Banana (Generazione Slide)
L'applicazione compone il prompt per ciascuna slide basandosi sul livello di gioco e sullo stile visivo impostato:
* **Beginner:** Il prompt dell'immagine include direttamente le parole chiave estratte dal tema generato da Gemini (es. *"A cute cat sitting on a laptop typing code"*).
* **Legend:** Il prompt dell'immagine viene costruito estraendo concetti casuali e stili artistici imprevedibili (es. *"an abstract graph showing negative values, crayons drawing style"*), evitando volutamente qualsiasi parola chiave del tema.
* **Iniezione Stile (se configurato):** Se l'host ha configurato uno stile visivo (es. *Pixel Art*), la stringa `, pixel art style, high quality` viene accodata in fondo a ogni prompt d'immagine generato.

### 2.3 Gestione degli Errori e Safety Settings
* Le chiamate API a Vertex AI includeranno impostazioni di sicurezza tolleranti ma conformi (`blockNone` o `blockLow` sui filtri di molestia/odio per evitare falsi positivi su termini goliardici).
* Se una chiamata fallisce (es. per rate limit o blocco di sicurezza), l'Engine restituisce una risposta d'errore strutturata che attiva lo stato `ERROR` nell'applicazione.

---

## 3. Criteri di Accettazione (Acceptance Criteria)
* **AC-03.1:** Il tema generato da Gemini deve rispettare la lingua impostata dall'host (se l'host imposta "it", il titolo deve essere in italiano).
* **AC-03.2:** Se viene definito un seed dall'host (es. "pasta alla carbonara"), il tema generato da Gemini deve fare riferimento o contenere concetti legati a quel seed.
* **AC-03.3:** Le chiamate a `gemini-3.1-flash-lite-image` per le immagini delle slide devono rispettare lo stile grafico globale impostato (es. se "Cyberpunk" è attivo, l'immagine deve essere chiaramente in stile cyberpunk).
* **AC-03.4:** Se un prompt tocca un limite dei filtri o l'API fallisce, l'app non deve andare in crash ma mostrare la schermata d'errore goliardica entro 10 secondi di timeout.
