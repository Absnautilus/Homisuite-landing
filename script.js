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
  const customSelectResets = [];

  const initCustomSelect = (select) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'select-field js-enhanced';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="select-trigger-text is-placeholder"></span><svg class="icon icon-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>';
    const triggerText = trigger.querySelector('.select-trigger-text');

    const listbox = document.createElement('ul');
    listbox.className = 'select-listbox';
    listbox.setAttribute('role', 'listbox');
    listbox.tabIndex = -1;
    listbox.hidden = true;

    const placeholderOption = select.querySelector('option[value=""]');
    const placeholderText = placeholderOption ? placeholderOption.textContent : 'Seleziona…';
    triggerText.textContent = placeholderText;

    Array.from(select.options).filter((opt) => opt.value !== '').forEach((opt, i) => {
      const li = document.createElement('li');
      li.id = `${select.name}-option-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.dataset.value = opt.value;
      li.textContent = opt.textContent;
      listbox.appendChild(li);
    });

    const error = document.createElement('p');
    error.className = 'field-error';
    error.setAttribute('role', 'alert');
    error.hidden = true;

    select.parentElement.insertBefore(wrapper, select);
    wrapper.append(trigger, listbox, select, error);
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    const items = () => Array.from(listbox.querySelectorAll('li'));

    const setActiveOption = (li) => {
      items().forEach((el) => el.classList.remove('is-active'));
      if (!li) return;
      li.classList.add('is-active');
      listbox.setAttribute('aria-activedescendant', li.id);
      li.scrollIntoView({ block: 'nearest' });
    };

    const clearInvalid = () => {
      trigger.classList.remove('is-invalid');
      error.hidden = true;
    };

    const markInvalid = () => {
      trigger.classList.add('is-invalid');
      error.textContent = 'Seleziona un’opzione.';
      error.hidden = false;
      trigger.focus();
    };
    select.reportCustomInvalidity = markInvalid;

    const setExpanded = (expanded) => {
      trigger.setAttribute('aria-expanded', String(expanded));
      listbox.hidden = !expanded;
      if (expanded) {
        const current = items().find((el) => el.getAttribute('aria-selected') === 'true') || items()[0];
        setActiveOption(current);
        listbox.focus();
      }
    };

    const selectOption = (li) => {
      items().forEach((el) => el.setAttribute('aria-selected', 'false'));
      li.setAttribute('aria-selected', 'true');
      select.value = li.dataset.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      triggerText.textContent = li.textContent;
      triggerText.classList.remove('is-placeholder');
      clearInvalid();
      setExpanded(false);
      trigger.focus();
    };

    trigger.addEventListener('click', () => {
      setExpanded(trigger.getAttribute('aria-expanded') !== 'true');
    });

    listbox.addEventListener('keydown', (event) => {
      const list = items();
      const activeIndex = list.findIndex((el) => el.classList.contains('is-active'));
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveOption(list[Math.min(list.length - 1, activeIndex + 1)]);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveOption(list[Math.max(0, activeIndex - 1)]);
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActiveOption(list[0]);
      } else if (event.key === 'End') {
        event.preventDefault();
        setActiveOption(list[list.length - 1]);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (list[activeIndex]) selectOption(list[activeIndex]);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setExpanded(false);
        trigger.focus();
      } else if (event.key === 'Tab') {
        setExpanded(false);
      }
    });

    listbox.addEventListener('click', (event) => {
      const li = event.target.closest('li[role="option"]');
      if (li) selectOption(li);
    });

    document.addEventListener('click', (event) => {
      if (!wrapper.contains(event.target)) setExpanded(false);
    });

    customSelectResets.push(() => {
      items().forEach((el) => el.setAttribute('aria-selected', 'false'));
      triggerText.textContent = placeholderText;
      triggerText.classList.add('is-placeholder');
      clearInvalid();
      setExpanded(false);
    });
  };

  earlyForm.querySelectorAll('#earlyFormStep2 select[required]').forEach(initCustomSelect);

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
    const focusTarget = stepNumber === 1 ? step1.querySelector('input') : step2.querySelector('.select-trigger, select');
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
      if (typeof firstInvalid.reportCustomInvalidity === 'function') {
        firstInvalid.reportCustomInvalidity();
      } else {
        firstInvalid.reportValidity();
      }
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
      customSelectResets.forEach((reset) => reset());
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
