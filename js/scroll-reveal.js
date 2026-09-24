// Revela cada tarjeta de plato destacado (pines e ingredientes) cuando entra
// en pantalla al scrollear. Si el navegador no soporta IntersectionObserver,
// se muestran directamente sin animar.
export function initScrollReveal() {
  const dishes = document.querySelectorAll('.dish');
  if (!dishes.length) return;

  if (!('IntersectionObserver' in window)) {
    dishes.forEach((dish) => dish.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  dishes.forEach((dish) => observer.observe(dish));
}
