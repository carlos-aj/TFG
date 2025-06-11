<template>
  <div class="success-container">
    <div class="success-card">
      <div class="icon-container">
        <svg class="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>
      <h1>¡Pago completado!</h1>
      <p>Tu cita ha sido confirmada. Revisa tu correo para ver los detalles.</p>
      <p>Serás redirigido al inicio en unos segundos...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { API_URL } from '../config'; // Importar la URL base correcta
import { getAuthHeaders } from '../utils/auth'; // Importar los headers de autenticación

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const citaId = route.query.cita_id;

  if (citaId) {
    try {
      // Llama al backend para confirmar el pago y que se envíe el email
      await fetch(`${API_URL}/api/cita/confirmar-pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders() // Añadir token de autenticación
        },
        body: JSON.stringify({ cita_id: Number(citaId) })
      });
      console.log('Confirmación de la cita procesada correctamente.');
    } catch (error) {
      console.error('Error al procesar la confirmación de la cita:', error);
      // Opcional: Podrías mostrar un mensaje de error al usuario aquí
    }
  }

  // Redirigir al inicio después de un tiempo
  setTimeout(() => {
    router.push('/');
  }, 4000); // Espera 4 segundos antes de redirigir
});
</script>

<style scoped>
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  background-color: #f4f4f4;
  font-family: Arial, sans-serif;
}
.success-card {
  text-align: center;
  padding: 40px;
  border-radius: 15px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
  stroke: #7ac142;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke: #7ac142;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}
@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 10px;
}
p {
  color: #666;
  font-size: 16px;
  margin-bottom: 25px;
}
</style> 