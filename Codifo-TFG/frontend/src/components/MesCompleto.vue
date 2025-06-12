<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '../config'

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

const today = new Date()
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

onMounted(async () => {
  try {
    // Cargar barberos primero para poder asociar el empleado con su barbero
    const resBarberos = await fetch(`${API_URL}/api/barbero`, {
      credentials: 'include'
    });
    const barberosData = await resBarberos.json();
    
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
    toast.error('Error al cargar las citas');
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
  let filtradas = citas.value.filter(c => {
    // Solo citas del mes y año actual
    if (!c.fecha) return false
    
    // Obtener el mes y año directamente de la fecha original
    const fechaOriginal = c.fecha.slice(0, 10);
    const anio = parseInt(fechaOriginal.split('-')[0]);
    const mes = parseInt(fechaOriginal.split('-')[1]);
    
    console.log(`[DEBUG FECHAS] Cita ID ${c.id}, fecha original: ${fechaOriginal}, mes: ${mes}, año: ${anio}`);
    console.log(`[DEBUG FECHAS] Comparando con mes: ${month.value + 1}, año: ${year.value}`);
    
    // Usar la fecha original para filtrar
    return anio === year.value && mes === month.value + 1;
  })
  return filtradas
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
}

const citasDelDia = computed(() => {
  if (!selectedDay.value) return []
  
  // Crear la fecha correctamente sin usar toISOString para evitar problemas de zona horaria
  const fechaStr = `${year.value}-${monthString.value}-${String(selectedDay.value).padStart(2, '0')}`;
  console.log(`[DEBUG FECHAS] Fecha seleccionada: ${fechaStr}`);
  
  // Usar la fecha sin ajustes para filtrar
  return citasFiltradas.value.filter(c => {
    if (!c.fecha) return false;
    const fechaCita = c.fecha.slice(0, 10);
    console.log(`[DEBUG FECHAS] Comparando cita fecha ${fechaCita} con fecha seleccionada ${fechaStr}`);
    return fechaCita === fechaStr;
  });
})

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
  selectedDay.value = null
}
function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
  selectedDay.value = null
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
  <div class="mes-completo">
    <h1>Calendario de Citas</h1>
    
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="showBarberoSelector" class="barbero-selector">
      <h2>Selecciona tu barbero</h2>
      <p>No se ha podido determinar automáticamente qué barbero eres. Por favor, selecciona tu barbero de la lista:</p>
      <div class="selector-container">
        <select v-model="selectedBarbero">
          <option :value="null">Selecciona un barbero</option>
          <option v-for="barbero in barberos" :key="barbero.id" :value="barbero.id">
            {{ barbero.nombre }}
          </option>
        </select>
        <button @click="seleccionarBarbero" class="btn-primary">Confirmar</button>
      </div>
    </div>
    <div v-else>
      <div class="calendar">
        <div class="calendar-header">
          <button @click="prevMonth">&lt;</button>
          <span>{{ monthName }} {{ year }}</span>
          <button @click="nextMonth">&gt;</button>
        </div>
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
            class="calendar-day"
            :class="{ today: isToday(day) }"
            @click="selectDay(day)"
          >
            <div>{{ day }}</div>
            <div class="citas-count">
              <template v-if="getMaxCitas(day) > 0">
                {{ citasPorDia[day] || 0 }} / {{ getMaxCitas(day) }}
              </template>
              <template v-else :class="{ today: isToday(day), cerrado: getMaxCitas(day) === 0 }">
                Cerrado
              </template>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedDay" class="citas-list">
        <h2>Citas del {{ year }}-{{ monthString }}-{{ selectedDay.toString().padStart(2, '0') }}</h2>
        <ul v-if="citasDelDia.length">
          <li v-for="cita in citasDelDia" :key="cita.id">
            Cliente: {{ cita.user_id }}, Barbero: {{ cita.barbero_id }}, Servicio: {{ cita.servicio_id }}, Hora: {{ cita.hora }}, Estado: {{ cita.estado ? 'Atendida' : 'Pendiente' }}
          </li>
        </ul>
        <div v-else>No hay citas para este día.</div>
        <button @click="selectedDay = null">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mes-completo {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}
.calendar {
  margin: 20px 0;
}
.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 1.5em;
  margin-bottom: 10px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.calendar-day {
  background: #f5f5f5;
  border: 1px solid #ccc;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1em;
  position: relative;
}
.calendar-day.today {
  background: #ffe066;
  border: 2px solid #f5e009;
}
.calendar-day.header {
  background: #2b2b2b;
  color: #fff;
  font-weight: bold;
  cursor: default;
}
.calendar-day.blank {
  background: transparent;
  border: none;
  cursor: default;
}
.citas-count {
  font-size: 0.9em;
  color: #444;
  margin-top: 4px;
}
.citas-list {
  margin-top: 30px;
  background: #fafafa;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}

.calendar-day.cerrado {
  background: #eee;
  color: #aaa;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.barbero-selector {
  background-color: #e8f5e9;
  padding: 20px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 500px;
}
.selector-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}
select {
  padding: 8px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.btn-primary {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.btn-primary:hover {
  background-color: #1565c0;
}
</style>