<template>
  <div class="citas-page">
    <div class="overlay"></div>
    <div class="citas-container">
      <v-card class="citas-card" elevation="10" rounded="lg">
        <v-card-title class="text-h4 text-center dm-serif font-italic mb-4">Reservar Cita</v-card-title>
        
        <v-card-text>
          <v-alert
            v-if="errores.general"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
            icon="mdi-alert-circle"
          >
            {{ errores.general }}
          </v-alert>
          
          <v-form @submit.prevent="reservarCita">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="servicioSeleccionado"
                  :items="servicios"
                  item-title="nombre"
                  item-value="id"
                  label="Servicio"
                  variant="outlined"
                  prepend-inner-icon="mdi-content-cut"
                  required
                  bg-color="rgba(43, 43, 43, 0.7)"
                  color="var(--accent-color)"
                  class="mb-1"
                  :error-messages="errores.servicio"
                  @update:model-value="formTouched = true"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="barberoSeleccionado"
                  :items="barberos"
                  item-title="nombre"
                  item-value="id"
                  label="Barbero"
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  required
                  bg-color="rgba(43, 43, 43, 0.7)"
                  color="var(--accent-color)"
                  class="mb-1"
                  :disabled="!Object.keys(horasOcupadasPorBarbero).length === barberos.length && barberos.length > 0"
                  :item-props="item => ({
                    disabled: fechaSeleccionada &&
                      Array.isArray(horasOcupadasPorBarbero[item.id]) &&
                      getHorasDisponibles().filter(h => !(horasOcupadasPorBarbero[item.id]).includes(h)).length === 0
                  })"
                  :error-messages="errores.barbero"
                  @update:model-value="formTouched = true"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="fechaSeleccionada ? formatDate(fechaSeleccionada) : ''"
                  label="Fecha"
                  readonly
                  @click="datePickerDialog = true"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                  bg-color="rgba(43, 43, 43, 0.7)"
                  color="var(--accent-color)"
                  class="mb-1"
                  :error-messages="errores.fecha"
                  @update:model-value="formTouched = true"
                ></v-text-field>
                
                <v-dialog v-model="datePickerDialog" width="auto">
                  <v-date-picker
                    v-model="fechaSeleccionada"
                    :min="new Date().toISOString().split('T')[0]"
                    @update:model-value="datePickerDialog = false; formTouched = true"
                    locale="es"
                    color="var(--accent-color)"
                    class="custom-date-picker"
                    :allowed-dates="isWeekday"
                    :first-day-of-week="1"
                  ></v-date-picker>
                </v-dialog>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="horaSeleccionada"
                  :items="getHorasDisponibles().filter(h => !horasOcupadas.includes(h))"
                  label="Hora"
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-outline"
                  required
                  bg-color="rgba(43, 43, 43, 0.7)"
                  color="var(--accent-color)"
                  class="mb-1"
                  :disabled="!horasOcupadas || !barberoSeleccionado || !fechaSeleccionada"
                  :error-messages="errores.hora"
                  @update:model-value="formTouched = true"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-divider class="my-4"></v-divider>
            
            <v-row>
              <v-col cols="12">
                <v-checkbox
                  v-model="pagarAhora"
                  color="var(--accent-color)"
                  hide-details
                  class="payment-checkbox mb-2"
                >
                  <template v-slot:label>
                    <div class="d-flex align-center">
                      <span>Pagar ahora</span>
                      <v-icon icon="mdi-credit-card" class="ml-2" size="small" color="var(--accent-color)"></v-icon>
                    </div>
                  </template>
                </v-checkbox>
                
                <v-expand-transition>
                  <v-alert
                    v-if="pagarAhora"
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mt-2 payment-alert"
                    icon="mdi-information-outline"
                  >
                    Al seleccionar pago online, no se permite traer invitados.
                  </v-alert>
                </v-expand-transition>
              </v-col>
            </v-row>
            
            <v-slide-y-transition>
              <v-row v-if="puedeInvitar && !mostrarFormularioInvitado && !pagarAhora">
                <v-col cols="12" class="text-center my-4">
                  <v-scale-transition>
                    <v-btn 
                      @click="mostrarFormularioInvitado = true" 
                      color="var(--accent-color)"
                      variant="elevated"
                      prepend-icon="mdi-account-plus"
                      class="invite-button"
                    >
                      ¿Quieres traer a un amigo?
                    </v-btn>
                  </v-scale-transition>
                </v-col>
              </v-row>
            </v-slide-y-transition>

            <v-expand-transition>
              <v-card
                v-if="puedeInvitar && mostrarFormularioInvitado && !pagarAhora"
                class="mt-4 mb-4 pa-4 invite-card"
                variant="outlined"
                border
              >
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h5 dm-serif font-italic">Información del invitado</h3>
                  <v-btn icon="mdi-close" variant="text" @click="mostrarFormularioInvitado = false" class="close-btn"></v-btn>
                </div>
                
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="nombreInvitado"
                      label="Nombre del invitado"
                      variant="outlined"
                      prepend-inner-icon="mdi-account"
                      bg-color="rgba(43, 43, 43, 0.7)"
                      color="var(--accent-color)"
                      :error-messages="errores.nombreInvitado"
                      @update:model-value="invitadoTouched = true"
                    ></v-text-field>
                  </v-col>
                </v-row>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="servicioInvitado"
                      :items="servicios"
                      item-title="nombre"
                      item-value="id"
                      label="Servicio"
                      variant="outlined"
                      prepend-inner-icon="mdi-content-cut"
                      bg-color="rgba(43, 43, 43, 0.7)"
                      color="var(--accent-color)"
                      :error-messages="errores.servicioInvitado"
                      @update:model-value="invitadoTouched = true"
                    ></v-select>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="barberoInvitado"
                      :items="barberos"
                      item-title="nombre"
                      item-value="id"
                      label="Barbero"
                      variant="outlined"
                      prepend-inner-icon="mdi-account"
                      bg-color="rgba(43, 43, 43, 0.7)"
                      color="var(--accent-color)"
                      :error-messages="errores.barberoInvitado"
                      @update:model-value="invitadoTouched = true"
                    ></v-select>
                  </v-col>
                </v-row>
                
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="horaInvitado"
                      :items="getHorasInvitado()"
                      label="Hora"
                      variant="outlined"
                      prepend-inner-icon="mdi-clock-outline"
                      bg-color="rgba(43, 43, 43, 0.7)"
                      color="var(--accent-color)"
                      :error-messages="errores.horaInvitado"
                      @update:model-value="invitadoTouched = true"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-card>
            </v-expand-transition>

            <v-row class="mt-6">
              <v-col cols="12" class="text-center">
                <v-btn 
                  type="submit" 
                  color="var(--accent-color)" 
                  size="large"
                  min-width="200"
                  elevation="3"
                  class="px-6 py-3 reserve-button"
                >
                  <v-icon start>mdi-calendar-check</v-icon>
                  Reservar Cita
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>

  <v-snackbar 
    v-model="snackbar" 
    :timeout="5000" 
    color="success"
    location="top"
    rounded="pill"
  >
    <div class="d-flex align-center">
      <v-icon icon="mdi-check-circle" start class="mr-2"></v-icon>
      <span>{{ snackbarText }}</span>
    </div>
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="snackbar = false"
      >
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted, watch, computed, onActivated, defineComponent } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { API_URL } from '../config'
import { useRouter } from 'vue-router'

