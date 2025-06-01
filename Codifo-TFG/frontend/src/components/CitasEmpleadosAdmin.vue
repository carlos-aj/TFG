<script setup>
import { ref, onMounted, computed } from 'vue'

const citas = ref([])
const loading = ref(true)
const error = ref('')
const rol = localStorage.getItem('role')
const barbero_id = localStorage.getItem('barbero_id') // Asegúrate de guardar esto al hacer login de empleado

const hoy = new Date().toISOString().split('T')[0]

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/cita')
    if (!res.ok) throw new Error('Error al cargar citas')
    const data = await res.json()
    citas.value = data

    console.log('Hoy:', hoy)
    console.log('Fechas de citas:', data.map(c => c.fecha))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const citasFiltradas = computed(() => {
  // Filtra por fecha de hoy
  let filtradas = citas.value.filter(c => c.fecha && c.fecha.slice(0, 10) === hoy)
  // Si es empleado, filtra solo sus citas
  if (rol === 'empleado' && barbero_id) {
    filtradas = filtradas.filter(c => String(c.barbero_id) === String(barbero_id))
  }
  return filtradas
})
</script>

<template>
  <div class="landing">
    <h1>Citas del día</h1>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <table v-if="citasFiltradas.length">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Barbero</th>
            <th>Servicio</th>
            <th>Hora</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cita in citasFiltradas" :key="cita.id">
            <td>{{ cita.user_id }}</td>
            <td>{{ cita.barbero_id }}</td>
            <td>{{ cita.servicio_id }}</td>
            <td>{{ cita.hora }}</td>
            <td>{{ cita.estado ? 'Atendida' : 'Pendiente' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else>No hay citas para hoy.</div>
    </div>
  </div>
</template>

<style scoped>
.landing {
  text-align: center;
}
table {
  margin: 0 auto;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px 12px;
}
</style>