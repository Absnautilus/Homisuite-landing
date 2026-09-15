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

const earlyForm = document.querySelector('#earlyForm');

if (earlyForm) {
  const step1 = earlyForm.querySelector('#earlyFormStep1');
  const step2 = earlyForm.querySelector('#earlyFormStep2');
  const nextBtn = earlyForm.querySelector('#earlyFormNext');
  const backBtn = earlyForm.querySelector('#earlyFormBack');
  const submitBtn = earlyForm.querySelector('#earlyFormSubmit');
  const submitLabel = submitBtn.querySelector('.btn-label');
  const submitSpinner = submitBtn.querySelector('.icon-loader-2');
  const messageEl = earlyForm.querySelector('#earlyFormMessage');
  const progressDots = earlyForm.querySelectorAll('[data-step-dot]');
  const progressFill = earlyForm.querySelector('#earlyFormProgressFill');
  const progressLabel = earlyForm.querySelector('#earlyFormProgressLabel');

  const successIcon = '<svg class="icon icon-check-circle-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m16 9-5.5 5.5L8 12" /></svg>';
  const errorIcon = '<svg class="icon icon-alert-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>';

  let isSubmitting = false;

  const setMessage = (text, state) => {
    messageEl.innerHTML = text ? `${state === 'success' ? successIcon : state === 'error' ? errorIcon : ''}<span>${text}</span>` : '';
    messageEl.classList.toggle('is-success', state === 'success');
    messageEl.classList.toggle('is-error', state === 'error');
  };

  const goToStep = (stepNumber) => {
    step1.classList.toggle('is-active', stepNumber === 1);
    step2.classList.toggle('is-active', stepNumber === 2);
    progressDots.forEach((dot) => {
      dot.classList.toggle('is-active', Number(dot.dataset.stepDot) <= stepNumber);
    });
    progressFill.style.width = stepNumber === 2 ? '100%' : '0%';
    progressLabel.textContent = `Passo ${stepNumber} di 2`;
    setMessage('');
    const focusTarget = stepNumber === 1 ? step1.querySelector('input') : step2.querySelector('select');
    focusTarget?.focus();
  };

  nextBtn.addEventListener('click', () => {
    const invalidField = Array.from(step1.querySelectorAll('input')).find((input) => !input.checkValidity());
    if (invalidField) {
      invalidField.reportValidity();
      return;
    }
    goToStep(2);
  });

  backBtn.addEventListener('click', () => goToStep(1));

  // Placeholder locale in attesa che il backend Early Access (repo homisuite-app) sia collegato: da sostituire con una vera chiamata fetch all'endpoint.
  const submitEarlyAccess = () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 600));

  earlyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!step2.classList.contains('is-active')) {
      nextBtn.click();
      return;
    }

    const step2Fields = Array.from(step2.querySelectorAll('select[required]'));
    const firstInvalid = step2Fields.find((field) => !field.checkValidity());
    if (firstInvalid) {
      firstInvalid.reportValidity();
      return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    backBtn.disabled = true;
    submitLabel.textContent = 'Invio in corso…';
    submitSpinner.hidden = false;
    setMessage('');

    try {
      const data = new FormData(earlyForm);
      console.log('Early access request', Object.fromEntries(data.entries()));

      await submitEarlyAccess();

      earlyForm.reset();
      goToStep(1);
      setMessage('Richiesta ricevuta. Ti contatteremo presto.', 'success');
    } catch (error) {
      setMessage('Non siamo riusciti a inviare la richiesta. Riprova tra poco.', 'error');
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      backBtn.disabled = false;
      submitLabel.textContent = 'Richiedi early access';
      submitSpinner.hidden = true;
    }
  });
}