defineComponent({
  name: 'Citas'
})

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const pagarAhora = ref(false) 
const servicios = ref([])
const barberos = ref([])
const servicioSeleccionado = ref(null)
const barberoSeleccionado = ref(null)
const fechaSeleccionada = ref(null)
const horaSeleccionada = ref('')
const horasOcupadas = ref([])
const horaInvitado = ref('');
const puedeInvitar = ref(false)
const mostrarFormularioInvitado = ref(false)
const nombreInvitado = ref('')
const servicioInvitado = ref(null)
const barberoInvitado = ref(null)
const horasOcupadasInvitado = ref([]);
const horasOcupadasPorBarbero = ref({});

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const datePickerDialog = ref(false)

const errores = ref({
  servicio: '',
  barbero: '',
  fecha: '',
  hora: '',
  nombreInvitado: '',
  servicioInvitado: '',
  barberoInvitado: '',
  horaInvitado: '',
  general: ''
});

const formTouched = ref(false);
const invitadoTouched = ref(false);

const router = useRouter()

const servicioValido = computed(() => !formTouched.value || !!servicioSeleccionado.value);
const barberoValido = computed(() => !formTouched.value || !!barberoSeleccionado.value);
const fechaValida = computed(() => !formTouched.value || !!fechaSeleccionada.value);
const horaValida = computed(() => !formTouched.value || !!horaSeleccionada.value);

