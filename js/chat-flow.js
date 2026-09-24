// ==========================================================================
// Conversación del bot de reservas: SOLO la estructura (pasos y opciones).
// Los textos viven en translations.js (claves labelKey / messageKey).
// ==========================================================================
export const FIRST_STEP = 'reason';

export const flow = {
  reason: {
    messageKey: 'chat.reason.message',
    field: 'reason',
    next: 'people',
    options: [
      { value: 'table', labelKey: 'reason.table' },
      { value: 'event', labelKey: 'reason.event' },
      { value: 'catering', labelKey: 'reason.catering' },
      { value: 'other', labelKey: 'reason.other' },
    ],
  },
  people: {
    messageKey: 'chat.people.message',
    field: 'people',
    next: 'when',
    options: [
      { value: '2', labelKey: 'people.2' },
      { value: '4', labelKey: 'people.4' },
      { value: '6', labelKey: 'people.6' },
      { value: 'more', labelKey: 'people.more' },
    ],
  },
  when: {
    messageKey: 'chat.when.message',
    field: 'when',
    next: null,
    options: [
      { value: 'tonight', labelKey: 'when.tonight' },
      { value: 'weekend', labelKey: 'when.weekend' },
      { value: 'nextweek', labelKey: 'when.nextweek' },
      { value: 'flexible', labelKey: 'when.flexible' },
    ],
  },
};

// Convierte las respuestas en el mensaje que se envía por WhatsApp
export function buildSummary(answers, t) {
  return t('whatsapp.summary')
    .replace('{reason}', () => t(`reason.${answers.reason}`))
    .replace('{people}', () => t(`people.${answers.people}`))
    .replace('{when}', () => t(`when.${answers.when}`));
}
