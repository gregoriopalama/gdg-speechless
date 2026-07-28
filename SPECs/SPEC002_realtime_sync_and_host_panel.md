# SPEC002: Realtime Sync and Host Panel

## 1. Obiettivo
Implementare il meccanismo di sincronizzazione in tempo reale dello stato dell'evento tra la dashboard dell'Host (Admin Panel) e lo schermo principale (Player Dashboard) proiettato in sala.

---

## 2. Dettagli Implementativi

### 2.1 Modellazione dei Dati (Firestore Schema)
Utilizzeremo Firestore per memorizzare lo stato globale della sessione. Avremo un unico documento a percorso fisso `sessions/active_session` che fungerà da sorgente unica della verità:

```json
{
  "active_session": {
    "seed": "GDG Pescara, intelligenza artificiale, dinosauri",
    "language": "it", // "it" | "en"
    "slidesCount": 5,
    "visualStyle": "Pixel Art", // "Pixel Art" | "Cyberpunk" | "Watercolor" | null
    "currentRound": {
      "id": "round_unique_id",
      "difficulty": "Legend", // "Beginner" | "Intermediate" | "Advanced" | "Legend"
      "status": "SETUP", // "SETUP" | "INTRO" | "PLAYING" | "FINISHED" | "ERROR"
      "theme": "Come spiegare il Rust ai dinosauri usando solo emoji",
      "currentSlideIndex": 0,
      "totalSlides": 5,
      "slideQueue": [
        "https://firebasestorage.googleapis.com/.../slide1.jpg",
        "https://firebasestorage.googleapis.com/.../slide2.jpg"
      ]
    }
  }
}
```

### 2.2 Sincronizzazione in tempo reale (Firestore Listener)
* **Nel Player Dashboard (Schermo Pubblico):** Un listener `onSnapshot` su `sessions/active_session` ascolta i cambiamenti dello stato. Qualsiasi modifica effettuata dall'host (es. cambio lingua o cambio slide attiva) aggiorna istantaneamente l'interfaccia proiettata in sala senza refresh.
* **Nell'Admin Panel (Host):** L'host aggiorna il documento tramite scritture atomiche (es. modificando il campo `seed` o cambiando il `currentRound.status`).

### 2.3 Gestione delle Rotte
* `/admin`: Pagina di amministrazione con controlli per modificare la lingua, il seed, il numero di slide e lo stile visivo. Contiene inoltre controlli rapidi per resettare il gioco o forzare l'uscita da un round bloccato.
* `/`: Pagina del giocatore/proiettore. Mostra la schermata di selezione livello o la presentazione in corso in base a `currentRound.status`.

---

## 3. Criteri di Accettazione (Acceptance Criteria)
* **AC-02.1:** Le modifiche apportate ai parametri (lingua, seed, slide, stile) nella pagina `/admin` devono essere salvate in Firestore entro 1.5 secondi dall'input (o alla pressione di un tasto "Salva").
* **AC-02.2:** La pagina `/` deve reagire istantaneamente ai cambi di stato scritti dall'admin (es. resettarsi se l'admin forza un reset).
* **AC-02.3:** L'interfaccia di `/admin` deve essere protetta o quantomeno isolata per evitare modifiche accidentali da parte dei giocatori.
