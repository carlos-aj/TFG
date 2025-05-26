<template>
  <div>
    <h2>Confirmando cuenta...</h2>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const message = ref('')
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    message.value = 'Token no válido'
    return
  }
  try {
    const res = await fetch(`http://localhost:3000/api/user/confirm?token=${token}`)
    const data = await res.json()
    if (res.ok) {
      message.value = '¡Cuenta confirmada! Ya puedes iniciar sesión.'
      setTimeout(() => router.push('/login'), 2000)
    } else {
      message.value = data.message || 'Error al confirmar la cuenta'
    }
  } catch (err) {
    message.value = 'Error de red al confirmar la cuenta'
  }
})
</script>