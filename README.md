# homisuite landing page

Landing page statica e responsive per il prelancio di **homisuite**.

## Avvio locale

Apri direttamente `index.html`, oppure usa un server locale:

```bash
python -m http.server 8000
```

Poi apri `http://localhost:8000`.

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository GitHub.
2. Carica tutti i file di questa cartella nella root del repository.
3. Vai in **Settings → Pages**.
4. In **Build and deployment**, scegli **Deploy from a branch**.
5. Seleziona `main` e `/root`.

## Pubblicazione su Vercel

Importa il repository in Vercel. Non sono necessarie impostazioni di build: è un sito statico.

## Form early access

Il form invia una richiesta `POST` all'endpoint Early Access del backend
**homisuite-app** (repository separato) — una Supabase Edge Function, non
un'API su questo dominio.

### Endpoint

```
POST <HOMISUITE_API_BASE_URL>/early-access-signup
```

dove l'URL reale è:

```
https://flyedzqqdrxxtxchoeer.supabase.co/functions/v1
```

(il project ref è un identificativo pubblico, non un segreto — la stessa
convenzione della anon key). Il backend valida tutto server-side,
salva/aggiorna il lead e invia la notifica a `info@homisuite.com` —
questa landing non parla mai direttamente con Supabase e non conosce
nessuna chiave segreta.

### Configurazione locale

Questo è un sito **statico puro** (nessun `package.json`, nessun Vite,
nessun build step) — non esiste quindi un meccanismo `VITE_*`/env var
iniettato in build. La base URL dell'endpoint è una **costante** in cima a
`script.js`:

```js
const HOMISUITE_API_BASE_URL = 'https://flyedzqqdrxxtxchoeer.supabase.co/functions/v1';
```

Se in futuro il progetto Supabase di homisuite-app cambia (nuovo
ambiente/project ref), è l'unico punto da modificare per cambiare a quale
backend punta il form. Se in futuro questo sito diventa un progetto Vite
(o altro bundler), quella costante è il punto naturale da
sostituire con `import.meta.env.VITE_HOMISUITE_API_BASE_URL`.

### Comportamento del form

- Campi: email di lavoro, hotel, ruolo, numero camere, cosa vorresti
  semplificare (multi-select, almeno una scelta obbligatoria; inviato al
  backend come array) + consenso marketing (facoltativo, default `false`
  — la richiesta funziona anche senza).
- Il form è diviso in due passi (email/hotel, poi il resto); si passa al
  passo 2 solo quando i campi del passo 1 sono validi.
- Un campo nascosto (`website`, honeypot) è presente nel DOM ma invisibile
  e non raggiungibile da tastiera per un utente reale; un bot che lo
  compila riceve una risposta di successo apparente, ma nulla viene
  salvato né notificato.
- In caso di invio riuscito il bottone si disabilita e mostra "Invio in
  corso…", per evitare doppi invii; il risultato (nuova richiesta,
  richiesta aggiornata, o errore) è mostrato inline sotto al form
  (`aria-live="polite"`), mai con `alert()`.
- Nessun dettaglio tecnico del backend viene mai mostrato in caso di
  errore.

### UTM

Alla prima apertura della pagina, se l'URL contiene `utm_source`,
`utm_medium`, `utm_campaign`, `utm_content` e/o `utm_term`, questi vengono
salvati in `sessionStorage` (non un cookie) e restano disponibili per
tutta la sessione del tab, anche se l'utente naviga nella pagina prima di
compilare il form. Vengono allegati automaticamente all'invio, insieme a
`landing_path` (il path corrente). Non sono mai mostrati come campi nel
form.

## Email di conferma Early Access

`email-templates/early-access-confirmation.html` è il template dell'email da
inviare a chi compila il form, in stile coerente con la landing. Il template e
le istruzioni per l'invio (da implementare nel backend `homisuite-app`, non
qui) sono documentate in `email-templates/README.md`.

## Asset

L'icona homisuite si trova in `assets/homisuite-icon-256.png`.
