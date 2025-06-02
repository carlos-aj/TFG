<script setup>
import { ref, onMounted } from 'vue'

const servicios = ref([])
const barberos = ref([])
const servicioSeleccionado = ref(null)
const barberoSeleccionado = ref(null)
const fechaSeleccionada = ref(null)
const horaSeleccionada = ref('')
const horasDisponibles = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '16:00', '17:00', '18:00', '19:00'
]

// Para el diálogo del date picker
const datePickerDialog = ref(false)

onMounted(async () => {
  const resServicios = await fetch('http://localhost:3000/api/servicio')
  servicios.value = await resServicios.json()
  const resBarberos = await fetch('http://localhost:3000/api/barbero')
  barberos.value = await resBarberos.json()
})

async function reservarCita() {
  if (!servicioSeleccionado.value || !barberoSeleccionado.value || !fechaSeleccionada.value || !horaSeleccionada.value) {
    alert('Por favor, completa todos los campos.')
    return
  }

  const user_id = localStorage.getItem('user_id')
  if (!user_id) {
    alert('No se encontró el user_id en localStorage')
    return
  }

  const cita = {
    servicio_id: servicioSeleccionado.value,
    barbero_id: barberoSeleccionado.value,
    fecha: fechaSeleccionada.value,
    hora: horaSeleccionada.value,
    estado: false,
    pagado: false,
    user_id: parseInt(user_id)
  }

  console.log('Cita a enviar:', cita)

  const res = await fetch('http://localhost:3000/api/cita', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cita)
  })

  if (res.ok) {
    alert('¡Cita reservada con éxito!')
  } else {
    const errorData = await res.json();
    alert(errorData.message || 'Error al reservar la cita.');
  }
}
</script>

<template>
  <div class="landing">
    <h1>Reservar Cita</h1>
    <form @submit.prevent="reservarCita" class="form-cita">
      <label>Servicio:</label>
      <select v-model="servicioSeleccionado" required>
        <option disabled value="">Selecciona un servicio</option>
        <option v-for="servicio in servicios" :key="servicio.id" :value="servicio.id">
          {{ servicio.nombre }}
        </option>
      </select>

      <label>Barbero:</label>
      <select v-model="barberoSeleccionado" required>
        <option disabled value="">Selecciona un barbero</option>
        <option v-for="barbero in barberos" :key="barbero.id" :value="barbero.id">
          {{ barbero.nombre }}
        </option>
      </select>

      <label>Fecha:</label>
      <v-text-field
        v-model="fechaSeleccionada"
        label="Selecciona una fecha"
        readonly
        @click="datePickerDialog = true"
        required
      ></v-text-field>
      <v-dialog v-model="datePickerDialog" width="290px">
        <v-date-picker
          v-model="fechaSeleccionada"
          :min="new Date().toISOString().split('T')[0]"
          @update:model-value="datePickerDialog = false"
        ></v-date-picker>
      </v-dialog>

      <label>Hora:</label>
      <select v-model="horaSeleccionada" required>
        <option disabled value="">Selecciona una hora</option>
        <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
          {{ hora }}
        </option>
      </select>

      <button type="submit">Reservar</button>
    </form>
  </div>
</template>