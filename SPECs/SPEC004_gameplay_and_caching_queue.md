# SPEC004: Gameplay and Caching Queue

## 1. Obiettivo
Implementare l'interfaccia utente del mazzo di slide a tutto schermo con controlli da tastiera/mouse e sviluppare il sistema di caricamento progressivo in background tramite coda asincrona (caching).

---

## 2. Dettagli Implementativi

### 2.1 Coda Asincrona di Pre-Generazione (Pipelining)
Per evitare che il relatore debba attendere il caricamento delle slide durante la sua presentazione, implementeremo un custom hook `useImagePreload` che gestisce una coda asincrona a buffer di sicurezza (vantaggio di 2 slide):

```typescript
interface SlideQueueItem {
  index: number;
  url: string | null;
  status: 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';
  prompt: string;
}
```

#### Flusso Logico di Gestione Coda:
1. **Fase Iniziale:** All'avvio del round, lo stato passa a `INTRO` (animazione annuncio tema). Vengono invocate immediatamente le chiamate per generare le immagini per la **slide #1** e **slide #2**.
2. **Sblocco del Gioco:** Non appena la **slide #1** è in stato `READY` e il tema è generato, il gioco sblocca il tasto "Start" (o passa in automatico) mostrando la prima slide.
3. **Pipelining Attivo:** 
   * Quando il relatore visualizza la slide $N$, l'applicazione controlla lo stato della slide $N+1$ e $N+2$.
   * Se la slide $N+2$ non è ancora in coda di generazione, avvia la chiamata API di generazione per la slide $N+2$ in background.
   * L'applicazione effettua il pre-caricamento dell'immagine nel browser (`new Image().src = url`) non appena riceve l'URL dall'API Imagen, in modo che il rendering sia istantaneo al click di avanzamento.

### 2.2 Navigazione e Controlli
* L'applicazione ascolta gli eventi di tastiera globali (`keydown`):
  * `ArrowRight` / `Space` / `Enter`: Avanza alla slide successiva (se $N < \text{totalSlides}$).
  * `ArrowLeft`: Torna alla slide precedente (permette di rivedere le slide già presentate).
* Evento di click del mouse: Un click in qualsiasi area dello schermo (escluso il sottotitolo o pulsanti di servizio) equivale ad avanzare.
* Al superamento dell'ultima slide, l'applicazione mostra la **Slide Finale** di ringraziamento e domande.

### 2.3 UI & Layout delle Slide
* Il layout della slide è a schermo intero (`100vh`, `100vw`).
* L'immagine generata viene impostata come sfondo o contenuta con `object-fit: cover` o `object-fit: contain` per coprire interamente l'area visiva senza distorsioni.
* Il tema è mostrato come testo centrato o posizionato nella parte inferiore (sottotitolo), con uno sfondo scuro semi-trasparente (glassmorphism) per garantire alta leggibilità su qualsiasi tonalità di immagine generata dall'AI.

---

## 3. Criteri di Accettazione (Acceptance Criteria)
* **AC-04.1:** Al click o alla pressione di `Invio`/`Freccia Destra`, l'applicazione deve passare alla slide successiva in modo fluido (< 200ms) se l'immagine è già stata pre-caricata.
* **AC-04.2:** Se una slide non è ancora pronta quando l'utente tenta di avanzare, deve comparire uno spinner di caricamento visibile, il quale scompare mostrando l'immagine non appena la generazione in background si completa.
* **AC-04.3:** La navigazione all'indietro (freccia sinistra) deve mostrare l'immagine precedente senza effettuare nuovamente chiamate API o ricaricare l'immagine da internet (utilizzare la cache in memoria).
* **AC-04.4:** Il tema in sovraimpressione in basso deve rimanere perfettamente leggibile sia su immagini totalmente bianche sia su immagini totalmente nere.
