<template>
  <div class="empleados-page">
    <v-container class="empleados-container px-4 px-sm-6 px-md-8">
      <v-row>
        <v-col cols="12" class="text-center mb-4">
          <h1 class="primary-title fade-in">GESTIÓN DE EMPLEADOS</h1>
          <div class="title-underline mx-auto fade-in"></div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="d-flex justify-end mb-4">
          <v-btn 
            color="accent" 
            @click="showStats = true; cargarEstadisticas()"
            class="font-weight-bold stats-btn"
            prepend-icon="mdi-chart-bar"
          >
            Ver estadísticas
          </v-btn>
        </v-col>
      </v-row>

      <!-- Debug info -->
      <v-row v-if="barberos.length === 0">
        <v-col cols="12">
          <v-alert type="info" variant="tonal" class="fade-in">
            Cargando datos de empleados...
          </v-alert>
        </v-col>
      </v-row>

      <!-- Lista de empleados -->
      <v-card class="mb-8 fade-in">
        <v-card-title class="text-h5 py-4 px-6">
          Lista de Empleados ({{ barberos.length }})
        </v-card-title>
        
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Nombre</th>
                <th class="text-left">Especialidad</th>
                <th class="text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(barbero, index) in paginatedBarberos" :key="barbero.id" class="table-row">
                <td v-if="editId !== barbero.id">{{ barbero.nombre }}</td>
                <td v-else>
                  <v-text-field 
                    v-model="editForm.nombre" 
                    variant="outlined" 
                    density="compact"
                    hide-details
                  ></v-text-field>
                </td>
                
                <td v-if="editId !== barbero.id">{{ barbero.especialidad }}</td>
                <td v-else>
                  <v-text-field 
                    v-model="editForm.especialidad" 
                    variant="outlined" 
                    density="compact"
                    hide-details
                  ></v-text-field>
                </td>
                
                <td>
                  <v-btn 
                    v-if="editId !== barbero.id" 
                    @click="startEdit(barbero)"
                    size="small"
                    color="primary"
                    variant="text"
                    icon="mdi-pencil"
                  ></v-btn>
                  
                  <v-btn 
                    v-else 
                    @click="saveEdit(barbero.id)"
                    size="small"
                    color="success"
                    variant="text"
                    icon="mdi-content-save"
                  ></v-btn>
                  
                  <v-btn 
                    v-if="editId === barbero.id" 
                    @click="cancelEdit"
                    size="small"
                    color="error"
                    variant="text"
                    icon="mdi-close"
                  ></v-btn>
                  
                  <v-btn 
                    @click="eliminarBarbero(barbero.id)"
                    size="small"
                    color="error"
                    variant="text"
                    icon="mdi-delete"
                  ></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          
          <div class="d-flex justify-center align-center mt-4">
            <v-btn 
              :disabled="currentPage === 1" 
              @click="currentPage--"
              variant="text"
              icon="mdi-chevron-left"
            ></v-btn>
            
            <span class="mx-4">Página {{ currentPage }} de {{ totalPages }}</span>
            
            <v-btn 
              :disabled="currentPage === totalPages" 
              @click="currentPage++"
              variant="text"
              icon="mdi-chevron-right"
            ></v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Formulario para crear empleado -->
      <v-card class="fade-in">
        <v-card-title class="text-h5 py-4 px-6">
          Crear Empleado
        </v-card-title>
        
        <v-card-text>
          <div class="form-wrapper">
            <v-form @submit.prevent="crearBarbero" class="form-container">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.nombre"
                    label="Nombre"
                    variant="outlined"
                    required
                    class="form-field"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.especialidad"
                    label="Especialidad"
                    variant="outlined"
                    required
                    class="form-field"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <div class="d-flex justify-end mt-4">
                <v-btn 
                  type="submit"
                  color="accent"
                  class="font-weight-bold form-button mt-4"
                  min-width="120"
                >
                  Crear
                </v-btn>
              </div>
            </v-form>
          </div>
          
          <v-alert
            v-if="mensaje"
            type="success"
            variant="tonal"
            class="mt-4 alert-message"
          >
            {{ mensaje }}
          </v-alert>
          
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-4 alert-message"
          >
            {{ error }}
          </v-alert>
        </v-card-text>
      </v-card>
      
      <!-- Modal de estadísticas -->
      <v-dialog v-model="showStats" max-width="800px">
        <v-card class="stats-card pa-4">
          <v-card-title class="text-h5 mb-2 d-flex justify-space-between align-center">
            <span>Estadísticas de servicios</span>
            <v-btn icon="mdi-close" variant="text" @click="showStats = false"></v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" class="chart-container">
                <h3 class="text-h6 mb-2">Servicios realizados por barbero</h3>
                <GChart type="ColumnChart" :data="serviciosPorBarbero" :options="{ 
                  title: 'Servicios por Barbero',
                  backgroundColor: 'transparent',
                  colors: ['#F5E009'],
                  titleTextStyle: { color: '#D9D9D9' },
                  legendTextStyle: { color: '#D9D9D9' },
                  hAxis: { textStyle: { color: '#D9D9D9' } },
                  vAxis: { textStyle: { color: '#D9D9D9' } },
                  chartArea: { backgroundColor: 'transparent' }
                }" style="width:100%;height:300px;" />
              </v-col>
              
              <v-col cols="12" class="chart-container">
                <h3 class="text-h6 mb-2">Servicios por hora</h3>
                <GChart type="ColumnChart" :data="serviciosPorHora" :options="{ 
                  title: 'Servicios por Hora',
                  backgroundColor: 'transparent',
                  colors: ['#F5E009'],
                  titleTextStyle: { color: '#D9D9D9' },
                  legendTextStyle: { color: '#D9D9D9' },
                  hAxis: { textStyle: { color: '#D9D9D9' } },
                  vAxis: { textStyle: { color: '#D9D9D9' } },
                  chartArea: { backgroundColor: 'transparent' }
                }" style="width:100%;height:300px;" />
              </v-col>
              
              <v-col cols="12" class="chart-container">
                <h3 class="text-h6 mb-2">Servicios por tipo</h3>
                <GChart type="PieChart" :data="serviciosPorTipo" :options="{ 
                  title: 'Servicios por Tipo',
                  backgroundColor: 'transparent',
                  titleTextStyle: { color: '#D9D9D9' },
                  legendTextStyle: { color: '#D9D9D9' },
                  chartArea: { backgroundColor: 'transparent' }
                }" style="width:100%;height:300px;" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { GChart } from 'vue-google-charts'
