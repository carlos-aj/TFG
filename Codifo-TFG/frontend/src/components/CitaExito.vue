<template>
  <div class="success-container">
    <div class="success-card">
      <div class="icon-container">
        <svg class="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>
      <h1 class="fade-in">¡Pago completado!</h1>
      <p class="fade-in">Tu cita ha sido confirmada. Revisa tu correo para ver los detalles.</p>
      <p class="fade-in">Serás redirigido al inicio en unos segundos...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { gsap } from 'gsap';
import { API_URL } from '../config'; 
import { getAuthHeaders, getToken } from '../utils/auth'; 

const router = useRouter();
const route = useRoute();
const procesando = ref(false);

onMounted(async () => {
  if (procesando.value) return;
  procesando.value = true;

  gsap.from('.success-card', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'back.out(1.7)'
  });

  gsap.from('.fade-in', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.2,
    delay: 0.8,
    ease: 'power2.out'
  });

  try {
    let citaId = route.query.cita_id;

    if (!citaId) {
      citaId = localStorage.getItem('ultima_cita_id') || '1';
    }

    const response = await fetch(`${API_URL}/api/cita/confirmar-pago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ cita_id: Number(citaId) })
    });

    if (!response.ok) {
      console.error('Error en la respuesta del servidor:', await response.text());
    } else {
    }
  } catch (error) {
    console.error('Error al procesar la confirmación de la cita:', error);

  }

  setTimeout(() => {
    gsap.to('.success-card', {
      opacity: 0,
      y: -30,
      duration: 0.6,
      onComplete: () => {
        router.push('/');
      }
    });
  }, 3500); 
});
</script>

<style scoped>
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  background-color: var(--main-bg-color);
  color: var(--text-color);
  font-family: Arial, sans-serif;
}
.success-card {
  text-align: center;
  padding: 40px;
  border-radius: 15px;
  background: rgba(43, 43, 43, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 224, 9, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}
.icon-container {
  margin-bottom: 20px;
}
.success-icon {
  width: 80px;
  height: 80px;
  display: block;
  margin: 0 auto;
}
.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: var(--accent-color);
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke: var(--accent-color);
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}
@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
h1 {
  color: var(--text-color);
  font-size: 24px;
  margin-bottom: 10px;
  font-family: 'DM Serif Display', serif;
  font-style: italic;
}
p {
  color: var(--text-color);
  font-size: 16px;
  margin-bottom: 25px;
}
</style> 