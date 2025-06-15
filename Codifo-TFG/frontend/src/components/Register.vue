<template>
  <div class="register-page">
    <div class="overlay"></div>
    <div class="register-container">
      <v-card class="register-card fade-in" elevation="10" rounded="lg">
        <v-card-title class="text-h4 text-center dm-serif font-italic fade-in">Crear Cuenta</v-card-title>
        
        <v-card-text>
          <v-alert
            v-if="successMessage"
            type="success"
            class="mb-4 fade-in"
            density="compact"
          >{{ successMessage }}</v-alert>
          
          <v-form @submit.prevent="register" class="form-container">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="username"
                  label="Nombre"
                  :error-messages="errors.username"
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  bg-color="rgba(43, 43, 43, 0.7)"
                  color="var(--accent-color)"
                  class="fade-in"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="surname"
                  label="Apellidos"
                  :error-messages="errors.surname"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-outline"
                  bg-color="rgba(43, 43, 43, 0.7)"
                  color="var(--accent-color)"
                  class="fade-in"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              :error-messages="errors.email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              class="mb-3 fade-in"
              bg-color="rgba(43, 43, 43, 0.7)"
              color="var(--accent-color)"
            ></v-text-field>
            
            <v-text-field
              v-model="phone"
              label="Teléfono"
              type="tel"
              :error-messages="errors.phone"
              variant="outlined"
              prepend-inner-icon="mdi-phone"
              class="mb-3 fade-in"
              bg-color="rgba(43, 43, 43, 0.7)"
              color="var(--accent-color)"
            ></v-text-field>
            
            <v-text-field
              v-model="password"
              label="Contraseña"
              type="password"
              :error-messages="errors.password"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              class="mb-3 fade-in"
              bg-color="rgba(43, 43, 43, 0.7)"
              color="var(--accent-color)"
            ></v-text-field>
            
            <v-expand-transition>
              <v-text-field
                v-if="password.length > 0"
                v-model="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                :error-messages="errors.confirmPassword"
                variant="outlined"
                prepend-inner-icon="mdi-lock-check"
                class="mb-4 fade-in"
                bg-color="rgba(43, 43, 43, 0.7)"
                color="var(--accent-color)"
              ></v-text-field>
            </v-expand-transition>
            
            <div class="my-4 text-center normal-text fade-in">
              <span>¿Ya tienes cuenta? </span>
              <router-link to="/login" class="accent-link">Inicia sesión aquí</router-link>
            </div>
            
            <v-btn 
              color="var(--accent-color)" 
              type="submit" 
              block
              class="register-btn mt-4 fade-in"
              size="large"
              elevation="3"
            >
              Registrarse
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { gsap } from 'gsap'
import { API_URL } from '../config'

const username = ref('')
const surname = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')

const successMessage = ref('')

const errors = reactive({
  username: '',
  surname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

onMounted(() => {
  gsap.from('.register-card', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power2.out'
  });
  
  gsap.from('.form-container > *, .form-container .v-row > *, .text-h4', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    delay: 0.3,
    ease: 'power2.out'
  });
});

const validate = () => {
  let valid = true

  for (const key in errors) {
    errors[key] = ''
  }

  if (!username.value) {
    errors.username = 'El nombre es obligatorio'
    valid = false
  }

  if (!surname.value) {
    errors.surname = 'Los apellidos son obligatorios'
    valid = false
  }

  if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
    errors.email = 'Introduce un email válido'
    valid = false
  }

  if (!phone.value || !/^\d{9,15}$/.test(phone.value)) {
    errors.phone = 'Introduce un número de teléfono válido'
    valid = false
  }

  if (!password.value || password.value.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    valid = false
  }

  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    valid = false
  }

  return valid
}

const resetForm = () => {
  username.value = ''
  surname.value = ''
  email.value = ''
  phone.value = ''
  password.value = ''
  confirmPassword.value = ''
}

const register = () => {
  if (!validate()) {
    return
  }

  const formData = {
    nombre: username.value,
    apellidos: surname.value,
    email: email.value,
    telefono: phone.value,
    contrasena: password.value,
    rol: 'user'
  }

  fetch(`${API_URL}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  })
  .then((data) => {
    successMessage.value = 'Registro exitoso. Por favor, revisa tu correo para validar tu cuenta.'
    resetForm()
  })
  .catch((error) => {
    console.error('Error:', error)
  })
}
</script>

<style scoped>
.register-page {
  position: relative;
  background-image: url('../assets/imagenHero.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  min-height: 100vh; 
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 7rem 0 2rem 0;
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

.register-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600px;
  padding: 0 1rem;
  margin-top: 2rem;
}

.register-card {
  background-color: rgba(43, 43, 43, 0.85) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 224, 9, 0.2);
  padding: 2rem;
}

.register-btn {
  font-weight: bold !important;
  color: var(--main-bg-color) !important;
  font-style: normal !important;
  letter-spacing: 1px;
  transition: transform 0.3s ease;
  padding: 0.75rem !important;
}

.register-btn:hover {
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
}

:deep(.v-label) {
  color: var(--text-color) !important;
  opacity: 0.8;
}

:deep(.v-field__outline) {
  color: var(--accent-color) !important;
}
</style>