import { API_URL } from '../config'
import { gsap } from 'gsap'

const citasStats = ref([])
const barberosStats = ref([])

const showStats = ref(false)
const citasPorBarbero = ref([['Barbero', 'Citas']])

const barberos = ref([])
const form = ref({ nombre: '', especialidad: '' })
const mensaje = ref('')
const error = ref('')

const currentPage = ref(1)
const pageSize = ref(5)

const totalPages = computed(() => Math.ceil(barberos.value.length / pageSize.value))
const paginatedBarberos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return barberos.value.slice(start, start + pageSize.value)
})

// Para edición
const editId = ref(null)
const editForm = ref({ nombre: '', especialidad: '' })

// Observar cuando se abre el modal de estadísticas
watch(showStats, (newVal) => {
  if (newVal) {
    // Cargar datos de estadísticas si es necesario
    cargarEstadisticas();
  }
});

async function cargarBarberos() {
  console.log('Iniciando carga de barberos...');
  error.value = '';
  
  try {
    console.log('Realizando petición a la API...');
    const response = await fetch(`${API_URL}/api/barbero`, {
      credentials: 'include'
    });
    
    console.log('Respuesta recibida:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Datos recibidos:', data);
      barberos.value = data;
      
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value || 1;
      }
      
      console.log('Barberos cargados:', barberos.value.length);
      
      // Animar las filas de la tabla después de cargar los datos
      setTimeout(() => {
        animateTableRows();
      }, 100);
    } else {
      console.error('Error en la respuesta:', response.status);
      const errorText = await response.text();
      console.error('Detalle del error:', errorText);
      barberos.value = [];
      error.value = `Error al cargar empleados: ${response.status}`;
    }
  } catch (e) {
    console.error('Excepción al cargar barberos:', e);
    barberos.value = [];
    error.value = `Error de red: ${e.message}`;
  }
}

async function crearBarbero() {
  mensaje.value = ''
  error.value = ''
  try {
    const response = await fetch(`${API_URL}/api/barbero`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (response.ok) {
      mensaje.value = 'Empleado creado correctamente'
      form.value.nombre = ''
      form.value.especialidad = ''
      await cargarBarberos()
      
      // Animación para el mensaje de éxito
      gsap.from('.alert-message', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out'
      })
    } else {
      const data = await response.json()
      error.value = data.message || 'Error al crear empleado'
      
      // Animación para el mensaje de error
      gsap.from('.alert-message', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out'
      })
    }
  } catch (e) {
    error.value = 'Error de red'
    
    // Animación para el mensaje de error
    gsap.from('.alert-message', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    })
  }
}

async function eliminarBarbero(id) {
  if (!confirm('¿Seguro que quieres eliminar este empleado?')) return
  try {
    const response = await fetch(`${API_URL}/api/barbero/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (response.ok) {
      await cargarBarberos()
    } else {
      error.value = 'Error al eliminar empleado'
      
      // Animación para el mensaje de error
      gsap.from('.alert-message', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out'
      })
    }
  } catch {
    error.value = 'Error de red'
    
    // Animación para el mensaje de error
    gsap.from('.alert-message', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    })
  }
}

// Edición
function startEdit(barbero) {
  editId.value = barbero.id
  editForm.value = { nombre: barbero.nombre, especialidad: barbero.especialidad }
  
  // Animar los campos de edición
  setTimeout(() => {
    gsap.from('.v-text-field, .v-select', {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power2.out'
    });
  }, 50);
}

function cancelEdit() {
  editId.value = null
  editForm.value = { nombre: '', especialidad: '' }
}

async function saveEdit(id) {
  try {
    const response = await fetch(`${API_URL}/api/barbero/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    })
    if (response.ok) {
      editId.value = null
      await cargarBarberos()
    } else {
      error.value = 'Error al editar empleado'
      
      // Animación para el mensaje de error
      gsap.from('.alert-message', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out'
      })
    }
  } catch {
    error.value = 'Error de red'
    
    // Animación para el mensaje de error
    gsap.from('.alert-message', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    })
  }
}

