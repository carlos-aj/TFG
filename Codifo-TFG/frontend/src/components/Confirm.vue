<template>
  <div class="confirm-container">
    <div class="confirm-card">
      <h2 class="title fade-in">Confirmando cuenta...</h2>
      <div v-if="message" class="message-container">
        <p class="message fade-in">{{ message }}</p>
        <div v-if="success" class="success-icon fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="60" height="60">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { API_URL } from '../config'

const message = ref('')
const route = useRoute()
const router = useRouter()
const success = ref(false)

onMounted(async () => {
  // Animación inicial
  gsap.from('.confirm-card', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'back.out(1.7)'
  });
  
  gsap.from('.title', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    delay: 0.3,
    ease: 'power2.out'
  });

  const token = route.query.token
  if (!token) {
    message.value = 'Token no válido'
    return
  }
  
  try {
    const res = await fetch(`${API_URL}/api/user/confirm?token=${token}`)
    const data = await res.json()
    if (res.ok) {
      success.value = true
      message.value = '¡Cuenta confirmada! Ya puedes iniciar sesión.'
      
      // Animación para el mensaje de éxito
      setTimeout(() => {
        gsap.from('.message, .success-icon', {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out'
        });
      }, 100);
      
      // Animación de salida antes de redirigir
      setTimeout(() => {
        gsap.to('.confirm-card', {
          opacity: 0,
          y: -30,
          duration: 0.6,
          onComplete: () => {
            router.push('/login')
          }
        });
      }, 2000)
    } else {
      message.value = data.message || 'Error al confirmar la cuenta'
      
      // Animación para el mensaje de error
      setTimeout(() => {
        gsap.from('.message', {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power2.out'
        });
      }, 100);
    }
  } catch (err) {
    message.value = 'Error de red al confirmar la cuenta'
    
    // Animación para el mensaje de error
    setTimeout(() => {
      gsap.from('.message', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, 100);
  }
})
</script>

<style scoped>
.confirm-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: var(--main-bg-color);
  padding: 2rem;
}

.confirm-card {
  background-color: rgba(43, 43, 43, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 224, 9, 0.2);
  border-radius: 12px;
  padding: 2.5rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.title {
  color: var(--text-color);
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.message-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.message {
  color: var(--text-color);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.success-icon {
  margin-top: 1rem;
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
</style>