// Hero cinematográfico: el video (una secuencia de cuadros WebP) avanza
// con el scroll y se dibuja en un <canvas>. Los textos aparecen en tres
// momentos: brasas, parrilla y mesa.
//
// Si la persona pidió reducir las animaciones, no se activa nada y queda
// el hero estático con la foto de las brasas.

const SETS = {
  desktop: { path: 'assets/film/d/', count: 202 },
  mobile: { path: 'assets/film/m/', count: 121 }
};

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const pad = (n) => String(n).padStart(3, '0');

export function initHeroFilm() {
  const hero = document.querySelector('[data-film]');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stage = hero.querySelector('.film__stage');
  const canvas = hero.querySelector('.film__canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const beats = [...hero.querySelectorAll('[data-beat]')].map((el) => {
    const [from, to] = el.dataset.beat.split(' ').map(Number);
    return { el, from, to };
  });

  // Celular (pantalla angosta o vertical) usa cuadros recortados y más livianos
  const isMobile = window.matchMedia('(max-width: 700px), (orientation: portrait) and (max-width: 900px)').matches;
  const set = isMobile ? SETS.mobile : SETS.desktop;
  const frames = new Array(set.count);

  hero.classList.add('is-on');

  // ---------- 1. Carga de cuadros ----------
  // Primero el cuadro 0, después uno de cada 16, luego cada 8, 4, 2 y 1.
  // Así el scroll funciona (más "a saltos") antes de que termine de cargar todo.
  const order = [];
  const seen = new Set();
  [set.count, 16, 8, 4, 2, 1].forEach((step) => {
    for (let i = 0; i < set.count; i += step) {
      if (!seen.has(i)) { seen.add(i); order.push(i); }
    }
  });

  let next = 0;
  const loadNext = () => {
    if (next >= order.length) return;
    const i = order[next++];
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      frames[i] = img;
      if (i === 0) firstFrameReady();
      else if (Math.abs(i - Math.round(current)) < 12) needsDraw = true;
      loadNext();
    };
    img.onerror = loadNext;
    img.src = `${set.path}${pad(i + 1)}.webp`;
  };
  for (let k = 0; k < 6; k++) loadNext(); // 6 descargas en paralelo

  function firstFrameReady() {
    resize();
    canvas.classList.add('is-ready');
  }

  // ---------- 2. Dibujo (tipo "object-fit: cover") ----------
  let cssW = 0, cssH = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = stage.clientWidth;
    cssH = stage.clientHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    needsDraw = true;
  }

  // Si el cuadro exacto todavía no cargó, usa el más cercano que sí esté
  function nearestLoaded(i) {
    for (let d = 0; d < set.count; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  function draw(index) {
    const img = nearestLoaded(index);
    if (!img || !cssW) return;
    const scale = Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (cssW - w) / 2, (cssH - h) / 2, w, h);
  }

  // ---------- 3. Scroll ----------
  let progress = 0;   // 0 a 1 a lo largo del hero
  let current = 0;    // cuadro mostrado (suavizado)
  let needsDraw = true;

  function readProgress() {
    const rect = hero.getBoundingClientRect();
    const travel = hero.offsetHeight - stage.offsetHeight;
    progress = travel > 0 ? clamp(-rect.top / travel) : 0;
  }

  // Cada texto entra, se queda y sale según su tramo [from, to]
  function updateBeats() {
    const fade = 0.07;
    beats.forEach(({ el, from, to }) => {
      let o;
      if (from === 0) o = progress <= to ? 1 : clamp(1 - (progress - to) / fade);   // el primero ya está visible
      else if (to === 1) o = clamp((progress - from) / fade);                          // el último se queda
      else o = Math.min(clamp((progress - from) / fade), clamp(1 - (progress - to) / fade));
      const y = (1 - o) * (progress < from ? 24 : -24);
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    });
    hero.classList.toggle('is-scrolled', progress > 0.02);
  }

  let visible = true;
  function loop() {
    readProgress();
    const target = progress * (set.count - 1);
    const prev = current;
    current += (target - current) * 0.18;               // suavizado
    if (Math.abs(target - current) < 0.01) current = target;
    if (needsDraw || Math.round(prev) !== Math.round(current)) {
      draw(Math.round(current));
      needsDraw = false;
    }
    updateBeats();
    if (visible) requestAnimationFrame(loop);
  }

  // Solo anima mientras el hero está en pantalla
  new IntersectionObserver(([entry]) => {
    const was = visible;
    visible = entry.isIntersecting;
    if (visible && !was) requestAnimationFrame(loop);
  }).observe(hero);

  window.addEventListener('resize', resize, { passive: true });
  updateBeats();
  requestAnimationFrame(loop);
}
