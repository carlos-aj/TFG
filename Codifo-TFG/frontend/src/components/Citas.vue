<script setup>
import { ref, onMounted, watch } from 'vue'

const servicios = ref([])
const barberos = ref([])
const servicioSeleccionado = ref(null)
const barberoSeleccionado = ref(null)
const fechaSeleccionada = ref(null)
const horaSeleccionada = ref('')
const horasOcupadas = ref([])
const horasDisponibles = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
]
const horaInvitado = ref('');
const puedeInvitar = ref(false)
const nombreInvitado = ref('')
const servicioInvitado = ref(null)
const barberoInvitado = ref(null)
const horasOcupadasInvitado = ref([]);


// Para el diálogo del date picker
const datePickerDialog = ref(false)

function getHorasDisponibles() {
  if (!fechaSeleccionada.value) return [];
  const fecha = new Date(fechaSeleccionada.value);
  const dia = fecha.getDay(); // 0=Domingo, 1=Lunes, ..., 5=Viernes
  if (dia >= 1 && dia <= 4) {
    // Lunes a Jueves
    return [
      '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
    ];
  } else if (dia === 5) {
    // Viernes
    return [
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ];
  }
  return [];
}

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

watch([barberoSeleccionado, fechaSeleccionada, horaSeleccionada], () => {
  checkPuedeInvitar();
});

watch([barberoInvitado, fechaSeleccionada, servicioInvitado], async () => {
  if (!barberoInvitado.value || !fechaSeleccionada.value || !servicioInvitado.value) {
    horasOcupadasInvitado.value = [];
    return;
  }
  const fechaFormateada = new Date(fechaSeleccionada.value).toISOString().split('T')[0];
  const res = await fetch(`http://localhost:3000/api/cita?barbero_id=${barberoInvitado.value}&fecha=${fechaFormateada}`);
  const citas = await res.json();
  horasOcupadasInvitado.value = citas.map(c => c.hora);
});

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

  // Si puede invitar y los campos de invitado están completos, añade los datos del invitado al mismo objeto
  if (
    puedeInvitar.value &&
    nombreInvitado.value &&
    servicioInvitado.value &&
    barberoInvitado.value &&
    horaInvitado.value
  ) {
    cita.nombre_invitado = nombreInvitado.value;
    cita.servicio_id_invitado = servicioInvitado.value;
    cita.barbero_id_invitado = barberoInvitado.value;
    cita.hora_invitado = horaInvitado.value;
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
    nombreInvitado.value = ''
    servicioInvitado.value = null
    barberoInvitado.value = null
  } else {
    const errorData = await res.json();
    alert(errorData.message || 'Error al reservar la cita.');
  }
}

function getHorasInvitado() {
  if (!horaSeleccionada.value || !barberoInvitado.value) return [];
  const horas = getHorasDisponibles();
  const idx = horas.indexOf(horaSeleccionada.value);

  let opciones = [];
  if (barberoInvitado.value === barberoSeleccionado.value) {
    // Mismo barbero: solo anterior y siguiente
    if (idx > 0) opciones.push(horas[idx - 1]);
    if (idx < horas.length - 1) opciones.push(horas[idx + 1]);
  } else {
    // Otro barbero: misma, anterior y siguiente
    if (idx > 0) opciones.push(horas[idx - 1]);
    opciones.push(horaSeleccionada.value);
    if (idx < horas.length - 1) opciones.push(horas[idx + 1]);
  }

  // Solo muestra horas que estén libres para el barbero invitado
  const ocupadas = horasOcupadasInvitado.value || [];
  return opciones.filter(hora => !ocupadas.includes(hora));
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
          locale="es"
        ></v-date-picker>
      </v-dialog>

      <label>Hora:</label>
      <select v-model="horaSeleccionada" required>
        <option disabled value="">Selecciona una hora</option>
        <option
          v-for="hora in getHorasDisponibles()"
          :key="hora"
          :value="hora"
          :disabled="horasOcupadas.includes(hora)"
        >
          {{ hora }} <span v-if="horasOcupadas.includes(hora)"> (Ocupada)</span>
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
        <select v-model="horaInvitado" required>
          <option disabled value="">Selecciona una hora</option>
          <option
            v-for="hora in getHorasInvitado()"
            :key="hora"
            :value="hora"
          >
            {{ hora }}
          </option>
        </select>
      </div>

      <button type="submit">Reservar</button>
    </form>
  </div>
</template>