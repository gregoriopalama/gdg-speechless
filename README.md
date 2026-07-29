# Speechless - PowerPoint Karaoke Game

Speechless è una web application interattiva pensata come attività rompighiaccio per meetup ed eventi tech (come il GDG Pescara). Lo speaker deve presentare un tema goliardico generato dall'AI utilizzando slide generate in tempo reale del tutto scollegate dal tema stesso.

---

## 🛠️ Come Inizializzare ed Eseguire l'Applicazione

Visto che l'applicazione sfrutta **Google Vertex AI** (Gemini per i temi e Imagen per le slide) e **Firebase**, è necessario impostare le credenziali corrette per sbloccare l'interattività e far funzionare le chiamate API.

### 1. Configurazione del file `.env`
Crea un file chiamato `.env` nella radice del progetto `/speechless` e inserisci le tue credenziali di Google Cloud / Firebase. 

```env
# Inserisci qui la tua API Key di Google Cloud (deve avere accesso alle API di Vertex AI)
VITE_FIREBASE_API_KEY=LA_TUA_GOOGLE_CLOUD_API_KEY

# Credenziali del progetto Firebase (opzionali per il funzionamento in locale RAM)
VITE_FIREBASE_AUTH_DOMAIN=speechless-demo.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=speechless-demo
VITE_FIREBASE_STORAGE_BUCKET=speechless-demo.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

> [!IMPORTANT]
> Se non inserisci una `VITE_FIREBASE_API_KEY` valida nel file `.env`, le chiamate di generazione del tema (Gemini) e delle immagini delle slide andranno in errore.

---

### 2. Installazione e Avvio locale
Se stai avviando il progetto per la prima volta:

```bash
# 1. Installa tutte le dipendenze
npm install

# 2. Avvia il server di sviluppo locale
npm run dev
```

Una volta avviato, apri nel browser:
* **Schermo di Gioco:** `http://localhost:5173/`
* **Pannello Admin/Host:** `http://localhost:5173/admin`

---

## 🎮 Flusso di Gioco Demo (RAM Mode)
Se non hai configurato l'emulatore Firebase locale, l'applicazione entra automaticamente in **modalità memoria locale (RAM)** dopo 3 secondi:

1. **Dashboard principale:** Scegli un livello (es. *Beginner*).
2. **Generazione:** L'app proverà a contattare Gemini tramite l'API Key. Se l'API key non è valida o configurata, mostrerà la schermata di errore goliardica (scimmia dello spazio) con i dettagli dell'errore tecnico per aiutarti a fare debugging.
3. **Presentazione:** Clicca a schermo o premi `Invio` / `Freccia destra` per far scorrere le slide. Il tema rimane visibile in basso in sovraimpressione.
