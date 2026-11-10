// Punto de entrada: inicia cada módulo en orden.
import { CONFIG } from './config.js';
import { initI18n, t } from './i18n.js';
import { initNavbar } from './navbar.js';
import { initForm } from './form.js';
import { initChat } from './chat.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initHeroFilm } from './hero-film.js';
import { initDishFilms } from './dish-film.js';
import { initMenuMotion } from './menu-motion.js';
import { whatsappUrl } from './whatsapp.js';

function initWhatsappLinks() {
  const update = () => {
    document.querySelectorAll('[data-whatsapp]').forEach((link) => {
      link.href = whatsappUrl(t('whatsapp.greeting'));
      link.target = '_blank';
      link.rel = 'noopener';
    });
    document.querySelectorAll('[data-phone]').forEach((el) => {
      el.textContent = CONFIG.phoneDisplay;
    });
  };
  update();
  document.addEventListener('fogon:languagechange', update);
}

// Fecha mínima seleccionable en el formulario: hoy
function initMinDate() {
  const field = document.querySelector('#field-date');
  if (!field) return;
  field.min = new Date().toISOString().split('T')[0];
}

// El botón flotante "Reserve a table" se esconde mientras se ven los botones del hero (evita dos iguales a la vez)
function initFloatingCta() {
  const toggle = document.querySelector('[data-chat-toggle]');
  const heroCtas = document.querySelectorAll('.hero [data-chat-open]');
  if (!toggle || !heroCtas.length || !('IntersectionObserver' in window)) return;
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    const hide = visible.size > 0 && toggle.getAttribute('aria-expanded') !== 'true';
    toggle.classList.toggle('is-tucked', hide);
    toggle.toggleAttribute('inert', hide);
  });
  heroCtas.forEach((b) => io.observe(b));
}

initI18n();
initWhatsappLinks();
initMinDate();
initNavbar();
initForm();
initChat();
initScrollReveal();
initHeroFilm();
initDishFilms();
initMenuMotion();
initFloatingCta();
