<template> 
  <div class="landing">
    <h1>login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="correo">Correo:</label>
        <input type="email" id="correo" v-model="correo" />
        <p v-if="errors.correo" class="error">{{ errors.correo }}</p>
      </div>

      <div>
        <label for="contrasena">Contraseña:</label>
        <input type="password" id="contrasena" v-model="contrasena" />
        <p v-if="errors.contrasena" class="error">{{ errors.contrasena }}</p>
      </div>
      <div>
         Registrate si aun no lo estas.
        <router-link to="/register">Registrarse</router-link>
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="errors.general" class="error">{{ errors.general }}</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '../config'
import { saveAuthData } from '../utils/auth'

const correo = ref('')
const contrasena = ref('')
const errors = reactive({ correo: '', contrasena: '', general: '' })
const router = useRouter()

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

    // Usar la utilidad para guardar los datos de autenticación
    saveAuthData(data);
    
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
.error {
  color: red;
  font-size: 0.8rem;
  margin-top: 5px;
}

input {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #45a049;
}
</style>
