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
    threshold: 0.1, 
    rootMargin: '0px 0px -10% 0px' 
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        if (options.unobserveAfterAnimate) {
          observer.unobserve(entry.target);
        }
      } else if (!options.unobserveAfterAnimate) {
        entry.target.classList.remove(animationClass);
      }
    });
  }, mergedOptions);
  
  document.querySelectorAll(selector).forEach(el => {
    observer.observe(el);
  });
  
  return observer;
}

export function initAllScrollAnimations() {
  initScrollAnimation('.animate-on-scroll', 'visible', { unobserveAfterAnimate: true });
  
  initScrollAnimation('.animate-from-left', 'visible-left', { unobserveAfterAnimate: true });
  
  initScrollAnimation('.animate-from-right', 'visible-right', { unobserveAfterAnimate: true });
  
  initScrollAnimation('.animate-zoom', 'visible-zoom', { unobserveAfterAnimate: true });
}

export default {
  initScrollAnimation,
  initAllScrollAnimations
}; 