<script setup>
import { ref, onMounted, watch } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { API_URL } from '../config'
import { useRouter } from 'vue-router'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
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

const router = useRouter()

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
  const resServicios = await fetch(`${API_URL}/api/servicio`, {
    credentials: 'include'
  })
  servicios.value = await resServicios.json()
  const resBarberos = await fetch(`${API_URL}/api/barbero`, {
    credentials: 'include'
  })
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
  const res = await fetch(`${API_URL}/api/cita/puede-invitar/check?${params}`, {
    credentials: 'include'
  })
  const data = await res.json()
  console.log('Respuesta puedeInvitar:', data)

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
  const res = await fetch(`${API_URL}/api/cita?barbero_id=${barberoSeleccionado.value}&fecha=${fechaFormateada}`, {
    credentials: 'include'
  });
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
  const res = await fetch(`${API_URL}/api/cita?barbero_id=${barberoInvitado.value}&fecha=${fechaFormateada}`, {
    credentials: 'include'
  });
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
    const res = await fetch(`${API_URL}/api/cita?barbero_id=${barbero.id}&fecha=${fechaFormateada}`, {
      credentials: 'include'
    });
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

  // El backend espera la fecha en formato YYYY-MM-DD.
  // v-date-picker puede devolver un objeto Date o un string ISO, así que lo formateamos.
  const fechaObj = new Date(fechaSeleccionada.value);
  const fechaFormateada = fechaObj.toISOString().split('T')[0];

  // Prepara el objeto cita
  const cita = {
    servicio_id: servicioSeleccionado.value,
    barbero_id: barberoSeleccionado.value,
    fecha: fechaFormateada, // Usar la fecha formateada
    hora: horaSeleccionada.value,
    estado: false,
    pagado: false,
    user_id: parseInt(user_id)
  }

  if (pagarAhora.value) {
    cita.pago_online = true;
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
    try {
      // Primero crear la cita
      console.log('Creando cita...');
      const resCita = await fetch(`${API_URL}/api/cita`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cita)
      });

      if (!resCita.ok) {
        const errorData = await resCita.json();
        throw new Error(errorData.message || 'Error al crear la cita');
      }

      const citaCreada = await resCita.json();
      console.log('Cita creada:', citaCreada);

      // Busca el precio del servicio seleccionado
      const servicio = servicios.value.find(s => s.id === servicioSeleccionado.value)
      if (!servicio) {
        throw new Error('No se encontró el servicio seleccionado');
      }

      const amount = Math.round(servicio.precio * 100); // en céntimos
      console.log('Iniciando pago:', { amount, citaId: citaCreada.id });

      // Crear la sesión de Stripe Checkout
      const res = await fetch(`${API_URL}/api/cita/pago`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount,
          citaId: citaCreada.id
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al iniciar el pago');
      }

      const data = await res.json();
      console.log('Sesión de pago creada:', data);

      if (!data.sessionId) {
        throw new Error('No se recibió el ID de sesión de pago');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('No se pudo inicializar Stripe');
      }

      // Redirige a Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      alert(error.message || 'Ocurrió un error durante el proceso de pago');
    }
    return;
  }

  // Si no paga ahora, reserva la cita normalmente
  try {
    const res = await fetch(`${API_URL}/api/cita`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cita)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al crear la cita');
    }

    // Redirige a la página de inicio
    router.push('/');

  } catch (error) {
    console.error('Error al reservar cita:', error);
    alert(error.message || 'Ocurrió un error al reservar la cita');
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