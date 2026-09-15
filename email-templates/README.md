# Email di conferma — Early Access

`early-access-confirmation.html` è l'email transazionale da inviare a chi compila
il form Early Access della landing, per confermare che la richiesta è stata
ricevuta. È in stile coerente con la landing (palette viola/lilla/navy, stessa
identità visiva), scritta come HTML per email: layout a tabelle, stili inline,
fallback per Outlook — non CSS moderno, che nei client email non è affidabile.

## Importante: dove va collegata

Questo repository (**Homisuite-landing**) è solo la landing pubblica statica.
**Non invia email** e non deve contenere alcuna chiave API (Resend, SMTP, ecc.).

L'invio va implementato nel backend **`homisuite-app`**, che è già responsabile di:
1. salvare il lead ricevuto da `POST /api/early-access`;
2. inviare la notifica interna a `info@homisuite.com`;
3. (nuovo) inviare *questa* email di conferma al richiedente.

Questo file HTML è quindi un **asset/template** da copiare o referenziare nel
codice del backend, non qualcosa che gira o si configura in questo repo.

## Variabili del template

Il file usa placeholder in stile `{{variabile}}` da sostituire prima dell'invio:

| Placeholder    | Descrizione                                                              |
|----------------|---------------------------------------------------------------------------|
| `{{hotel_name}}` | Nome della struttura, dal campo `hotel_name` del form                   |

Il logo **non è più un placeholder**: punta già a
`https://cdn.jsdelivr.net/gh/Absnautilus/Homisuite-landing@main/assets/homisuite-icon-256.png`,
servito via jsDelivr direttamente dal repo pubblico — funziona da subito,
senza bisogno di un dominio o di un deploy proprio. Quando homisuite avrà un
hosting per gli asset sul proprio dominio (es. `homisuite.com/...`), è
consigliabile spostarci il riferimento per non dipendere da GitHub/jsDelivr,
ma non è bloccante.

Il subject consigliato per l'invio: **"Richiesta ricevuta — homisuite early access"**.
Il mittente è **`info@homisuite.com`** (lo stesso indirizzo che riceve la notifica interna).

## Esempio di invio con Resend (solo riferimento, da usare nel backend)

```js
// Questo snippet va nel backend homisuite-app (es. l'edge function o il
// server che gestisce POST /api/early-access), MAI in questo repository.
import { Resend } from 'resend';
import fs from 'node:fs';

const resend = new Resend(process.env.RESEND_API_KEY);

function renderTemplate(hotelName) {
  const template = fs.readFileSync('early-access-confirmation.html', 'utf8');
  return template.replaceAll('{{hotel_name}}', hotelName);
}

await resend.emails.send({
  from: 'homisuite <info@homisuite.com>', // richiede il dominio homisuite.com verificato su Resend
  to: leadEmail,
  subject: 'Richiesta ricevuta — homisuite early access',
  html: renderTemplate(hotelName),
});
```

Per usare `info@homisuite.com` come mittente, il dominio `homisuite.com` deve
essere verificato su Resend (record DNS SPF/DKIM) — è lo stesso passaggio
già citato sopra, non serve nulla in più oltre a quello.

Se preferite React Email invece di HTML statico, questo file resta comunque
utile come riferimento visivo/di markup da cui partire per ricreare il
componente.

## Test del rendering

Prima di collegarlo davvero, controllate il rendering su più client:
Gmail (web e app), Outlook desktop, Apple Mail, e uno strumento come Litmus o
Email on Acid se disponibile — Outlook desktop in particolare usa un motore
di rendering diverso (Word) e ignora `border-radius` e i gradienti CSS senza
il fallback VML già incluso nel file.
