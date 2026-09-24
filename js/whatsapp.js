import { CONFIG } from './config.js';

export function whatsappUrl(message) {
  const base = `https://wa.me/${CONFIG.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
