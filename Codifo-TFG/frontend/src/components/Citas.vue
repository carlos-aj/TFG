<script setup>
import { ref, onMounted, watch } from 'vue'

const servicios = ref([])
const barberos = ref([])
const servicioSeleccionado = ref(null)
const barberoSeleccionado = ref(null)
const fechaSeleccionada = ref(null)
const horaSeleccionada = ref('')
const horasDisponibles = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
]

const puedeInvitar = ref(false)
const nombreInvitado = ref('')
const servicioInvitado = ref(null)
const barberoInvitado = ref(null)


// Para el diálogo del date picker
const datePickerDialog = ref(false)

onMounted(async () => {
  const resServicios = await fetch('http://localhost:3000/api/servicio')
  servicios.value = await resServicios.json()
  const resBarberos = await fetch('http://localhost:3000/api/barbero')
  barberos.value = await resBarberos.json()
})

async function checkPuedeInvitar() {
  if (!barberoSeleccionado.value || !fechaSeleccionada.value || !horaSeleccionada.value) {
    puedeInvitar.value = false
    return
  }

  const fechaFormateada = fechaSeleccionada.value
  ? new Date(fechaSeleccionada.value).toISOString().split('T')[0]
  : '';

  const params = new URLSearchParams({
    barbero_id: barberoSeleccionado.value,
    fecha: fechaFormateada,
    hora: horaSeleccionada.value
  })
  const res = await fetch(`http://localhost:3000/api/cita/puede-invitar/check?${params}`)
  const data = await res.json()
    console.log('Respuesta puedeInvitar:', data) // <-- Añade esto

  puedeInvitar.value = data.puedeInvitar
}

watch([barberoSeleccionado, fechaSeleccionada, horaSeleccionada], checkPuedeInvitar)


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
    const newCita = await res.json()
    // Si puede invitar y los campos de invitado están completos, añade el invitado
    if (
      puedeInvitar.value &&
      nombreInvitado.value &&
      servicioInvitado.value &&
      barberoInvitado.value
    ) {
      await fetch('http://localhost:3000/api/invitado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cita_id: newCita.id,
          nombre: nombreInvitado.value,
          servicio_id: servicioInvitado.value,
          barbero_id: barberoInvitado.value
        })
      })
      alert('¡Cita e invitado reservados con éxito!')
    } else {
      alert('¡Cita reservada con éxito!')
    }
    nombreInvitado.value = ''
    servicioInvitado.value = null
    barberoInvitado.value = null
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
      <div v-if="puedeInvitar" style="margin-top: 2em; border: 1px solid #ccc; padding: 1em;">
        <h3>¿Quieres traer a un amigo?</h3>
        <input v-model="nombreInvitado" placeholder="Nombre del invitado" required />
        <select v-model="servicioInvitado" required>
          <option disabled value="">Selecciona un servicio</option>
          <option v-for="servicio in servicios" :key="servicio.id" :value="servicio.id">
            {{ servicio.nombre }}
          </option>
        </select>
        <select v-model="barberoInvitado" required>
          <option disabled value="">Selecciona un barbero</option>
          <option v-for="barbero in barberos" :key="barbero.id" :value="barbero.id">
            {{ barbero.nombre }}
          </option>
        </select>
      </div>

      <button type="submit">Reservar</button>
    </form>
  </div>
</template>