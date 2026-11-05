// Punto de entrada: inicia cada módulo en orden.
import { CONFIG } from './config.js';
import { initI18n, t } from './i18n.js';
import { initNavbar } from './navbar.js';
import { initForm } from './form.js';
import { initChat } from './chat.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initHeroFilm } from './hero-film.js';
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

initI18n();
initWhatsappLinks();
initMinDate();
initNavbar();
initForm();
initChat();
initScrollReveal();
initHeroFilm();
