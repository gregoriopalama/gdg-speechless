# SPEC001: Project Setup and Architecture

## 1. Obiettivo
Configurare l'ambiente di sviluppo per la web application **Speechless** utilizzando React con Vite e integrare i servizi Firebase (Hosting e Firestore/Realtime Database), impostando le basi per l'internazionalizzazione.

---

## 2. Dettagli Implementativi

### 2.1 Stack Tecnologico
* **Frontend:** React 18+ (con TypeScript per la tipizzazione statica e la sicurezza dei dati).
* **Build Tool:** Vite (per un bundling ultra rapido e moduli ES nativi).
* **CSS/Styling:** CSS Vanilla (Custom Properties per il tema e Flexbox/Grid per i layout responsive) o TailwindCSS (previa conferma utente).
* **Routing:** `react-router-dom` per la gestione delle pagine (`/` per Speechless, `/admin` per l'host).
* **Internazionalizzazione (i18n):** `react-i18next` con file JSON locali per le traduzioni in Italiano (IT) e Inglese (EN).
* **Backend & Hosting:** Firebase Suite (Firebase Hosting + Firebase Firestore per lo stato realtime).

### 2.2 Struttura delle Directory Proposta
```text
speechless/
├── .firebaserc
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── firebase/
│   │   ├── config.ts         # Inizializzazione Firebase
│   │   └── services.ts       # Servizi di lettura/scrittura Firestore
│   ├── i18n/
│   │   ├── index.ts          # Configurazione i18next
│   │   └── locales/
│   │       ├── en.json       # Traduzioni Inglese
│   │       └── it.json       # Traduzioni Italiano
│   ├── components/           # Componenti condivisi (es. Button, Loader)
│   │   └── common/
│   ├── pages/                # Pagine principali dell'applicazione
│   │   ├── Dashboard.tsx
│   │   ├── AdminPanel.tsx
│   │   └── SpeechlessView.tsx
│   ├── hooks/                # Custom React Hooks
│   │   ├── useSpeechlessState.ts   # Gestione dello stato di Speechless realtime
│   │   └── useImagePreload.ts# Coda di caricamento progressivo immagini
│   └── context/
│       └── SpeechlessContext.tsx   # Contesto globale dell'applicazione
```

### 2.3 Gestione delle Variabili d'Ambiente
I parametri di configurazione di Firebase e Vertex AI verranno mantenuti in un file `.env` locale che non deve essere committato:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 3. Criteri di Accettazione (Acceptance Criteria)
* **AC-01.1:** L'applicazione deve compilare correttamente senza errori tramite `npm run build`.
* **AC-01.2:** L'applicazione deve essere ospitata su Firebase Hosting locale (`firebase serve`) ed essere raggiungibile a `localhost`.
* **AC-01.3:** Al cambio di lingua configurato nel contesto di internazionalizzazione, l'interfaccia principale deve cambiare istantaneamente tutti i testi visibili tra Italiano e Inglese senza richiedere il ricaricamento della pagina.
* **AC-01.4:** I file di configurazione sensibili (`.env`, credenziali) devono essere inseriti nel file `.gitignore`.
