<template>
  <div class="mes-completo">
    <h1>Calendario de Citas</h1>
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
            {{ citasPorDia[day] || 0 }}/16
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const citas = ref([])
const loading = ref(true)
const error = ref('')
const rol = localStorage.getItem('role')
const barbero_id = localStorage.getItem('barbero_id')

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
    const res = await fetch('http://localhost:3000/api/cita')
    if (!res.ok) throw new Error('Error al cargar citas')
    const data = await res.json()
    citas.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const citasFiltradas = computed(() => {
  let filtradas = citas.value.filter(c => {
    // Solo citas del mes y año actual
    if (!c.fecha) return false
    const [cYear, cMonth] = c.fecha.split('-')
    if (parseInt(cYear) !== year.value || parseInt(cMonth) !== month.value + 1) return false
    // Si es empleado, solo sus citas
    if (rol === 'empleado' && barbero_id) {
      return String(c.barbero_id) === String(barbero_id)
    }
    return true
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
  const fechaStr = `${year.value}-${monthString.value}-${String(selectedDay.value).padStart(2, '0')}`
  return citasFiltradas.value.filter(c => c.fecha && c.fecha.slice(0, 10) === fechaStr)
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
</script>

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
</style>