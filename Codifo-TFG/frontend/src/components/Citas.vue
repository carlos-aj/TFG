<template>
  <div class="citas-page">
    <div class="overlay"></div>
    <div class="citas-container">
      <v-card class="citas-card" elevation="10" rounded="lg">
        <v-card-title class="text-h4 text-center dm-serif font-italic mb-4">Reservar Cita</v-card-title>
        
        <v-card-text>
          <!-- Mensaje de error general -->
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
            
            <!-- Botón para mostrar el formulario de invitación con animación -->
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

            <!-- Formulario de invitación con animación mejorada -->
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

  <!-- Snackbar solo para mensajes de éxito -->
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
import { ref, onMounted, watch, computed } from 'vue'
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
const mostrarFormularioInvitado = ref(false)
const nombreInvitado = ref('')
const servicioInvitado = ref(null)
const barberoInvitado = ref(null)
const horasOcupadasInvitado = ref([]);
const horasOcupadasPorBarbero = ref({});

// Para el snackbar de confirmación y errores
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// Para el diálogo del date picker
const datePickerDialog = ref(false)

// Para el manejo de validaciones
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

// Estado de validación del formulario
const formTouched = ref(false);
const invitadoTouched = ref(false);

const router = useRouter()

// Validadores computados - Ya no los usamos para :error
const servicioValido = computed(() => !formTouched.value || !!servicioSeleccionado.value);
const barberoValido = computed(() => !formTouched.value || !!barberoSeleccionado.value);
const fechaValida = computed(() => !formTouched.value || !!fechaSeleccionada.value);
const horaValida = computed(() => !formTouched.value || !!horaSeleccionada.value);

const nombreInvitadoValido = computed(() => !invitadoTouched.value || !mostrarFormularioInvitado.value || !!nombreInvitado.value);
const servicioInvitadoValido = computed(() => !invitadoTouched.value || !mostrarFormularioInvitado.value || !!servicioInvitado.value);
const barberoInvitadoValido = computed(() => !invitadoTouched.value || !mostrarFormularioInvitado.value || !!barberoInvitado.value);
const horaInvitadoValida = computed(() => !invitadoTouched.value || !mostrarFormularioInvitado.value || !!horaInvitado.value);

// Función para mostrar mensajes en el snackbar
function mostrarMensaje(mensaje, tipo = 'success') {
  snackbarText.value = mensaje;
  snackbarColor.value = tipo;
  snackbar.value = true;
}

// Función para validar el formulario principal
function validarFormulario() {
  formTouched.value = true;
  let esValido = true;
  
  // Limpiar errores previos
  errores.value.servicio = '';
  errores.value.barbero = '';
  errores.value.fecha = '';
  errores.value.hora = '';
  errores.value.general = '';
  
  // Validar servicio
  if (!servicioSeleccionado.value) {
    errores.value.servicio = 'Por favor, selecciona un servicio';
    esValido = false;
  }
  
  // Validar barbero
  if (!barberoSeleccionado.value) {
    errores.value.barbero = 'Por favor, selecciona un barbero';
    esValido = false;
  }
  
  // Validar fecha
  if (!fechaSeleccionada.value) {
    errores.value.fecha = 'Por favor, selecciona una fecha';
    esValido = false;
  }
  
  // Validar hora
  if (!horaSeleccionada.value) {
    errores.value.hora = 'Por favor, selecciona una hora';
    esValido = false;
  }
  
  return esValido;
}

