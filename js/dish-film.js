// Platos que se arman solos: cada plato con [data-dish-film] tiene una
// secuencia de cuadros (video de Higgsfield) que avanza con el scroll.
// La lista de ingredientes se enciende cuando cada uno aterriza
// (data-land = momento del video entre 0 y 1) y el marco se inclina en 3D.
//
// Con animaciones reducidas no se activa: queda la foto del plato armado.

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const pad = (n) => String(n).padStart(3, '0');

// Tramo del scroll en el que corre el video (el resto es pausa al inicio y al final)
const PLAY_FROM = 0.06;
const PLAY_TO = 0.82;

export function initDishFilms() {
  const dishes = document.querySelectorAll('[data-dish-film]');
  if (!dishes.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  dishes.forEach((dish) => setupDish(dish, finePointer));
}

function setupDish(dish, finePointer) {
  const stage = dish.querySelector('.dish__stage');
  const media = dish.querySelector('.dish__media');
  const canvas = dish.querySelector('.dish__canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const path = dish.dataset.frames;
  const count = Number(dish.dataset.count);
  const doneAt = Number(dish.dataset.done || 0.9);
  const items = [...dish.querySelectorAll('[data-land]')].map((el) => ({ el, at: Number(el.dataset.land) }));
  const frames = new Array(count);

  dish.classList.add('is-on');

  // ---------- Carga perezosa: empieza cuando el plato está cerca ----------
  let started = false;
  const order = [];
  const seen = new Set();
  [count, 8, 4, 2, 1].forEach((step) => {
    for (let i = 0; i < count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  });
  let next = 0;
  const loadNext = () => {
    if (next >= order.length) return;
    const i = order[next++];
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      frames[i] = img;
      if (i === 0) { resize(); canvas.classList.add('is-ready'); }
      needsDraw = true;
      loadNext();
    };
    img.onerror = loadNext;
    img.src = `${path}${pad(i + 1)}.webp`;
  };
  const start = () => {
    if (started) return;
    started = true;
    for (let k = 0; k < 4; k++) loadNext();
  };

  // ---------- Dibujo ----------
  let size = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = media.clientWidth;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    needsDraw = true;
  }
  function nearest(i) {
    for (let d = 0; d < count; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }
  function draw(i) {
    const img = nearest(i);
    if (img && size) ctx.drawImage(img, 0, 0, size, size);
  }

  // ---------- Inclinación 3D ----------
  let tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
  if (finePointer) {
    media.addEventListener('pointermove', (e) => {
      const r = media.getBoundingClientRect();
      aimY = ((e.clientX - r.left) / r.width - 0.5) * 14;   // grados
      aimX = -((e.clientY - r.top) / r.height - 0.5) * 10;
    });
    media.addEventListener('pointerleave', () => { aimX = 0; aimY = 0; });
  }

  // ---------- Bucle ----------
  let current = 0;
  let needsDraw = true;
  let visible = false;

  function loop() {
    const rect = dish.getBoundingClientRect();
    const travel = dish.offsetHeight - stage.offsetHeight;
    const p = travel > 0 ? clamp(-rect.top / travel) : 0;   // progreso del scroll en este plato
    const f = clamp((p - PLAY_FROM) / (PLAY_TO - PLAY_FROM)); // progreso del video

    const target = f * (count - 1);
    const prev = current;
    current += (target - current) * 0.2;
    if (Math.abs(target - current) < 0.01) current = target;
    if (needsDraw || Math.round(prev) !== Math.round(current)) {
      draw(Math.round(current));
      needsDraw = false;
    }

    const shown = current / (count - 1);
    items.forEach(({ el, at }) => el.classList.toggle('is-landed', shown >= at - 0.005));
    dish.classList.toggle('is-done', shown >= doneAt);
    media.style.setProperty('--heat', (0.3 + shown * 0.7).toFixed(2));

    // Sin mouse (celular), el plato gira apenas con el scroll y se endereza al armarse
    if (!finePointer) { aimY = (1 - shown) * -8; aimX = (1 - shown) * 4; }
    tiltX += (aimX - tiltX) * 0.12;
    tiltY += (aimY - tiltY) * 0.12;
    media.style.setProperty('--rx', `${tiltX.toFixed(2)}deg`);
    media.style.setProperty('--ry', `${tiltY.toFixed(2)}deg`);

    if (visible) requestAnimationFrame(loop);
  }

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    const was = visible;
    visible = entry.isIntersecting;
    if (visible && !was) requestAnimationFrame(loop);
  }, { rootMargin: '60% 0px' }).observe(dish);

  window.addEventListener('resize', () => { if (started) resize(); }, { passive: true });
}