const nombreInvitadoValido = computed(() => !invitadoTouched.value || !mostrarFormularioInvitado.value || !!nombreInvitado.value);
const servicioInvitadoValido = computed(() => !invitadoTouched.value || !mostrarFormularioInvitado.value || !!servicioInvitado.value);
const barberoInvitadoValido = computed(() => !invitadoTouched.value || !mostrarFormularioInvitado.value || !!barberoInvitado.value);
const horaInvitadoValida = computed(() => !invitadoTouched.value || !mostrarFormularioInvitado.value || !!horaInvitado.value);

function mostrarMensaje(mensaje, tipo = 'success') {
  snackbarText.value = mensaje;
  snackbarColor.value = tipo;
  snackbar.value = true;
}

function validarFormulario() {
  formTouched.value = true;
  let esValido = true;
  
  errores.value.servicio = '';
  errores.value.barbero = '';
  errores.value.fecha = '';
  errores.value.hora = '';
  errores.value.general = '';
  
  if (!servicioSeleccionado.value) {
    errores.value.servicio = 'Por favor, selecciona un servicio';
    esValido = false;
  }
  
  if (!barberoSeleccionado.value) {
    errores.value.barbero = 'Por favor, selecciona un barbero';
    esValido = false;
  }
  
  if (!fechaSeleccionada.value) {
    errores.value.fecha = 'Por favor, selecciona una fecha';
    esValido = false;
  }
  
  if (!horaSeleccionada.value) {
    errores.value.hora = 'Por favor, selecciona una hora';
    esValido = false;
  }
  
  return esValido;
}

function validarFormularioInvitado() {
  if (!mostrarFormularioInvitado.value) return true;
  
  invitadoTouched.value = true;
  let esValido = true;
  
  errores.value.nombreInvitado = '';
  errores.value.servicioInvitado = '';
  errores.value.barberoInvitado = '';
  errores.value.horaInvitado = '';
  
  if (!nombreInvitado.value) {
    errores.value.nombreInvitado = 'Por favor, introduce el nombre del invitado';
    esValido = false;
  }
  
  if (!servicioInvitado.value) {
    errores.value.servicioInvitado = 'Por favor, selecciona un servicio para el invitado';
    esValido = false;
  }
  
  if (!barberoInvitado.value) {
    errores.value.barberoInvitado = 'Por favor, selecciona un barbero para el invitado';
    esValido = false;
  }
  
  if (!horaInvitado.value) {
    errores.value.horaInvitado = 'Por favor, selecciona una hora para el invitado';
    esValido = false;
  }
  
  return esValido;
}

function getHorasDisponibles() {
  if (!fechaSeleccionada.value) return [];
  const fecha = new Date(fechaSeleccionada.value);
  const dia = fecha.getDay(); 
  
  let horas = [];
  if (dia >= 1 && dia <= 4) {
    horas = [
      '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
    ];
  } else if (dia === 5) {
    horas = [
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ];
  }
  
  const hoy = new Date();
  if (fecha.toDateString() === hoy.toDateString()) {
    const horaActual = hoy.getHours();
    const minutosActuales = hoy.getMinutes();
    
    return horas.filter(hora => {
      const [h, m] = hora.split(':').map(Number);
      return (h > horaActual) || (h === horaActual && m > minutosActuales);
    });
  }
  
  return horas;
}