// Función para validar el formulario de invitado
function validarFormularioInvitado() {
  if (!mostrarFormularioInvitado.value) return true;
  
  invitadoTouched.value = true;
  let esValido = true;
  
  // Limpiar errores previos
  errores.value.nombreInvitado = '';
  errores.value.servicioInvitado = '';
  errores.value.barberoInvitado = '';
  errores.value.horaInvitado = '';
  
  // Validar nombre del invitado
  if (!nombreInvitado.value) {
    errores.value.nombreInvitado = 'Por favor, introduce el nombre del invitado';
    esValido = false;
  }
  
  // Validar servicio del invitado
  if (!servicioInvitado.value) {
    errores.value.servicioInvitado = 'Por favor, selecciona un servicio para el invitado';
    esValido = false;
  }
  
  // Validar barbero del invitado
  if (!barberoInvitado.value) {
    errores.value.barberoInvitado = 'Por favor, selecciona un barbero para el invitado';
    esValido = false;
  }
  
  // Validar hora del invitado
  if (!horaInvitado.value) {
    errores.value.horaInvitado = 'Por favor, selecciona una hora para el invitado';
    esValido = false;
  }
  
  return esValido;
}

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
  try {
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
  } catch (error) {
    errores.value.general = `Error: ${error.message}`;
  }
})

async function checkPuedeInvitar() {
  if (!barberoSeleccionado.value || !fechaSeleccionada.value || !horaSeleccionada.value || pagarAhora.value) {
    puedeInvitar.value = false
    return
  }

  // Formatear la fecha correctamente para evitar problemas de zona horaria
  const fechaObj = new Date(fechaSeleccionada.value);
  const fechaFormateada = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;
  console.log('Fecha seleccionada original en checkPuedeInvitar:', fechaSeleccionada.value);
  console.log('Fecha formateada para consulta en checkPuedeInvitar:', fechaFormateada);

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
    console.log('Respuesta puedeInvitar:', data)

    puedeInvitar.value = data.puedeInvitar
  } catch (error) {
    errores.value.general = `Error: ${error.message}`;
    puedeInvitar.value = false;
  }
}

// Ocultar el formulario de invitado si las condiciones cambian
watch(puedeInvitar, (esPosible) => {
  if (!esPosible) {
    mostrarFormularioInvitado.value = false;
  }
});

// Añadir un watcher para pagarAhora
watch(pagarAhora, (valor) => {
  if (valor) {
    // Si se activa pagarAhora, desactivar la opción de invitados
    puedeInvitar.value = false;
    mostrarFormularioInvitado.value = false;
    // Limpiar datos del invitado
    nombreInvitado.value = '';
    servicioInvitado.value = null;
    barberoInvitado.value = null;
    horaInvitado.value = '';
  } else {
    // Si se desactiva pagarAhora, verificar si puede invitar
    checkPuedeInvitar();
  }
});

watch([barberoSeleccionado, fechaSeleccionada], () => {
  checkPuedeInvitar();
});

