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

earlyForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(earlyForm);
  const email = data.get('email');
  const hotel = data.get('hotel');

  // TODO: collega qui il tuo endpoint (Formspree, Supabase Edge Function, API, ecc.).
  console.log('Early access request', { email, hotel });

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'Richiesta registrata nel prototipo. Collega il form al tuo backend prima del lancio.';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);

  earlyForm.reset();
});
