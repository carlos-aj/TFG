<template>
    <div class="not-found">
        <h1 class="error-code">404</h1>
        <p class="error-message">Página no encontrada</p>
        <router-link to="/" class="home-link">Volver al inicio</router-link>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { gsap } from 'gsap';

onMounted(() => {
    // Animación para el código de error
    gsap.from('.error-code', {
        opacity: 0,
        y: -100,
        scale: 2,
        duration: 1,
        ease: 'elastic.out(1, 0.3)'
    });
    
    // Animación para el mensaje
    gsap.from('.error-message', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out'
    });
    
    // Animación para el enlace
    gsap.from('.home-link', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.8,
        ease: 'power2.out'
    });
});
</script>

<style scoped>
.not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    text-align: center;
    background-color: var(--main-bg-color);
    color: var(--text-color);
    padding: 2rem;
}
.not-found h1 {
    font-size: 8rem;
    margin: 0;
    color: var(--accent-color);
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    text-shadow: 0 0 15px rgba(245, 224, 9, 0.4);
}
.not-found p {
    font-size: 1.8rem;
    margin: 1.5rem 0;
    font-weight: 300;
}
.not-found a {
    color: var(--accent-color);
    text-decoration: none;
    font-size: 1.2rem;
    padding: 0.8rem 1.5rem;
    border: 2px solid var(--accent-color);
    border-radius: 30px;
    transition: all 0.3s ease;
    margin-top: 1rem;
}
.not-found a:hover {
    background-color: var(--accent-color);
    color: var(--main-bg-color);
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(245, 224, 9, 0.4);
}
</style>