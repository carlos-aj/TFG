<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { API_URL } from '../config'
import { gsap } from 'gsap'

const citas = ref([])
const barberos = ref([])
const loading = ref(true)
const error = ref('')
const rol = localStorage.getItem('role')
const barbero_id = localStorage.getItem('barbero_id')
const user_id = localStorage.getItem('user_id')
const nombre = localStorage.getItem('nombre')
const selectedBarbero = ref(null)
const showBarberoSelector = ref(false)
const showCitasModal = ref(false)

// IMPORTANTE: Forzar la fecha a 12 de junio de 2025 para depuración
// const today = new Date()
const today = new Date('2025-06-12T12:00:00')
const year = ref(today.getFullYear())
const month = ref(today.getMonth()) // 0-indexed
const selectedDay = ref(null)

const daysShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const monthName = computed(() =>
  new Date(year.value, month.value).toLocaleString('es-ES', { month: 'long' })
)
const monthString = computed(() => String(month.value + 1).padStart(2, '0'))

const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  // Lunes = 0, Domingo = 6
  let day = new Date(year.value, month.value, 1).getDay()
  return day === 0 ? 6 : day - 1
})

// Observar cuando se abre el modal de citas
watch(showCitasModal, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      gsap.from('.cita-item', {
        opacity: 0,
        y: 15,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, 100);
  }
});

onMounted(async () => {
  // Animaciones iniciales
  gsap.from('.primary-title', {
    opacity: 0,
    y: -30,
    duration: 0.8,
    ease: 'power2.out'
  });
  
  gsap.from('.title-underline', {
    opacity: 0,
    width: 0,
    duration: 0.8,
    delay: 0.2,
    ease: 'power2.out'
  });
  
  gsap.from('.fade-in', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.3,
    ease: 'back.out(1.7)'
  });
  
  try {
    // Cargar barberos primero para poder asociar el empleado con su barbero
    const resBarberos = await fetch(`${API_URL}/api/barbero`, {
      credentials: 'include'
    });
    const barberosData = await resBarberos.json();
    barberos.value = barberosData;
    
    // Si el usuario es empleado/barbero, verificar si tiene un barbero asignado
    if ((rol === 'empleado' || rol === 'barbero')) {
      if (barbero_id && barbero_id !== '0' && barbero_id !== 'null') {
        // Verificar que el barbero existe
        const barberoExiste = barberosData.find(b => b.id === Number(barbero_id));
        if (!barberoExiste) {
          console.log(`El barbero_id ${barbero_id} no existe en la lista de barberos`);
          showBarberoSelector.value = true;
        }
      } else if (nombre) {
        // Buscar por nombre si no hay barbero_id guardado
        const barberoCorrespondiente = barberosData.find(
          b => b.nombre.toLowerCase().includes(nombre.toLowerCase()) || nombre.toLowerCase().includes(b.nombre.toLowerCase())
        );
        
        if (barberoCorrespondiente) {
          console.log(`Empleado ${nombre} asociado automáticamente con barbero ${barberoCorrespondiente.nombre} (ID: ${barberoCorrespondiente.id})`);
          localStorage.setItem('barbero_id', barberoCorrespondiente.id.toString());
        } else {
          console.log(`No se encontró un barbero correspondiente para el empleado ${nombre}`);
          showBarberoSelector.value = true;
        }
      } else {
        showBarberoSelector.value = true;
      }
    }
    
    // Cargar citas
    await loadCitas();
    
    // Animar los días del calendario
    setTimeout(() => {
      gsap.from('.calendar-day-animate', {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        stagger: 0.01,
        ease: 'back.out(1.7)'
      });
    }, 500);
    
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const loadCitas = async () => {
  try {
    loading.value = true;
    
    // Crear la fecha del primer día del mes
    const primerDia = `${year.value}-${monthString.value}-01`;
    console.log(`[DEBUG FECHAS] Primer día del mes: ${primerDia}`);
    
    // Calcular el último día del mes
    const ultimoDia = new Date(year.value, month.value + 1, 0);
    const ultimoDiaStr = `${year.value}-${monthString.value}-${String(ultimoDia.getDate()).padStart(2, '0')}`;
    console.log(`[DEBUG FECHAS] Último día del mes: ${ultimoDiaStr}`);
    
    // Obtener las citas directamente sin ajustes de fechas
    let data;
    if (rol === 'empleado' && barbero_id) {
      const response = await fetch(`${API_URL}/api/cita?barbero_id=${barbero_id}&fecha_inicio=${primerDia}&fecha_fin=${ultimoDiaStr}`, {
        credentials: 'include'
      });
      console.log(`[DEBUG FECHAS] Obteniendo citas para barbero ${barbero_id} del ${primerDia} al ${ultimoDiaStr}`);
      if (!response.ok) throw new Error('Error al cargar citas');
      data = await response.json();
    } else {
      const response = await fetch(`${API_URL}/api/cita?fecha_inicio=${primerDia}&fecha_fin=${ultimoDiaStr}`, {
        credentials: 'include'
      });
      console.log(`[DEBUG FECHAS] Obteniendo todas las citas del ${primerDia} al ${ultimoDiaStr}`);
      if (!response.ok) throw new Error('Error al cargar citas');
      data = await response.json();
    }
    
    citas.value = data;
    console.log(`[DEBUG FECHAS] Citas obtenidas: ${citas.value.length}`);
    
    // Procesar las citas para el calendario
    processCitasForCalendar();
  } catch (error) {
    console.error('Error al cargar citas:', error);
    error.value = 'Error al cargar las citas';
  } finally {
    loading.value = false;
  }
}

async function seleccionarBarbero() {
  if (!selectedBarbero.value) {
    alert('Por favor, selecciona un barbero');
    return;
  }
  
  localStorage.setItem('barbero_id', selectedBarbero.value.toString());
  
  // Actualizar en la base de datos si es posible
  try {
    const res = await fetch(`${API_URL}/api/user/${user_id}/asignar-barbero-empleado`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barbero_id: Number(selectedBarbero.value) })
    });
    
    if (res.ok) {
      console.log('Barbero asignado correctamente en la base de datos');
    } else {
      console.log('No se pudo actualizar el barbero en la base de datos, pero se guardó localmente');
    }
  } catch (e) {
    console.error('Error al asignar barbero:', e);
  }
  
  showBarberoSelector.value = false;
  await loadCitas();
}