const serviciosPorBarbero = computed(() => {
  // { barbero_id: cantidad }
  const counts = {}
  citasStats.value.forEach(c => {
    counts[c.barbero_id] = (counts[c.barbero_id] || 0) + 1
  })
  return [
    ['Barbero', 'Servicios realizados'],
    ...barberosStats.value.map(b => [b.nombre, counts[b.id] || 0])
  ]
})

const serviciosPorHora = computed(() => {
  // { hora: cantidad }
  const counts = {}
  citasStats.value.forEach(c => {
    counts[c.hora] = (counts[c.hora] || 0) + 1
  })
  // Ordena por hora
  const horas = Object.keys(counts).sort()
  return [
    ['Hora', 'Servicios'],
    ...horas.map(h => [h, counts[h]])
  ]
})

const servicios = ref([])
async function cargarServicios() {
  const res = await fetch(`${API_URL}/api/servicio`, { credentials: 'include' })
  servicios.value = res.ok ? await res.json() : []
}
onMounted(cargarServicios)

const serviciosPorTipo = computed(() => {
  const counts = {}
  citasStats.value.forEach(c => {
    counts[c.servicio_id] = (counts[c.servicio_id] || 0) + 1
  })
  return [
    ['Servicio', 'Veces realizado'],
    ...servicios.value.map(s => [s.nombre, counts[s.id] || 0])
  ]
})

async function cargarEstadisticas() {
  // Obtén barberos y citas
  const [barberosRes, citasRes] = await Promise.all([
    fetch(`${API_URL}/api/barbero`, { credentials: 'include' }),
    fetch(`${API_URL}/api/cita`, { credentials: 'include' })
  ])
  barberosStats.value = barberosRes.ok ? await barberosRes.json() : []
  citasStats.value = citasRes.ok ? await citasRes.json() : []
  // No necesitas más aquí, los computed se actualizan solos
}

onMounted(() => {
  // Animaciones iniciales simples sin efectos de scroll
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
  
  gsap.from('.form-wrapper', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.4,
    ease: 'power2.out'
  });
  
  gsap.from('.stats-btn', {
    opacity: 0,
    y: -20,
    duration: 0.8,
    delay: 0.5,
    ease: 'power2.out'
  });
  
  // Cargar datos y animar campos del formulario
  cargarBarberos();
});
</script>

<style scoped>
.empleados-page {
  background: linear-gradient(135deg, #1a1a1a 0%, #2B2B2B 50%, #333333 100%);
  color: #D9D9D9;
  padding: 2.5rem 0 2rem 0;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1;
}

.empleados-page::before {
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

.empleados-container {
  max-width: 1400px !important;
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

.employee-card {
  background-color: rgba(60, 60, 60, 0.7) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #D9D9D9 !important;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.stats-card {
  background-color: rgba(43, 43, 43, 0.95) !important;
  color: #D9D9D9 !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.form-wrapper {
  position: relative;
  width: 100%;
}

.form-container {
  width: 100%;
}

:deep(.v-dialog .v-overlay__content > .v-card),
:deep(.v-dialog .v-overlay__content) {
  background-color: rgba(43, 43, 43, 0.95) !important;
}

:deep(.v-overlay__scrim) {
  background-color: rgba(0, 0, 0, 0.8) !important;
  opacity: 1 !important;
}

:deep(.v-overlay__content) {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
}

:deep(.v-table) {
  background-color: transparent !important;
  color: #D9D9D9;
}

:deep(.v-table .v-table__wrapper > table > thead > tr > th) {
  color: #F5E009 !important;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

:deep(.v-table .v-table__wrapper > table > tbody > tr:hover) {
  background-color: rgba(245, 224, 9, 0.1) !important;
}

:deep(.v-table .v-table__wrapper > table > tbody > tr > td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.v-text-field .v-field__outline__start),
:deep(.v-text-field .v-field__outline__end),
:deep(.v-text-field .v-field__outline__notch) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.v-text-field .v-field__input) {
  color: #D9D9D9 !important;
}

:deep(.v-text-field .v-label) {
  color: #D9D9D9 !important;
  opacity: 0.7;
}

:deep(.v-text-field--focused .v-field__outline__start),
:deep(.v-text-field--focused .v-field__outline__end),
:deep(.v-text-field--focused .v-field__outline__notch) {
  border-color: #F5E009 !important;
}

:deep(.v-btn) {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.chart-container {
  transition: all 0.5s ease;
}

.table-row {
  transition: all 0.3s ease;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .primary-title {
    font-size: 2.5rem !important;
  }
}

@media (max-width: 600px) {
  .empleados-page {
    padding: 2.5rem 1rem 2rem 1rem;
  }
  
  .primary-title {
    font-size: 2rem !important;
  }
}
</style>