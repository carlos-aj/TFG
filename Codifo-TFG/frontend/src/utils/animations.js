import { gsap } from 'gsap';

/**
 * Conjunto de animaciones comunes para ser reutilizadas en toda la aplicación
 */

/**
 * Anima elementos con efecto de fade-in y movimiento hacia arriba
 * @param {string} selector - Selector CSS para los elementos a animar
 * @param {Object} options - Opciones de animación
 */
export function fadeInUp(selector, options = {}) {
  const defaults = {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    delay: 0
  };
  
  gsap.from(selector, { ...defaults, ...options });
}

/**
 * Anima elementos con efecto de fade-in y movimiento hacia abajo
 * @param {string} selector - Selector CSS para los elementos a animar
 * @param {Object} options - Opciones de animación
 */
export function fadeInDown(selector, options = {}) {
  const defaults = {
    opacity: 0,
    y: -30,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    delay: 0
  };
  
  gsap.from(selector, { ...defaults, ...options });
}

/**
 * Anima elementos con efecto de fade-in y movimiento desde la izquierda
 * @param {string} selector - Selector CSS para los elementos a animar
 * @param {Object} options - Opciones de animación
 */
export function fadeInLeft(selector, options = {}) {
  const defaults = {
    opacity: 0,
    x: -50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    delay: 0
  };
  
  gsap.from(selector, { ...defaults, ...options });
}

/**
 * Anima elementos con efecto de fade-in y movimiento desde la derecha
 * @param {string} selector - Selector CSS para los elementos a animar
 * @param {Object} options - Opciones de animación
 */
export function fadeInRight(selector, options = {}) {
  const defaults = {
    opacity: 0,
    x: 50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    delay: 0
  };
  
  gsap.from(selector, { ...defaults, ...options });
}

/**
 * Anima elementos con efecto de zoom
 * @param {string} selector - Selector CSS para los elementos a animar
 * @param {Object} options - Opciones de animación
 */
export function zoomIn(selector, options = {}) {
  const defaults = {
    opacity: 0,
    scale: 0.8,
    duration: 0.8,
    stagger: 0.2,
    ease: 'back.out(1.7)',
    delay: 0
  };
  
  gsap.from(selector, { ...defaults, ...options });
}

/**
 * Anima elementos con efecto de rebote
 * @param {string} selector - Selector CSS para los elementos a animar
 * @param {Object} options - Opciones de animación
 */
export function bounce(selector, options = {}) {
  const defaults = {
    y: -20,
    repeat: 1,
    yoyo: true,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0
  };
  
  gsap.from(selector, { ...defaults, ...options });
}

/**
 * Anima elementos en una secuencia escalonada
 * @param {string} selector - Selector CSS para los elementos a animar
 * @param {Object} options - Opciones de animación
 */
export function staggerElements(selector, options = {}) {
  const defaults = {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0
  };
  
  gsap.from(selector, { ...defaults, ...options });
}

/**
 * Anima la apertura de un modal
 * @param {string} selector - Selector CSS para el modal a animar
 */
export function animateModal(selector = '.modal-content') {
  gsap.from(selector, {
    opacity: 0,
    scale: 0.8,
    duration: 0.5,
    ease: 'back.out(1.7)'
  });
}

export default {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  zoomIn,
  bounce,
  staggerElements,
  animateModal
}; 