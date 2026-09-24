import { CONFIG } from './config.js';
import { translations } from './translations.js';

let currentLang = CONFIG.defaultLang;

export const getLang = () => currentLang;

// Devuelve el texto de una clave en el idioma actual (con inglés como respaldo).
// Si el texto tiene <em> o <strong>, se inserta como HTML (solo en textos de confianza,
// escritos por nosotros en translations.js, nunca con datos del usuario).
export function t(key) {
  return translations[currentLang]?.[key] ?? translations[CONFIG.defaultLang][key] ?? key;
}

function readStoredLang() {
  try {
    const stored = localStorage.getItem(CONFIG.storageKey);
    return translations[stored] ? stored : null;
  } catch {
    return null;
  }
}

function storeLang(lang) {
  try {
    localStorage.setItem(CONFIG.storageKey, lang);
  } catch {
    /* no pasa nada si no se puede guardar */
  }
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });
  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.langOption === currentLang));
  });
}

export function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  storeLang(lang);
  applyTranslations();
  document.dispatchEvent(new CustomEvent('fogon:languagechange', { detail: { lang } }));
}

export function initI18n() {
  currentLang = readStoredLang() ?? CONFIG.defaultLang;
  applyTranslations();
  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.addEventListener('click', () => setLang(button.dataset.langOption));
  });
}