const citasFiltradas = computed(() => {
  console.log(`[DEBUG FECHAS] Filtrando citas para mes: ${month.value + 1}, año: ${year.value}`);
  console.log(`[DEBUG FECHAS] Total citas a filtrar: ${citas.value.length}`);
  
  let filtradas = citas.value.filter(c => {
    // Solo citas del mes y año actual
    if (!c.fecha) {
      console.log(`[DEBUG FECHAS] Ignorando cita sin fecha`);
      return false;
    }
    
    // Obtener el mes y año directamente de la fecha original
    let fechaOriginal;
    try {
      // Intentar obtener la fecha como string
      if (typeof c.fecha === 'string') {
        fechaOriginal = c.fecha.slice(0, 10);
      } else if (c.fecha instanceof Date) {
        // Si es un objeto Date
        fechaOriginal = `${c.fecha.getFullYear()}-${String(c.fecha.getMonth() + 1).padStart(2, '0')}-${String(c.fecha.getDate()).padStart(2, '0')}`;
      } else {
        // Si es otro tipo de dato, convertirlo a string
        fechaOriginal = String(c.fecha);
        console.log(`[DEBUG FECHAS] Formato de fecha desconocido: ${typeof c.fecha}`, c.fecha);
      }
    } catch (e) {
      console.log(`[DEBUG FECHAS] Error al procesar fecha: ${e}`);
      return false;
    }
    
    // Intentar extraer año y mes
    try {
      const fechaParts = fechaOriginal.split('-');
      if (fechaParts.length !== 3) {
        console.log(`[DEBUG FECHAS] Formato de fecha inválido: ${fechaOriginal}`);
        return false;
      }
      
      const anio = parseInt(fechaParts[0]);
      const mes = parseInt(fechaParts[1]);
      
      console.log(`[DEBUG FECHAS] Cita ID ${c.id}, fecha original: ${fechaOriginal}, mes: ${mes}, año: ${anio}`);
      console.log(`[DEBUG FECHAS] Comparando con mes: ${month.value + 1}, año: ${year.value}`);
      
      // Usar la fecha original para filtrar
      const coincide = anio === year.value && mes === month.value + 1;
      console.log(`[DEBUG FECHAS] Coincide: ${coincide}`);
      return coincide;
    } catch (e) {
      console.log(`[DEBUG FECHAS] Error al extraer componentes de fecha: ${e}`);
      return false;
    }
  });
  
  console.log(`[DEBUG FECHAS] Total citas filtradas para este mes: ${filtradas.length}`);
  return filtradas;
})