watch([barberoSeleccionado, fechaSeleccionada], async () => {
  if (!barberoSeleccionado.value || !fechaSeleccionada.value) {
    horasOcupadas.value = [];
    return;
  }
  try {
    const fechaFormateada = new Date(fechaSeleccionada.value).toISOString().split('T')[0];
    const res = await fetch(`${API_URL}/api/cita?barbero_id=${barberoSeleccionado.value}&fecha=${fechaFormateada}`, {
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Error al cargar las horas ocupadas');
    }
    const citas = await res.json();
    // Normaliza a formato HH:mm
    horasOcupadas.value = citas.map(c => c.hora.slice(0,5));
  } catch (error) {
    errores.value.general = `Error: ${error.message}`;
  }
});

watch([barberoInvitado, fechaSeleccionada], async () => {
  if (!barberoInvitado.value || !fechaSeleccionada.value) {
    horasOcupadasInvitado.value = [];
    return;
  }
  try {
    const fechaFormateada = new Date(fechaSeleccionada.value).toISOString().split('T')[0];
    const res = await fetch(`${API_URL}/api/cita?barbero_id=${barberoInvitado.value}&fecha=${fechaFormateada}`, {
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Error al cargar las horas ocupadas para el invitado');
    }
    const citas = await res.json();
    horasOcupadasInvitado.value = citas.map(c => c.hora.slice(0,5));
  } catch (error) {
    errores.value.general = `Error: ${error.message}`;
  }
});

watch(fechaSeleccionada, async () => {
  if (!fechaSeleccionada.value) {
    horasOcupadasPorBarbero.value = {};
    return;
  }
  
  try {
    // Formatear la fecha correctamente para evitar problemas de zona horaria
    const fechaObj = new Date(fechaSeleccionada.value);
    const fechaFormateada = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;
    console.log('Fecha seleccionada original en watch:', fechaSeleccionada.value);
    console.log('Fecha formateada para consulta en watch:', fechaFormateada);
    
    const ocupadas = {};
    for (const barbero of barberos.value) {
      const res = await fetch(`${API_URL}/api/cita?barbero_id=${barbero.id}&fecha=${fechaFormateada}`, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`Error al cargar las horas ocupadas para el barbero ${barbero.nombre}`);
      }
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
  } catch (error) {
    errores.value.general = `Error: ${error.message}`;
  }
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
  // Validar el formulario principal
  if (!validarFormulario()) {
    return; // Solo muestra los errores bajo cada campo, sin snackbar
  }
  
  // Validar el formulario de invitado si está visible
  if (puedeInvitar.value && mostrarFormularioInvitado.value && !pagarAhora.value) {
    if (!validarFormularioInvitado()) {
      return; // Solo muestra los errores bajo cada campo, sin snackbar
    }
  }

  const user_id = localStorage.getItem('user_id');
  if (!user_id) {
    errores.value.general = 'No se encontró la información del usuario. Por favor, inicia sesión nuevamente.';
    return;
  }

  // El backend espera la fecha en formato YYYY-MM-DD.
  // v-date-picker puede devolver un objeto Date o un string ISO, así que lo formateamos.
  const fechaObj = new Date(fechaSeleccionada.value);
  // Formatear la fecha correctamente para evitar problemas de zona horaria
  const fechaFormateada = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;
  console.log('Fecha seleccionada original:', fechaSeleccionada.value);
  console.log('Fecha formateada para el backend:', fechaFormateada);

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

  // Añadir información del invitado si corresponde
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

  // Si el usuario quiere pagar ahora, inicia Stripe Checkout
  if (pagarAhora.value) {
    try {
      // Primero crear la cita
      console.log('DEBUG: Datos de la cita a enviar (pago online):', JSON.stringify(cita, null, 2));
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
      
      // Guardar el ID de la cita en localStorage para recuperarlo en CitaExito.vue
      if (citaCreada && citaCreada.id) {
        localStorage.setItem('ultima_cita_id', citaCreada.id.toString());
        console.log('ID de cita guardado en localStorage:', citaCreada.id);
      }

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
      errores.value.general = `Error en el proceso de pago: ${error.message}`;
    }
    return;
  }

  // Si no paga ahora, reserva la cita normalmente
  try {
    console.log('DEBUG: Datos de la cita a enviar (sin pago):', JSON.stringify(cita, null, 2));
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
    console.log('Cita creada (sin pago):', citaCreada);
    
    // Guardar el ID de la cita en localStorage para recuperarlo si es necesario
    if (citaCreada && citaCreada.id) {
      localStorage.setItem('ultima_cita_id', citaCreada.id.toString());
      console.log('ID de cita guardado en localStorage:', citaCreada.id);
    }

    // Muestra mensaje de éxito y redirige
    mostrarMensaje('¡Cita reservada! Revisa tu correo para la confirmación.', 'success');
    setTimeout(() => {
      router.push('/');
    }, 3000); // Redirige después de 3 segundos

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

function isWeekday(date) {
  const d = new Date(date);
  const day = d.getDay();
  return day !== 0 && day !== 6; // 0 = domingo, 6 = sábado
}

function isWeekend(date) {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = domingo, 6 = sábado
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES'); // Format as DD/MM/YYYY
}
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
  color: #2B2B2B !important; /* Color oscuro para el texto */
  font-size: 1.1rem !important;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  text-shadow: 0 1px 1px rgba(0,0,0,0.1);
  border: 2px solid rgba(0,0,0,0.1) !important;
}

.invite-button {
  font-weight: bold !important;
  color: #2B2B2B !important; /* Color oscuro para el texto */
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