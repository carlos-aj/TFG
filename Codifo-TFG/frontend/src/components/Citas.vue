<script setup>
import { ref, onMounted, watch } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_test_51RWvazLB0prsJIjWVQS5RIPjXeWda2BHWUaW9e6d6ensZCGquMaFZoD5CTuet9S9d2dv72h5Nt1t5wDKYTvcMSE600HeM31aeT');
const pagarAhora = ref(false) // NUEVO
const servicios = ref([])
const barberos = ref([])
const servicioSeleccionado = ref(null)
const barberoSeleccionado = ref(null)
const fechaSeleccionada = ref(null)
const horaSeleccionada = ref('')
const horasOcupadas = ref([])
const horaInvitado = ref('');
const puedeInvitar = ref(false)
const nombreInvitado = ref('')
const servicioInvitado = ref(null)
const barberoInvitado = ref(null)
const horasOcupadasInvitado = ref([]);
const horasOcupadasPorBarbero = ref({});


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

function getBarberosDisponibles() {
  // Siempre muestra todos los barberos si no hay fecha seleccionada
  if (!fechaSeleccionada.value) return barberos.value;
  // Muestra todos los barberos, pero si el barbero está completamente ocupado, lo deshabilitas en el select
  return barberos.value;
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

watch([barberoSeleccionado, fechaSeleccionada], async () => {
  if (!barberoSeleccionado.value || !fechaSeleccionada.value) {
    horasOcupadas.value = [];
    return;
  }
  const fechaFormateada = new Date(fechaSeleccionada.value).toISOString().split('T')[0];
  const res = await fetch(`http://localhost:3000/api/cita?barbero_id=${barberoSeleccionado.value}&fecha=${fechaFormateada}`);
  const citas = await res.json();
  // Normaliza a formato HH:mm
  horasOcupadas.value = citas.map(c => c.hora.slice(0,5));
});

watch([barberoInvitado, fechaSeleccionada], async () => {
  if (!barberoInvitado.value || !fechaSeleccionada.value) {
    horasOcupadasInvitado.value = [];
    return;
  }
  const fechaFormateada = new Date(fechaSeleccionada.value).toISOString().split('T')[0];
  const res = await fetch(`http://localhost:3000/api/cita?barbero_id=${barberoInvitado.value}&fecha=${fechaFormateada}`);
  const citas = await res.json();
  horasOcupadasInvitado.value = citas.map(c => c.hora.slice(0,5));
});

watch(fechaSeleccionada, async () => {
  if (!fechaSeleccionada.value) {
    horasOcupadasPorBarbero.value = {};
    return;
  }
  const fechaFormateada = new Date(fechaSeleccionada.value).toISOString().split('T')[0];
  const ocupadas = {};
  for (const barbero of barberos.value) {
    const res = await fetch(`http://localhost:3000/api/cita?barbero_id=${barbero.id}&fecha=${fechaFormateada}`);
    const citas = await res.json();
    ocupadas[barbero.id] = citas.map(c => {
      if (typeof c.hora === 'string') return c.hora.slice(0,5);
      // Si c.hora es objeto tipo { hours: 9, minutes: 30, seconds: 0 }
      if (typeof c.hora === 'object' && c.hora !== null) {
        const h = String(c.hora.hours).padStart(2, '0');
        const m = String(c.hora.minutes).padStart(2, '0');
        return `${h}:${m}`;
      }
      return c.hora; // fallback
    });
  }
  horasOcupadasPorBarbero.value = ocupadas;
  console.log('Barberos:', barberos.value);
console.log('Horas ocupadas por barbero:', ocupadas);
console.log('Horas disponibles:', getHorasDisponibles());
});

watch([barberoSeleccionado, fechaSeleccionada], () => {
  if (!barberoSeleccionado.value || !fechaSeleccionada.value) {
    horasOcupadas.value = [];
    return;
  }
  // Espera a que horasOcupadasPorBarbero esté listo
  horasOcupadas.value = horasOcupadasPorBarbero.value[barberoSeleccionado.value] || [];
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

  // Prepara el objeto cita
  const cita = {
    servicio_id: servicioSeleccionado.value,
    barbero_id: barberoSeleccionado.value,
    fecha: fechaSeleccionada.value,
    hora: horaSeleccionada.value,
    estado: false,
    pagado: false,
    user_id: parseInt(user_id)
  }

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

  // Si el usuario quiere pagar ahora, inicia Stripe Checkout
  if (pagarAhora.value) {
    // Busca el precio del servicio seleccionado (ajusta según tu modelo)
    const servicio = servicios.value.find(s => s.id === servicioSeleccionado.value)
    const amount = servicio ? Math.round(servicio.precio * 100) : 1000 // en céntimos

    // Llama a tu backend para crear la sesión de Stripe Checkout
    const res = await fetch('http://localhost:3000/api/cita/pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    const data = await res.json()
    if (!data.sessionId) {
      alert('Error iniciando pago')
      return
    }

    const stripe = await stripePromise
    // Redirige a Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId })
    if (error) {
      alert(error.message)
    }
    // El flujo continúa en el backend/webhook tras el pago
    return
  }

  // Si no paga ahora, reserva la cita normalmente
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
    pagarAhora.value = false
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
      <select v-model="barberoSeleccionado" required v-if="Object.keys(horasOcupadasPorBarbero).length === barberos.length && barberos.length > 0">
        <option disabled value="">Selecciona un barbero</option>
        <option
          v-for="barbero in barberos"
          :key="barbero.id"
          :value="barbero.id"
          :disabled="
            fechaSeleccionada &&
            Array.isArray(horasOcupadasPorBarbero[barbero.id]) &&
            getHorasDisponibles().filter(h => !(horasOcupadasPorBarbero[barbero.id]).includes(h)).length === 0
          "
        >
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
      <select v-model="horaSeleccionada" required v-if="horasOcupadas && barberoSeleccionado && fechaSeleccionada">
        <option disabled value="">Selecciona una hora</option>
        <option
          v-for="hora in getHorasDisponibles().filter(h => !horasOcupadas.includes(h))"
          :key="hora"
          :value="hora"
        >
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
      <label>
        <input type="checkbox" v-model="pagarAhora" />
        Pagar ahora
      </label>

      <button type="submit">Reservar</button>
    </form>
  </div>
</template>