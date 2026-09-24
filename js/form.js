import { t } from './i18n.js';
import { whatsappUrl } from './whatsapp.js';

// Formulario de reservas: valida y abre WhatsApp con el mensaje armado.
export function initForm() {
  const form = document.querySelector('#reserve-form');
  if (!form) return;

  const nameField = form.querySelector('#field-name');
  const peopleField = form.querySelector('#field-people');
  const dateField = form.querySelector('#field-date');
  const timeField = form.querySelector('#field-time');
  const phoneField = form.querySelector('#field-phone');
  const notesField = form.querySelector('#field-notes');
  const required = [nameField, peopleField, dateField, timeField];

  function showError(field, key) {
    const errorEl = form.querySelector(`#${field.id}-error`);
    field.dataset.errorKey = key ?? '';
    field.setAttribute('aria-invalid', key ? 'true' : 'false');
    if (errorEl) errorEl.textContent = key ? t(key) : '';
  }

  function validate() {
    showError(nameField, nameField.value.trim() ? null : 'form.errorName');
    showError(peopleField, peopleField.value ? null : 'form.errorPeople');
    showError(dateField, dateField.value ? null : 'form.errorDate');
    showError(timeField, timeField.value ? null : 'form.errorTime');
    return required.every((field) => !field.dataset.errorKey);
  }

  function formatDate(value) {
    if (!value) return value;
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }

  function buildMessage() {
    const notes = notesField.value.trim();
    const notesText = notes ? t('whatsapp.formNotes').replace('{notes}', () => notes) : '';
    return t('whatsapp.form')
      .replace('{people}', () => peopleField.options[peopleField.selectedIndex].text)
      .replace('{date}', () => formatDate(dateField.value))
      .replace('{time}', () => timeField.value)
      .replace('{name}', () => nameField.value.trim())
      .replace('{notes}', () => notesText);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) {
      required.find((field) => field.dataset.errorKey)?.focus();
      return;
    }
    const url = whatsappUrl(buildMessage());
    if (!window.open(url, '_blank', 'noopener')) window.location.href = url;
  });

  required.forEach((field) => {
    field.addEventListener('input', () => showError(field, null));
    field.addEventListener('change', () => showError(field, null));
  });

  document.addEventListener('fogon:languagechange', () => {
    required.forEach((field) => {
      if (field.dataset.errorKey) showError(field, field.dataset.errorKey);
    });
  });
}
