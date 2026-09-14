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

Il form è volutamente front-end only. In `script.js` trovi il punto in cui collegare:

- Supabase / Edge Function
- Formspree
- un endpoint proprietario
- qualsiasi CRM o provider email

## Asset

L'icona homisuite si trova in `assets/homisuite-icon-256.png`.
