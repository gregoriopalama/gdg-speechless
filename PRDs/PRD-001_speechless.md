# Product Requirement Document (PRD) - Speechless

## 1. Vision & Overview
**Speechless** (conosciuto anche come PowerPoint Karaoke o Battledecks) è una web application interattiva pensata come attività rompighiaccio ed entertainment per meetup, eventi tech (come il GDG Pescara) e attività di team building. 
Un relatore deve presentare un tema assegnato utilizzando una serie di slide mostrate a schermo in modo casuale o programmato, le quali spesso non hanno alcuna attinenza logica con il tema stesso.

---

## 2. Livelli di Difficoltà (Difficulty Levels)
La sessione di Speechless prevede 4 livelli di difficoltà. La selezione del livello nell'interfaccia utente è resa immediata e goliardica tramite l'uso di icone/emoji identificative (rimuovendo descrizioni verbose e didattiche) in un layout completamente centrato a schermo intero senza bande laterali o bordi:

1. **Beginner (Principiante) - 🍌**
   * **Temi:** Semplici, poco elaborati o profondi (es. argomenti quotidiani).
   * **Slide:** Presentano una qualche forma di correlazione logica o tematica con il tema proposto, anche se non in modo del tutto diretto.
   * **Coerenza:** C'è una parvenza di filo conduttore tra le slide successive.

2. **Intermediate (Intermedio) - 🐒**
   * **Temi:** Di media complessità, con un mix di concetti comuni e qualche nozione più specifica o astratta.
   * **Slide:** Correlazione debole con il tema; le slide iniziano a deviare, introducendo elementi inaspettati.
   * **Coerenza:** Coerenza interna ridotta, ma con qualche transizione logica possibile.

3. **Advanced (Avanzato) - 🌶️**
   * **Temi:** Tecnici, settoriali o paradossali (richiedono uno sforzo di ragionamento o immaginazione maggiore).
   * **Slide:** Quasi nessuna correlazione con il tema. Le slide sfidano il relatore a trovare collegamenti improbabili.
   * **Coerenza:** Bassa coerenza tra le slide successive.

4. **Legend (Leggenda) - 👑**
   * **Temi:** Estremamente complessi, astratti e articolati, pur rimanendo sempre goliardici.
   * **Slide:** Nessuna correlazione con il tema, né alcuna correlazione tra una slide e l'altra. Totale imprevedibilità e caos visivo.

## 3. Generazione Contenuti & Integrazione AI (Vertex AI)
Il motore di intelligenza artificiale sfrutterà le API cloud di Google Cloud Platform integrate con Firebase:

* **Integrazione Vertex AI (GEAP):** Si utilizzerà Vertex AI in Firebase per interfacciarsi con i modelli.
  * **Generatore di Temi e Soggetti Slide (AI Text):** Gestito da **Gemini** tramite Vertex AI SDK. Riceve il livello di difficoltà, il seed dell'host, la lingua impostata e il numero di slide desiderate. Restituisce il tema, le keywords e un array di descrizioni testuali (soggetti) per ciascuna slide.
* **Generatore di Slide (AI Image):** Gestito da un modello di generazione di immagini (es. Imagen tramite Vertex AI / Nano Banana 2 Lite). Riceve le descrizioni generate da Gemini per creare l'immagine finale della slide.
* **Prevenzione Testi e Numeri sulle Slide:** I prompt inviati a Imagen non devono MAI includere la dicitura "slide number X" né richiedere "presentation slide format" o terminologie simili (le quali spingono il modello a inserire scritte, numeri di slide in alto o grafici/tabelle standard e noiosi). Al contrario, devono richiedere illustrazioni artistiche pulite o stili grafici digitali (es. cyberpunk, pixel art, acquerello) privi di testo. I soggetti delle slide sono generati in inglese da Gemini per massimizzare la precisione visiva con Imagen.
* **Gestione delle API Key:** Per lo sviluppo iniziale, le chiavi API o le configurazioni di Vertex AI verranno lette da un file di configurazione locale (`.env` o file JSON non tracciato).
* **Meccanismo di Caricamento Progressivo Aggressivo (Coda Asincrona):**
  * Per garantire un'esperienza fluida senza blocchi durante la presentazione:
    1. All'avvio del round, l'app richiede contemporaneamente la generazione del tema, della **slide #1** e della **slide #2**.
    2. Non appena il tema e la slide #1 sono pronti, l'animazione termina e il relatore può iniziare.
    3. Mentre il relatore presenta la slide $N$, l'applicazione in background mantiene una coda attiva tentando di generare e scaricare con priorità le slide $N+1$ e $N+2$, mantenendo sempre un vantaggio di sicurezza.