const citasPorDia = computed(() => {
  const counts = {}
  citasFiltradas.value.forEach(c => {
    const day = parseInt(c.fecha.split('-')[2])
    counts[day] = (counts[day] || 0) + 1
  })
  return counts
})

function isToday(day) {
  return (
    year.value === today.getFullYear() &&
    month.value === today.getMonth() &&
    day === today.getDate()
  )
}

function selectDay(day) {
  selectedDay.value = day
  showCitasModal.value = true
}

function closeCitasModal() {
  showCitasModal.value = false
  selectedDay.value = null
}

const citasDelDia = computed(() => {
  if (!selectedDay.value) return []
  
  // Crear la fecha correctamente sin usar toISOString para evitar problemas de zona horaria
  const fechaStr = `${year.value}-${monthString.value}-${String(selectedDay.value).padStart(2, '0')}`;
  console.log(`[DEBUG FECHAS] Fecha seleccionada: ${fechaStr}`);
  console.log(`[DEBUG FECHAS] Total citas filtradas para el mes: ${citasFiltradas.value.length}`);
  
  // Usar la fecha sin ajustes para filtrar
  const citasDelDiaActual = citasFiltradas.value.filter(c => {
    if (!c.fecha) {
      console.log(`[DEBUG FECHAS] Cita sin fecha`);
      return false;
    }
    
    let fechaCita;
    try {
      // Intentar obtener la fecha como string
      if (typeof c.fecha === 'string') {
        fechaCita = c.fecha.slice(0, 10);
      } else if (c.fecha instanceof Date) {
        // Si es un objeto Date
        fechaCita = `${c.fecha.getFullYear()}-${String(c.fecha.getMonth() + 1).padStart(2, '0')}-${String(c.fecha.getDate()).padStart(2, '0')}`;
      } else {
        // Si es otro tipo de dato, convertirlo a string
        fechaCita = String(c.fecha);
        console.log(`[DEBUG FECHAS] Formato de fecha desconocido: ${typeof c.fecha}`, c.fecha);
      }
    } catch (e) {
      console.log(`[DEBUG FECHAS] Error al procesar fecha: ${e}`);
      return false;
    }
    
    console.log(`[DEBUG FECHAS] Comparando cita ID ${c.id} fecha ${fechaCita} con fecha seleccionada ${fechaStr}`);
    return fechaCita === fechaStr;
  });
  
  console.log(`[DEBUG FECHAS] Encontradas ${citasDelDiaActual.length} citas para el día ${fechaStr}`);
  return citasDelDiaActual;
})

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
  selectedDay.value = null
  loadCitas()
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
  selectedDay.value = null
  loadCitas()
}

function getMaxCitas(day) {
  // day: 1 = lunes, ..., 5 = viernes, 6 = sábado, 0 = domingo
  const date = new Date(year.value, month.value, day);
  const weekday = date.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

  if (weekday === 0 || weekday === 6) return 0; // cerrado

  // Si es admin, multiplica por número de barberos
  if (rol === 'admin') {
    // Puedes guardar el número de barberos en una variable reactiva si lo tienes en la API
    return (weekday === 5 ? 17 : 18) * numBarberos.value;
  }
  // Si es barbero, solo su cupo
  return weekday === 5 ? 17 : 18;
}

// Número de barberos (solo para admin)
const numBarberos = ref(1);
onMounted(async () => {
  if (rol === 'admin') {
    try {
      const res = await fetch(`${API_URL}/api/barbero`, {
        credentials: 'include'
      });
      if (res.ok) {
        const barberos = await res.json();
        numBarberos.value = barberos.length;
      }
    } catch {}
  }
});

