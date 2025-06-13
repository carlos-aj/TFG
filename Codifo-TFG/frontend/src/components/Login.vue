<template>
  <div class="login-page">
    <div class="overlay"></div>
    <div class="login-container">
      <v-card class="login-card fade-in" elevation="10" rounded="lg">
        <v-card-title class="text-h4 text-center dm-serif font-italic fade-in">Iniciar Sesión</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="login" class="form-container">
            <v-text-field
              v-model="correo"
              label="Correo"
              type="email"
              :error-messages="errors.correo"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              class="mb-3 fade-in"
              bg-color="rgba(43, 43, 43, 0.7)"
              color="var(--accent-color)"
            ></v-text-field>

            <v-text-field
              v-model="contrasena"
              label="Contraseña"
              type="password"
              :error-messages="errors.contrasena"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              class="mb-4 fade-in"
              bg-color="rgba(43, 43, 43, 0.7)"
              color="var(--accent-color)"
            ></v-text-field>

            <div class="my-4 text-center normal-text fade-in">
              <span>¿No tienes cuenta? </span>
              <router-link to="/register" class="accent-link">Regístrate aquí</router-link>
            </div>

            <v-alert
              v-if="errors.general"
              type="error"
              class="mb-4 fade-in"
              density="compact"
            >{{ errors.general }}</v-alert>

            <v-btn 
              color="var(--accent-color)" 
              type="submit" 
              block
              class="login-btn mt-4 fade-in"
              size="large"
              elevation="3"
            >
              Iniciar Sesión
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { API_URL } from '../config'
import { saveAuthData } from '../utils/auth'

const correo = ref('')
const contrasena = ref('')
const errors = reactive({ correo: '', contrasena: '', general: '' })
const router = useRouter()

onMounted(() => {
  // Animación para la tarjeta de login
  gsap.from('.login-card', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power2.out'
  });
  
  // Animación para el título y los elementos del formulario
  gsap.from('.form-container > *, .text-h4', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.15,
    delay: 0.3,
    ease: 'power2.out'
  });
});

const validate = () => {
  let valid = true
  errors.correo = ''
  errors.contrasena = ''
  errors.general = ''

  if (!correo.value || !/\S+@\S+\.\S+/.test(correo.value)) {
    errors.correo = 'Introduce un correo válido'
    valid = false
  }
  if (!contrasena.value) {
    errors.contrasena = 'La contraseña es obligatoria'
    valid = false
  }
  return valid
}

async function login() {
  if (!validate()) return

  errors.general = '';

  try {
    const response = await fetch(`${API_URL}/api/user/login`, {
      method: 'POST',
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: correo.value, contrasena: contrasena.value })
    });

    if (!response.ok) {
      const errorData = await response.json();
      errors.general = errorData.message || 'Error al iniciar sesión';
      return;
    }

    const data = await response.json();
    console.log('Respuesta de login:', data);

    saveAuthData(data);
    
    await nextTick();

    const destination = (data.rol === 'admin' || data.rol === 'empleado') 
      ? { name: 'citas-empleados-admin' } 
      : { name: 'citas' };

    try {
      await router.replace(destination);
    } catch (error) {
      console.error(`Error de navegación manejado al ir a '${destination.name}':`, error);
    }

  } catch (err) {
    console.error('Error en login:', err);
    errors.general = 'Error de conexión con el servidor';
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  background-image: url('../assets/imagenHero.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  height: 100vh; 
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  max-width: 100%;
}

.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  pointer-events: none;
}

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 550px;
  padding: 0 1rem;
  margin-top: -3rem;
  display: flex;
  justify-content: center;
}

.login-card {
  background-color: rgba(43, 43, 43, 0.85) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 224, 9, 0.2);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
}

.login-btn {
  font-weight: bold !important;
  color: var(--main-bg-color) !important;
  font-style: normal !important;
  letter-spacing: 1px;
  transition: transform 0.3s ease;
  padding: 1rem !important;
  font-size: 1.1rem !important;
}

.login-btn:hover {
  transform: translateY(-3px);
}

.accent-link {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.accent-link:hover {
  text-decoration: underline;
  opacity: 0.9;
}

:deep(.v-field__input) {
  color: var(--text-color) !important;
  font-size: 1.1rem !important;
}

:deep(.v-label) {
  color: var(--text-color) !important;
  opacity: 0.8;
  font-size: 1.1rem !important;
}

:deep(.v-field__outline) {
  color: var(--accent-color) !important;
}
</style>
