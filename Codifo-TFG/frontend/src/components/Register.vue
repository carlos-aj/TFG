<template>
  <section>
    <h1>Register</h1>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <form @submit.prevent="register">
      <div>
        <label for="username">Nombre:</label>
        <input type="text" id="username" v-model="username" />
        <p v-if="errors.username" class="error">{{ errors.username }}</p>
      </div>

      <div>
        <label for="surname">Apellidos:</label>
        <input type="text" id="surname" v-model="surname" />
        <p v-if="errors.surname" class="error">{{ errors.surname }}</p>
      </div>

      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" />
        <p v-if="errors.email" class="error">{{ errors.email }}</p>
      </div>

      <div>
        <label for="phone">Teléfono:</label>
        <input type="tel" id="phone" v-model="phone" />
        <p v-if="errors.phone" class="error">{{ errors.phone }}</p>
      </div>

      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" />
        <p v-if="errors.password" class="error">{{ errors.password }}</p>
      </div>

      <div v-if="password">
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" />
        <p v-if="errors.confirmPassword" class="error">{{ errors.confirmPassword }}</p>
      </div>

      <button type="submit">Register</button>
    </form>
  </section>
</template>
<script setup>
import { ref, reactive } from 'vue'
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
    console.log('Success:', data)
    successMessage.value = 'Registro exitoso. Por favor, revisa tu correo para validar tu cuenta.'
    resetForm()
  })
  .catch((error) => {
    console.error('Error:', error)
  })
}
</script>


<style scoped>

</style>