const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

// ---------------------------------------------------------------------------
// Early access form -> homisuite-app's early-access-signup Edge Function
// (a separate repository/deployment; see README's "Form early access").
//
// This is a build-free static site (no Vite/webpack, no package.json) --
// there is no bundler to inject a VITE_-style env var at build time, so the
// endpoint base is a plain constant instead. Replace it per environment
// before deploying; see README for where to find the real value.
// ---------------------------------------------------------------------------

const HOMISUITE_API_BASE_URL = 'https://flyedzqqdrxxtxchoeer.supabase.co/functions/v1';
const EARLY_ACCESS_ENDPOINT = `${HOMISUITE_API_BASE_URL}/early-access-signup`;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const UTM_STORAGE_KEY = 'homisuite_utm';

// Runs once per script load (effectively once per page view). Only writes
// when the current URL actually carries at least one UTM param, so a later
// page view within the same tab -- e.g. clicking an internal anchor link --
// never wipes out attribution a previous, UTM-carrying URL already
// recorded. sessionStorage, not a cookie: no cross-session tracking, and
// nothing to disclose in a cookie banner for this alone.
function captureUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const found = {};
  let hasAny = false;
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      found[key] = value;
      hasAny = true;
    }
  });
  if (!hasAny) return;
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
  } catch {
    // Private browsing / storage disabled: the request still works, it
    // just won't carry UTM attribution.
  }
}

function readStoredUtmParams() {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

captureUtmParams();

const earlyForm = document.querySelector('#earlyForm');
const earlyFormButton = earlyForm?.querySelector('button[type="submit"]');
const earlyFormStatus = earlyForm?.querySelector('.early-form-status');
const EARLY_FORM_DEFAULT_LABEL = earlyFormButton?.textContent ?? 'Richiedi early access →';

function setEarlyFormStatus(message, tone) {
  if (!earlyFormStatus) return;
  earlyFormStatus.textContent = message;
  earlyFormStatus.classList.remove('is-error', 'is-success');
  if (tone) earlyFormStatus.classList.add(tone === 'error' ? 'is-error' : 'is-success');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

let earlyFormSubmitting = false;

earlyForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (earlyFormSubmitting) return;

  const data = new FormData(earlyForm);
  const payload = {
    email: String(data.get('email') || '').trim().toLowerCase(),
    hotel_name: String(data.get('hotel_name') || '').trim(),
    role: String(data.get('role') || ''),
    rooms_range: String(data.get('rooms_range') || ''),
    main_problem: String(data.get('main_problem') || ''),
    marketing_consent: data.get('marketing_consent') === 'on',
    ...readStoredUtmParams(),
    landing_path: window.location.pathname,
    // Honeypot -- a real visitor never sees or reaches this field. Sent
    // as-is; the backend decides what a non-empty value means.
    website: String(data.get('website') || ''),
  };

  if (
    !isValidEmail(payload.email) ||
    !payload.hotel_name ||
    !payload.role ||
    !payload.rooms_range ||
    !payload.main_problem
  ) {
    setEarlyFormStatus('Controlla i campi evidenziati e riprova.', 'error');
    return;
  }

  earlyFormSubmitting = true;
  if (earlyFormButton) {
    earlyFormButton.disabled = true;
    earlyFormButton.textContent = 'Invio in corso…';
  }
  setEarlyFormStatus('', null);

  try {
    const response = await fetch(EARLY_ACCESS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => null);

    if (response.ok && body && body.ok) {
      setEarlyFormStatus(
        body.status === 'updated'
          ? 'Richiesta ricevuta. Abbiamo aggiornato i tuoi dati.'
          : 'Richiesta ricevuta. Ti contatteremo presto.',
        'success',
      );
      earlyForm.reset();
    } else {
      // Never surface response body details (error codes, etc.) to the visitor.
      setEarlyFormStatus('Non siamo riusciti a inviare la richiesta. Riprova tra poco.', 'error');
    }
  } catch {
    setEarlyFormStatus('Non siamo riusciti a inviare la richiesta. Riprova tra poco.', 'error');
  } finally {
    earlyFormSubmitting = false;
    if (earlyFormButton) {
      earlyFormButton.disabled = false;
      earlyFormButton.textContent = EARLY_FORM_DEFAULT_LABEL;
    }
  }
});