* **Gestione dei Fallimenti (Fallback):**
  * Se la generazione di un'immagine tramite l'API fallisce o va in timeout, l'applicazione gestisce l'errore mostrando a schermo un messaggio chiaro e goliardico per indicare che il servizio è temporaneamente "out of service" (es. *"La scimmia spaziale che disegna le slide è in sciopero. Servizio momentaneamente non disponibile"*), consentendo comunque di ritornare al menu.

---

## 4. Stack Tecnologico & Architettura
* **Frontend:** **React** (creato con Vite).
* **Hosting & Backend:** **Firebase Hosting** per la distribuzione statica.
* **Sincronizzazione Realtime (Host-Player):** **Firebase Firestore** o **Realtime Database** per consentire un setup interattivo multi-device. L'host può configurare i parametri (seed, lingua, stile) da un dispositivo separato (es. smartphone), aggiornando istantaneamente la vista di gioco proiettata sul PC dell'evento.

---

## 5. Configurazione Host (Admin Panel)
L'amministratore o host dell'evento ha accesso a una schermata di configurazione dedicata (es. `/admin` o `/config`) protetta o accessibile via database per impostare i parametri globali della sessione:

* **Seed dell'evento:** Lista di parole o frasi chiave.
* **Lingua dell'applicazione:** Italiano e Inglese (modifica UI e lingua dei temi generati da Gemini).
* **Numero di Slide:** Valore numerico per impostare quante slide comporranno ogni round (default: 5).
* **Stile Visivo delle Slide:** Selezione di uno stile artistico (Cyberpunk, Pixel Art, Acquerello, ecc.) o Default (nessun vincolo applicato).

---

## 6. Flusso Utente e Struttura (Speechless Flow)

La sessione di Speechless si articola nei seguenti passi:

1. **Schermata di Configurazione (Accesso Host):**
   * L'host accede a un pannello di configurazione (es. tramite un URL `/admin` o un'area protetta).
   * Imposta i parametri globali: Seed (parole chiave), Lingua (IT/EN), Numero di Slide per round, ed eventualmente lo Stile Visivo desiderato.
   * Salva la configurazione, la quale viene memorizzata in tempo reale per la sessione.
2. **Schermata Iniziale (Scelta Livello):**
   * Schermata pubblica visualizzata sul proiettore o schermo principale, disposta in un layout perfettamente centrato e senza bordi laterali.
   * Il relatore seleziona la difficoltà desiderata (Beginner 🍌, Intermediate 🐒, Advanced 🌶️, Legend 👑). La selezione è minimalista ed evita lunghe descrizioni didattiche.
3. **Annuncio del Tema (Transizione):**
   * Una volta selezionata la difficoltà, parte un'animazione accattivante che annuncia il tema generato da Gemini.
   * In background, l'applicazione avvia la generazione delle prime due slide tramite Imagen.
4. **Presentazione (Slide Deck):**
   * La prima slide viene mostrata a tutto schermo. Le slide NON presentano numeri scritti o grafici predefiniti di default.
   * Il tema rimane visibile in sovraimpressione come sottotitolo nella parte inferiore dello schermo.
   * Il relatore presenta e avanza manualmente (tramite click, tasto Invio o frecce direzionali).
   * Mentre il relatore presenta la slide corrente, l'app richiede in background le slide successive per mantenere un buffer di sicurezza.
5. **Slide Finale (Conclusione):**
   * Una slide standardizzata invita all'applauso, ai ringraziamenti e alle domande (nella lingua selezionata).
6. **Ritorno al Menu:**
   * Un click o un tasto riporta l'interfaccia alla Schermata Iniziale, pronti per una nuova sessione.

---

## 7. Analisi, Opportunità e Domande Aperte

### 💡 Opportunità
* **Multilingua scalabile:** Utilizzo di file JSON (i18n) per localizzare agilmente l'applicazione.
* **Coerenza visiva:** Se l'host imposta uno stile visivo, le immagini generate manterranno un fil rouge artistico pur essendo del tutto disconnesse a livello di contenuto.
* **Esportazione e Condivisione Social:** Possibilità di memorizzare su Firebase Storage la lista di immagini e il tema del round giocato, per mostrare una galleria dei mazzi più divertenti a fine evento e permettere ai partecipanti di condividere il proprio risultato sui social.

### ⚠️ Pitfall (Rischi Critici)
* **Latenza delle API AI:** Gestita tramite la coda di pre-generazione asincrona aggressiva a due slide di vantaggio.
* **Costi e Abuso delle API Vertex AI:** *Punto di attenzione.* Per ora non implementiamo barriere di sicurezza avanzate (come App Check), ma teniamo monitorato il rischio di abuso se l'URL di hosting venisse esposto pubblicamente.
* **Contenuti inappropriati (Safety Settings):** Configurazione accurata dei `safetySettings` delle API di Vertex AI per prevenire blocchi imprevisti durante la generazione su parole o temi goliardici, con fallback elegante.
* **Sicurezza delle API Key / Credenziali:** Assicurarci che le chiavi GCP utilizzate per Vertex AI in Firebase abbiano restrizioni adeguate a livello di API di Google Cloud.