function getBarberosDisponibles() {
  if (!fechaSeleccionada.value) return barberos.value;
  return barberos.value;
}

function limpiarFormulario() {
  servicioSeleccionado.value = null;
  barberoSeleccionado.value = null;
  fechaSeleccionada.value = null;
  horaSeleccionada.value = '';
  pagarAhora.value = false;
  
  mostrarFormularioInvitado.value = false;
  nombreInvitado.value = '';
  servicioInvitado.value = null;
  barberoInvitado.value = null;
  horaInvitado.value = '';
  
  errores.value = {
    servicio: '',
    barbero: '',
    fecha: '',
    hora: '',
    nombreInvitado: '',
    servicioInvitado: '',
    barberoInvitado: '',
    horaInvitado: '',
    general: ''
  };
  
  formTouched.value = false;
  invitadoTouched.value = false;
  
}

async function refreshData() {
  
  limpiarFormulario();
  
  if (fechaSeleccionada.value && barberoSeleccionado.value) {
    await cargarHorasOcupadas();
    checkPuedeInvitar();
  }
}

onMounted(async () => {
  try {
    limpiarFormulario();
    
    const resServicios = await fetch(`${API_URL}/api/servicio`, {
      credentials: 'include'
    })
    if (!resServicios.ok) {
      throw new Error('Error al cargar los servicios');
    }
    servicios.value = await resServicios.json()
    
    const resBarberos = await fetch(`${API_URL}/api/barbero`, {
      credentials: 'include'
    })
    if (!resBarberos.ok) {
      throw new Error('Error al cargar los barberos');
    }
    barberos.value = await resBarberos.json()
    
    if (fechaSeleccionada.value) {
      await cargarHorasOcupadas();
    }
  } catch (error) {
    errores.value.general = `Error: ${error.message}`;
  }
})

async function checkPuedeInvitar() {
  if (!barberoSeleccionado.value || !fechaSeleccionada.value || !horaSeleccionada.value || pagarAhora.value) {
    puedeInvitar.value = false
    return
  }

  const fechaObj = new Date(fechaSeleccionada.value);
  const fechaFormateada = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;

  try {
    const params = new URLSearchParams({
      barbero_id: barberoSeleccionado.value,
      fecha: fechaFormateada,
      hora: horaSeleccionada.value
    })
    const res = await fetch(`${API_URL}/api/cita/puede-invitar/check?${params}`, {
      credentials: 'include'
    })
    if (!res.ok) {
      throw new Error('Error al verificar disponibilidad para invitados');
    }
    const data = await res.json()

    puedeInvitar.value = data.puedeInvitar
  } catch (error) {
    errores.value.general = `Error: ${error.message}`;
    puedeInvitar.value = false;
  }
}

watch(puedeInvitar, (esPosible) => {
  if (!esPosible) {
    mostrarFormularioInvitado.value = false;
  }
});

watch(pagarAhora, (valor) => {
  if (valor) {
    puedeInvitar.value = false;
    mostrarFormularioInvitado.value = false;
    nombreInvitado.value = '';
    servicioInvitado.value = null;
    barberoInvitado.value = null;
    horaInvitado.value = '';
  } else {
    checkPuedeInvitar();
  }
});

watch([barberoSeleccionado, fechaSeleccionada], async () => {
  if (!barberoSeleccionado.value || !fechaSeleccionada.value) {
    horasOcupadas.value = [];
    return;
  }
  
  await cargarHorasOcupadas();
  
  horasOcupadas.value = horasOcupadasPorBarbero.value[barberoSeleccionado.value] || [];
  
  checkPuedeInvitar();
});

watch(horaSeleccionada, () => {
  checkPuedeInvitar();
});

