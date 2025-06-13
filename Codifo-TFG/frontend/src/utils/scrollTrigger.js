/**
 * ScrollTrigger utility para animaciones al hacer scroll
 * Este archivo proporciona funciones para activar animaciones cuando los elementos entran en el viewport
 */

/**
 * Inicializa el observador de intersección para animar elementos cuando aparecen en pantalla
 * @param {string} selector - Selector CSS para los elementos a observar
 * @param {string} animationClass - Clase CSS que se añadirá al elemento cuando sea visible
 * @param {Object} options - Opciones para el IntersectionObserver
 */
export function initScrollAnimation(selector = '.animate-on-scroll', animationClass = 'visible', options = {}) {
  const defaultOptions = {
    threshold: 0.1, // 10% del elemento debe ser visible
    rootMargin: '0px 0px -10% 0px' // Trigger cuando el elemento está a 10% del borde inferior
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        // Opcionalmente, dejar de observar después de animar
        if (options.unobserveAfterAnimate) {
          observer.unobserve(entry.target);
        }
      } else if (!options.unobserveAfterAnimate) {
        // Si no se desactiva la observación, quitar la clase cuando sale del viewport
        entry.target.classList.remove(animationClass);
      }
    });
  }, mergedOptions);
  
  // Observar todos los elementos que coincidan con el selector
  document.querySelectorAll(selector).forEach(el => {
    observer.observe(el);
  });
  
  return observer;
}

/**
 * Inicializa animaciones para elementos con diferentes clases de animación
 * Esto permite tener diferentes tipos de animaciones en la misma página
 */
export function initAllScrollAnimations() {
  // Animación estándar de fade-in
  initScrollAnimation('.animate-on-scroll', 'visible', { unobserveAfterAnimate: true });
  
  // Animación desde la izquierda
  initScrollAnimation('.animate-from-left', 'visible-left', { unobserveAfterAnimate: true });
  
  // Animación desde la derecha
  initScrollAnimation('.animate-from-right', 'visible-right', { unobserveAfterAnimate: true });
  
  // Animación de zoom
  initScrollAnimation('.animate-zoom', 'visible-zoom', { unobserveAfterAnimate: true });
}

export default {
  initScrollAnimation,
  initAllScrollAnimations
}; 