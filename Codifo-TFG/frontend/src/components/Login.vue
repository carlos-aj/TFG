<template> 
  <div class="landing">
    <h1>login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="correo">Correo:</label>
        <input type="correo" id="correo" v-model="correo" />
        <p v-if="errors.correo" class="error">{{ errors.correo }}</p>
      </div>

      <div>
        <label for="contrasena">Contraseña:</label>
        <input type="contrasena" id="contrasena" v-model="contrasena" />
        <p v-if="errors.contrasena" class="error">{{ errors.contrasena }}</p>
      </div>
      <div>
         Registrate si aun no lo estas.
        <router-link to="/register">Registrarse</router-link>
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
  <p v-if="errors.general" class="error">{{ errors.general }}</p>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '../config'

const correo = ref('')
const contrasena = ref('')
const errors = reactive({ correo: '', contrasena: '', general: '' })
const router = useRouter()
const error = ref('')

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

    // Verificar que data y token existen
    if (!data || !data.token) {
      errors.general = 'Respuesta inválida del servidor';
      return;
    }

    // Almacenar datos en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.rol || 'cliente');
    
    if (data.id) {
      localStorage.setItem('user_id', data.id);
    }
    
    if (data.nombre) {
      localStorage.setItem('nombre', data.nombre);
    }
    
    if (data.apellidos) {
      localStorage.setItem('apellidos', data.apellidos);
    }
    
    // Notificar cambios en localStorage
    window.dispatchEvent(new Event('storage'));
    
    // Redirigir según el rol
    if (data.rol === 'admin' || data.rol === 'empleado') {
      router.push('/citas-empleados-admin');
    } else {
      router.push('/citas');
    }
  } catch (err) {
    console.error('Error en login:', err);
    errors.general = 'Error de conexión con el servidor';
  }
}
</script>

<style scoped>
</style>