watch([barberoInvitado, fechaSeleccionada], async () => {
  if (!barberoInvitado.value || !fechaSeleccionada.value) {
    horasOcupadasInvitado.value = [];
    return;
  }
  if (horasOcupadasPorBarbero.value[barberoInvitado.value]) {
    horasOcupadasInvitado.value = horasOcupadasPorBarbero.value[barberoInvitado.value];
  } else {
    await cargarHorasOcupadas();
  }
});

watch(fechaSeleccionada, async () => {
  if (!fechaSeleccionada.value) {
    horasOcupadasPorBarbero.value = {};
    return;
  }
  
  await cargarHorasOcupadas();
});

async function reservarCita() {
  if (!validarFormulario()) {
    return; 
  }
  
  if (puedeInvitar.value && mostrarFormularioInvitado.value && !pagarAhora.value) {
    if (!validarFormularioInvitado()) {
      return;
    }
  }

  const user_id = localStorage.getItem('user_id');
  if (!user_id) {
    errores.value.general = 'No se encontró la información del usuario. Por favor, inicia sesión nuevamente.';
    return;
  }

  const fechaObj = new Date(fechaSeleccionada.value);
  const fechaFormateada = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;


  const cita = {
    servicio_id: servicioSeleccionado.value,
    barbero_id: barberoSeleccionado.value,
    fecha: fechaFormateada,
    hora: horaSeleccionada.value,
    estado: false,
    pagado: false,
    user_id: parseInt(user_id)
  }

  if (pagarAhora.value) {
    cita.pago_online = true;
  }

  if (
    !pagarAhora.value && 
    puedeInvitar.value &&
    mostrarFormularioInvitado.value
  ) {
    cita.nombre_invitado = nombreInvitado.value;
    cita.servicio_id_invitado = servicioInvitado.value;
    cita.barbero_id_invitado = barberoInvitado.value;
    cita.hora_invitado = horaInvitado.value;
  }

  if (pagarAhora.value) {
    try {
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
      
      if (citaCreada && citaCreada.id) {
        localStorage.setItem('ultima_cita_id', citaCreada.id.toString());
      }

      await cargarHorasOcupadas();

      const servicio = servicios.value.find(s => s.id === servicioSeleccionado.value)
      if (!servicio) {
        throw new Error('No se encontró el servicio seleccionado');
      }

      const amount = Math.round(servicio.precio * 100); 
      
      const citaId = citaCreada.id;
      
      limpiarFormulario();

      const res = await fetch(`${API_URL}/api/cita/pago`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount,
          citaId
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al iniciar el pago');
      }

      const data = await res.json();

      if (!data.sessionId) {
        throw new Error('No se recibió el ID de sesión de pago');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('No se pudo inicializar Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      errores.value.general = `Error en el proceso de pago: ${error.message}`;
    }
    return;
  }

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
    
    const citaCreada = await res.json();
    
    if (citaCreada && citaCreada.id) {
      localStorage.setItem('ultima_cita_id', citaCreada.id.toString());
    }

    await cargarHorasOcupadas();

    limpiarFormulario();

    mostrarMensaje('¡Cita reservada! Revisa tu correo para la confirmación.', 'success');
    setTimeout(() => {
      router.push('/');
    }, 3000); 

  } catch (error) {
    console.error('Error al reservar cita:', error);
    errores.value.general = `Error al reservar cita: ${error.message}`;
  }
}

function getHorasInvitado() {
  if (!horaSeleccionada.value || !barberoInvitado.value) return [];
  const horas = getHorasDisponibles();
  const idx = horas.indexOf(horaSeleccionada.value);

  let opciones = [];
  if (barberoInvitado.value === barberoSeleccionado.value) {
    if (idx > 0) opciones.push(horas[idx - 1]);
    if (idx < horas.length - 1) opciones.push(horas[idx + 1]);
  } else {
    if (idx > 0) opciones.push(horas[idx - 1]);
    opciones.push(horaSeleccionada.value);
    if (idx < horas.length - 1) opciones.push(horas[idx + 1]);
  }

  const ocupadas = horasOcupadasInvitado.value || [];
  return opciones.filter(hora => !ocupadas.includes(hora));
}

function isWeekday(date) {
  const d = new Date(date);
  const day = d.getDay();
  return day !== 0 && day !== 6; 
}

function isWeekend(date) {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; 
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES'); 
}

async function cargarHorasOcupadas() {
  if (!fechaSeleccionada.value) {
    horasOcupadasPorBarbero.value = {};
    return;
  }
  
  try {
    const fechaObj = new Date(fechaSeleccionada.value);
    const fechaFormateada = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;
    
    const ocupadas = {};
    for (const barbero of barberos.value) {
      const res = await fetch(`${API_URL}/api/cita?barbero_id=${barbero.id}&fecha=${fechaFormateada}&_=${new Date().getTime()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (!res.ok) {
        throw new Error(`Error al cargar las horas ocupadas para el barbero ${barbero.nombre}`);
      }
      const citas = await res.json();
      ocupadas[barbero.id] = citas.map(c => {
        if (typeof c.hora === 'string') return c.hora.slice(0,5);
        if (typeof c.hora === 'object' && c.hora !== null) {
          const h = String(c.hora.hours).padStart(2, '0');
          const m = String(c.hora.minutes).padStart(2, '0');
          return `${h}:${m}`;
        }
        return c.hora;
      });
    }
    horasOcupadasPorBarbero.value = ocupadas;
    
    if (barberoSeleccionado.value) {
      horasOcupadas.value = ocupadas[barberoSeleccionado.value] || [];
    }
    
    if (barberoInvitado.value) {
      horasOcupadasInvitado.value = ocupadas[barberoInvitado.value] || [];
    }
    
  } catch (error) {
    console.error('Error al cargar horas ocupadas:', error);
    errores.value.general = `Error: ${error.message}`;
  }
}

onActivated(() => {
  refreshData();
});
</script>

<style scoped>
.citas-page {
  position: relative;
  background-image: url('../assets/imagenHero.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  min-height: 100vh; 
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 2.5rem 0 2rem 0;
  box-sizing: border-box;
  max-width: 100%;
}

.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  pointer-events: none;
}

.citas-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 800px;
  padding: 0 1rem;
  margin-top: 2rem;
}

.citas-card {
  background-color: rgba(43, 43, 43, 0.85) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 224, 9, 0.2);
  padding: 2rem;
}

.reserve-button {
  font-weight: bold !important;
  color: #2B2B2B !important; 
  font-size: 1.1rem !important;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  text-shadow: 0 1px 1px rgba(0,0,0,0.1);
  border: 2px solid rgba(0,0,0,0.1) !important;
}

.invite-button {
  font-weight: bold !important;
  color: #2B2B2B !important; 
  font-size: 1rem !important;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.1) !important;
  animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 rgba(245, 224, 9, 0.4);
  }
  100% {
    box-shadow: 0 0 10px rgba(245, 224, 9, 0.7);
  }
}

.reserve-button:hover, .invite-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.2) !important;
  opacity: 0.95;
  animation: none;
}

.payment-checkbox :deep(.v-selection-control__input) {
  transform: scale(1.1);
}

.payment-checkbox :deep(.v-label) {
  opacity: 1;
}

.payment-alert {
  animation: fadeIn 0.5s ease-out;
}

.invite-card {
  animation: slideIn 0.5s ease-out;
  border-color: var(--accent-color) !important;
}

.close-btn {
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.v-field__input) {
  color: var(--text-color) !important;
}

:deep(.v-label),
.v-text-field :deep(.v-label),
.v-text-field :deep(.v-label.v-label--active),
.v-text-field :deep(.v-label.v-label--focused),
.v-text-field :deep(.v-label.v-label--dirty) {
  color: var(--text-color) !important;
  opacity: 0.9 !important;
}

:deep(.v-field__outline) {
  color: var(--accent-color) !important;
}

:deep(.v-list-item__content) {
  color: var(--text-color) !important;
}

:deep(.v-list) {
  background-color: rgba(43, 43, 43, 0.95) !important;
}

:deep(.v-checkbox .v-label) {
  opacity: 1;
}

:deep(.v-btn) {
  font-weight: bold !important;
  letter-spacing: 1px;
  transition: transform 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-3px);
}

:deep(.v-messages__message) {
  color: #ff5252 !important;
}

.custom-date-picker {
  background: rgba(30, 30, 30, 0.9) !important;
  border-radius: 16px !important;
  border: 1.5px solid rgba(245, 224, 9, 0.18) !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 0.5rem 0.5rem 0.2rem 0.5rem;
  backdrop-filter: blur(8px);
  overflow: visible !important;
}

.custom-date-picker :deep(.v-picker-title),
.custom-date-picker :deep(.v-date-picker-title),
.custom-date-picker :deep(.v-date-picker-header__label) {
  display: none !important;
}

.custom-date-picker :deep(.v-date-picker-header) {
  background: var(--accent-color) !important;
  color: #222 !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  box-shadow: none !important;
  border: none !important;
  overflow: visible !important;
}
.custom-date-picker :deep(.v-date-picker-header .v-icon),
.custom-date-picker :deep(.v-date-picker-header .v-btn),
.custom-date-picker :deep(.v-date-picker-header .v-btn__content) {
  color: #222 !important;
}

.custom-date-picker :deep(.v-date-picker-table) {
  background: rgba(30, 30, 30, 0.85) !important;
  border-radius: 0 0 16px 16px;
}

.custom-date-picker :deep(.v-btn) {
  color: var(--text-color) !important;
  border-radius: 10px !important;
  font-weight: 400;
  font-family: inherit;
  background: transparent !important;
  transition: box-shadow 0.2s, border 0.2s, background 0.2s, color 0.2s;
  box-shadow: none !important;
  border: 2px solid transparent;
}

.custom-date-picker :deep(.v-btn--active),
.custom-date-picker :deep(.v-btn[aria-selected="true"]) {
  background: rgba(245,224,9,0.12) !important;
  color: var(--accent-color) !important;
  border: 2px solid var(--accent-color) !important;
  box-shadow: 0 0 8px 2px rgba(245,224,9,0.18);
}

.custom-date-picker :deep(.v-btn:hover) {
  background: rgba(245, 224, 9, 0.10) !important;
  color: var(--accent-color) !important;
  border: 2px solid var(--accent-color) !important;
}

.custom-date-picker :deep(.v-date-picker-table--date .v-btn--disabled) {
  opacity: 0.45 !important;
  color: #bdbdbd !important;
  background: transparent !important;
  border: 2px solid transparent !important;
}

.custom-date-picker :deep(.v-date-picker-years) {
  background: rgba(30, 30, 30, 0.92) !important;
  color: var(--text-color) !important;
}

.custom-date-picker :deep(.v-date-picker-month__day) {
  font-family: inherit;
}

.custom-date-picker :deep(.v-picker__header) {
  background: var(--accent-color) !important;
  color: #222 !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  box-shadow: none !important;
  border: none !important;
  opacity: 1 !important;
  backdrop-filter: none !important;
  z-index: 1 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}
.custom-date-picker :deep(.v-sheet),
.custom-date-picker :deep(.v-card) {
  background: rgba(30, 30, 30, 0.9) !important;
  border-radius: 16px !important;
  overflow: visible !important;
}

.custom-date-picker :deep(.v-date-picker-table--weekday) {
  margin-left: 24px;
}

:deep(.v-dialog .v-overlay__content > .v-card),
:deep(.v-dialog .v-overlay__content) {
  background-color: rgba(30, 30, 30, 0.9) !important;
}

:deep(.v-overlay__scrim) {
  background-color: rgba(0, 0, 0, 0.8) !important;
  opacity: 1 !important;
}

:deep(.v-overlay__content) {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
}
</style>