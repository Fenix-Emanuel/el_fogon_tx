// Menú escrito: las categorías y los platos aparecen en cascada al entrar
// en pantalla (la línea de puntos se dibuja hasta el precio) y las palabras
// gigantes del fondo se deslizan con el scroll.
// Con animaciones reducidas no se activa nada: el menú se ve completo y quieto.

export function initMenuMotion() {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const categories = [...menu.querySelectorAll('.menu-category')];
  const items = [...menu.querySelectorAll('.menu-item')];

  // Índice para la cascada, contado dentro de cada categoría
  categories.forEach((cat) => {
    cat.querySelectorAll('.menu-item').forEach((item, i) => item.style.setProperty('--i', i));
  });

  menu.classList.add('is-animated');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  [...categories, ...items].forEach((el) => io.observe(el));

  // Marquesina ligada al scroll
  const marquee = menu.querySelector('.menu__marquee');
  if (!marquee) return;
  let visible = false;
  const update = () => {
    const r = menu.getBoundingClientRect();
    const p = (innerHeight - r.top) / (innerHeight + r.height); // 0 → 1 mientras cruza la pantalla
    marquee.style.setProperty('--mx', `${(-p * marquee.scrollWidth * 0.35).toFixed(1)}px`);
    if (visible) requestAnimationFrame(update);
  };
  new IntersectionObserver(([e]) => {
    const was = visible;
    visible = e.isIntersecting;
    if (visible && !was) requestAnimationFrame(update);
  }).observe(menu);
}