### ❓ Domande Aperte & Dubbi per il Product Design
* **Salvataggio permanente dei mazzi generati:** Le slide generate verranno salvate in modo permanente (es. in Firestore e Storage) o verranno conservate solo in memoria locale (RAM) e perse al termine del round/della sessione?
  * *Raccomandazione:* Il salvataggio temporaneo in memoria locale è preferibile per la prima fase di sviluppo (costo di storage zero). Successivamente potremo aggiungere la persistenza cloud per la galleria storica.

---

## 8. Requisiti Funzionali

### RF-01: Gestione Configurazione (Host)
* L'utente amministratore (Host) deve poter definire e aggiornare i parametri di sessione: lingua, seed (parole chiave), numero di slide, e stile grafico.
* I parametri impostati dall'host devono essere persistiti durante la sessione in corso e influenzare tutti i round successivi finché non vengono modificati.

### RF-02: Generazione del Tema e dei Soggetti Slide
* Il sistema deve richiedere a Gemini un titolo/tema per la presentazione in base alla lingua e al livello selezionati, unitamente a un array di soggetti descrittivi (slidePrompts) di dimensione pari al numero di slide configurato per il round.
* Se impostato, il Seed inserito dall'host deve essere inserito nel prompt per forzare Gemini ad allineare il tema alle parole chiave specificate.
* I soggetti delle slide (slidePrompts) generati da Gemini devono essere scritti in lingua inglese e rispettare le regole del livello:
  * *Beginner*: Soggetti strettamente pertinenti e collegati al tema.
  * *Intermediate*: Soggetti parzialmente o ironicamente correlati al tema.
  * *Advanced* e *Legend*: Soggetti totalmente scorrelati dal tema e privi di coerenza logica tra loro.

### RF-03: Generazione delle Slide (Immagini)
* Il sistema deve generare immagini univoche in tempo reale utilizzando Vertex AI a partire dai soggetti forniti da Gemini (`slidePrompts`).
* Per prevenire testi disegnati a schermo (numeri o titoli generati dall'AI) e mazzi ripetitivi, il sistema deve formulare prompt finali sprovvisti di parole chiave strutturali (es. "slide number", "presentation layout") e basati sui soggetti descrittivi arricchiti da concetti puramente artistici o dallo stile globale.
* Se l'host ha configurato uno stile grafico (es. *Pixel Art*), quest'ultimo deve essere iniettato in coda a tutti i prompt di generazione immagini del round. Se invece non è configurato alcuno stile, ciascuna slide seleziona casualmente un'opzione da una lista estesa di almeno 16 stili visivi digitali e artistici per massimizzare la varietà grafica.

### RF-04: Navigazione dello Slide Deck
* L'applicazione deve consentire l'avanzamento manuale delle slide a schermo intero tramite tasto Invio, freccia destra, o click del mouse (qualsiasi click sul deck avanza la slide).
* L'app deve consentire la navigazione all'indietro solo tramite tastiera (freccia sinistra). Tutti i pulsanti di navigazione grafici a schermo (Avanti/Indietro) devono essere nascosti per preservare la pulizia visiva delle slide.
* Il tema della presentazione deve rimanere visibile in basso in una barra orizzontale semitrasparente a tutta larghezza (effetto glassmorphism scuro), con testo bianco e ombreggiature ad alto contrasto per garantire la massima leggibilità su qualunque sfondo di immagine.

### RF-05: Gestione della Coda di Caricamento (Preloading)
* Il sistema deve implementare una coda asincrona che avvia la generazione delle slide in background.
* Per ridurre al minimo i tempi di caricamento, la generazione di tutte le slide del round deve iniziare contemporaneamente in parallelo non appena il tema e i soggetti sono generati (durante la schermata di introduzione).
* L'applicazione non deve mostrare blocchi visibili durante il cambio slide a meno che la coda non sia vuota (in tal caso, mostrare uno spinner di caricamento locale).

### RF-06: Internazionalizzazione (i18n)
* Tutti i testi dell'applicazione (menu, pulsanti, slide finale di ringraziamento) devono essere tradotti in Italiano e Inglese in base all'impostazione impostata dall'host.

### RF-07: Gestione degli Errori delle API
* In caso di errore o timeout nella generazione di temi o immagini, Speechless deve bloccarsi mostrando a schermo un avviso di disservizio (out of service) goliardico e permettendo all'utente di tornare al menu principale in modo sicuro.