const processCitasForCalendar = () => {
  // Esta función se llama después de cargar las citas para hacer cualquier procesamiento adicional
  console.log('[DEBUG FECHAS] Procesando citas para el calendario');
  
  // Aquí podemos hacer cualquier procesamiento adicional de las citas para el calendario
  // Por ejemplo, agrupar por día, etc.
  
  // Por ahora, solo registramos algunas estadísticas
  if (citas.value.length > 0) {
    const diasConCitas = new Set(citas.value.map(c => c.fecha ? c.fecha.slice(0, 10) : null).filter(Boolean));
    console.log(`[DEBUG FECHAS] Citas distribuidas en ${diasConCitas.size} días diferentes`);
    
    // Mostrar la primera cita como ejemplo
    const primeraCita = citas.value[0];
    if (primeraCita && primeraCita.fecha) {
      console.log(`[DEBUG FECHAS] Primera cita: ID ${primeraCita.id}, fecha ${primeraCita.fecha.slice(0, 10)}, hora ${primeraCita.hora}`);
    }
  }
}
</script>

<template>
  <div class="mes-completo-page">
    <v-container class="mes-completo-container px-4 px-sm-6 px-md-8">
      <v-row>
        <v-col cols="12" class="text-center mb-4">
          <h1 class="primary-title fade-in">CALENDARIO DE CITAS</h1>
          <div class="title-underline mx-auto fade-in"></div>
        </v-col>
      </v-row>

      <v-row v-if="loading" justify="center">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="accent" size="64"></v-progress-circular>
          <div class="mt-4">Cargando calendario...</div>
        </v-col>
      </v-row>

      <v-row v-else-if="error">
        <v-col cols="12">
          <v-alert type="error" variant="tonal" class="fade-in">{{ error }}</v-alert>
        </v-col>
      </v-row>

      <v-row v-else-if="showBarberoSelector">
        <v-col cols="12" sm="10" md="8" lg="6" class="mx-auto">
          <v-card class="glass-card fade-in">
            <v-card-title class="text-h5 py-4 px-6">
              <v-icon icon="mdi-account-question" color="accent" class="mr-3"></v-icon>
              Selecciona tu barbero
            </v-card-title>
            <v-card-text>
              <p class="mb-4">No se ha podido determinar automáticamente qué barbero eres. Por favor, selecciona tu barbero de la lista:</p>
              <v-select
                v-model="selectedBarbero"
                :items="barberos.map(b => ({ title: b.nombre, value: b.id }))"
                label="Selecciona un barbero"
                variant="outlined"
                class="mb-4"
              ></v-select>
              <div class="text-center">
                <v-btn 
                  @click="seleccionarBarbero" 
                  color="accent"
                  class="font-weight-bold"
                >
                  Confirmar
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <template v-else>
        <!-- Calendario -->
        <v-row>
          <v-col cols="12">
            <v-card class="glass-card fade-in">
              <v-card-title class="text-h5 py-4 px-6 d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-calendar-month" color="accent" class="mr-3"></v-icon>
                  <span class="text-capitalize">{{ monthName }} {{ year }}</span>
                </div>
                <div>
                  <v-btn icon="mdi-chevron-left" variant="text" @click="prevMonth"></v-btn>
                  <v-btn icon="mdi-chevron-right" variant="text" @click="nextMonth"></v-btn>
                </div>
              </v-card-title>
              
              <v-card-text>
                <div class="calendar-grid">
                  <div class="calendar-day header" v-for="d in daysShort" :key="d">{{ d }}</div>
                  <div
                    v-for="blank in firstDayOfWeek"
                    :key="'blank-' + blank"
                    class="calendar-day blank"
                  ></div>
                  <div
                    v-for="day in daysInMonth"
                    :key="day"
                    class="calendar-day calendar-day-animate"
                    :class="{ 
                      'today': isToday(day), 
                      'cerrado': getMaxCitas(day) === 0,
                      'has-citas': citasPorDia[day] > 0
                    }"
                    @click="getMaxCitas(day) > 0 ? selectDay(day) : null"
                  >
                    <div class="day-number">{{ day }}</div>
                    <div class="citas-count">
                      <template v-if="getMaxCitas(day) > 0">
                        <v-chip size="x-small" :color="citasPorDia[day] ? 'success' : 'info'" variant="tonal">
                          {{ citasPorDia[day] || 0 }} / {{ getMaxCitas(day) }}
                        </v-chip>
                      </template>
                      <template v-else>
                        <v-chip size="x-small" color="error" variant="tonal">Cerrado</v-chip>
                      </template>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Modal de citas del día seleccionado -->
        <v-dialog v-model="showCitasModal" max-width="600px">
          <v-card class="glass-card">
            <v-card-title class="text-h5 py-4 px-6 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-clipboard-text-clock" color="accent" class="mr-3"></v-icon>
                <span>Citas del {{ selectedDay ? selectedDay.toString().padStart(2, '0') : '' }} de {{ monthName }}</span>
              </div>
              <v-btn icon="mdi-close" variant="text" @click="closeCitasModal"></v-btn>
            </v-card-title>
            <v-card-text v-if="citasDelDia.length">
              <v-list class="citas-list">
                <v-list-item
                  v-for="cita in citasDelDia"
                  :key="cita.id"
                  :title="`${cita.hora} - Cliente: ${cita.nombre_invitado || 'Usuario #' + cita.user_id}`"
                  :subtitle="`Barbero: ${cita.barbero_id} - Servicio: ${cita.servicio_id}`"
                  :prepend-icon="cita.estado ? 'mdi-check-circle' : 'mdi-clock-outline'"
                  :color="cita.estado ? 'success' : ''"
                  class="cita-item"
                >
                  <template v-slot:append>
                    <v-chip
                      :color="cita.estado ? 'success' : 'warning'"
                      size="small"
                      variant="outlined"
                    >
                      {{ cita.estado ? 'Atendida' : 'Pendiente' }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-text v-else>
              <v-alert type="info" variant="tonal">
                No hay citas programadas para este día.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-dialog>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.mes-completo-page {
  background: linear-gradient(135deg, #1a1a1a 0%, #2B2B2B 50%, #333333 100%);
  color: #D9D9D9;
  padding: 2.5rem 0 2rem 0;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1;
}

.mes-completo-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="%23333" fill-opacity=".05"/%3E%3C/svg%3E');
  opacity: 0.4;
  z-index: -1;
}

.mes-completo-container {
  max-width: 1200px !important;
  margin: 0 auto !important;
}

.primary-title {
  color: #D9D9D9;
  letter-spacing: 3px;
  margin-bottom: 0.3rem;
  font-size: 3rem !important;
  font-family: 'DM Serif Display', serif;
  font-style: italic;
}

.title-underline {
  width: 100px;
  height: 4px;
  background-color: #F5E009;
  margin-bottom: 1rem;
}

.glass-card {
  background-color: rgba(60, 60, 60, 0.7) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #D9D9D9 !important;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin: 0.5rem 0;
}

.calendar-day {
  background: rgba(80, 80, 80, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.calendar-day:hover:not(.blank):not(.header):not(.cerrado) {
  background: rgba(245, 224, 9, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.calendar-day.today {
  background: rgba(245, 224, 9, 0.15);
  border: 2px solid #F5E009;
}

.calendar-day.has-citas {
  background: rgba(76, 175, 80, 0.1);
}

.calendar-day.header {
  background: rgba(245, 224, 9, 0.2);
  color: #F5E009;
  font-weight: bold;
  border-radius: 8px;
  min-height: 40px;
  cursor: default;
  font-size: 1.1rem;
}

.calendar-day.blank {
  background: transparent;
  border: none;
  cursor: default;
}

.calendar-day.cerrado {
  background: rgba(80, 80, 80, 0.1);
  color: #888;
  cursor: not-allowed;
  opacity: 0.7;
}

.day-number {
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.citas-count {
  font-size: 0.9rem;
  margin-top: auto;
}

:deep(.citas-list) {
  background-color: transparent !important;
  color: #D9D9D9 !important;
}

:deep(.citas-list .v-list-item) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.citas-list .v-list-item:last-child) {
  border-bottom: none;
}

:deep(.v-list-item__prepend > .v-icon) {
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .primary-title {
    font-size: 2.5rem !important;
  }
  
  .calendar-day {
    min-height: 70px;
  }
  
  .day-number {
    font-size: 1.1rem;
  }
}

@media (max-width: 600px) {
  .mes-completo-page {
    padding: 2.5rem 1rem 2rem 1rem;
  }
  
  .primary-title {
    font-size: 2rem !important;
  }
  
  .calendar-day {
    min-height: 60px;
    padding: 4px 2px;
  }
  
  .day-number {
    font-size: 1rem;
    margin-bottom: 4px;
  }
  
  .citas-count {
    font-size: 0.7rem;
  }
}

:deep(.v-overlay__scrim) {
  background-color: rgba(0, 0, 0, 0.8) !important;
  opacity: 1 !important;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.calendar-day-animate {
  transition: all 0.3s ease;
}

.cita-item {
  transition: all 0.3s ease;
}
</style>