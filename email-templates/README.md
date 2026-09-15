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
| `{{logo_url}}`   | URL assoluto e pubblico dell'icona homisuite (es. `https://.../assets/homisuite-icon-256.png`). Deve essere un URL raggiungibile da internet: i client email non possono caricare immagini locali o relative. |

Il subject consigliato per l'invio: **"Richiesta ricevuta — homisuite early access"**.

## Esempio di invio con Resend (solo riferimento, da usare nel backend)

```js
// Questo snippet va nel backend homisuite-app (es. l'edge function o il
// server che gestisce POST /api/early-access), MAI in questo repository.
import { Resend } from 'resend';
import fs from 'node:fs';

const resend = new Resend(process.env.RESEND_API_KEY);

function renderTemplate(hotelName) {
  const template = fs.readFileSync('early-access-confirmation.html', 'utf8');
  return template
    .replaceAll('{{hotel_name}}', hotelName)
    .replaceAll('{{logo_url}}', 'https://landing.homisuite.com/assets/homisuite-icon-256.png');
}

await resend.emails.send({
  from: 'homisuite <early-access@homisuite.com>', // dominio verificato su Resend
  to: leadEmail,
  subject: 'Richiesta ricevuta — homisuite early access',
  html: renderTemplate(hotelName),
});
```

Se preferite React Email invece di HTML statico, questo file resta comunque
utile come riferimento visivo/di markup da cui partire per ricreare il
componente.

## Test del rendering

Prima di collegarlo davvero, controllate il rendering su più client:
Gmail (web e app), Outlook desktop, Apple Mail, e uno strumento come Litmus o
Email on Acid se disponibile — Outlook desktop in particolare usa un motore
di rendering diverso (Word) e ignora `border-radius` e i gradienti CSS senza
il fallback VML già incluso nel file.
