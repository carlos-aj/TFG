<script setup>
import { ref, onMounted, computed } from 'vue'
import { API_URL } from '../config'
import { gsap } from 'gsap'

const citas = ref([])
const usuarios = ref([])
const barberos = ref([])
const servicios = ref([])
const loading = ref(true)
const error = ref('')
const rol = localStorage.getItem('role')
const user_id = localStorage.getItem('user_id')
const nombre = localStorage.getItem('nombre')
const empleadoBarberoId = ref(null)
const barbero_id = localStorage.getItem('barbero_id')
const selectedBarbero = ref(null)
const showBarberoSelector = ref(false)

// IMPORTANTE: Forzar la fecha a 12 de junio de 2025 para depuración
// const fechaActual = new Date();
const fechaActual = new Date('2025-06-12T12:00:00');
console.log('[DEBUG FECHAS] Fecha actual como objeto Date:', fechaActual);
console.log('[DEBUG FECHAS] Fecha actual como ISO string:', fechaActual.toISOString());
console.log('[DEBUG FECHAS] Fecha actual local:', `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(fechaActual.getDate()).padStart(2, '0')}`);
console.log('[DEBUG FECHAS] Fecha actual con toLocaleDateString:', fechaActual.toLocaleDateString());

// Probar diferentes formas de obtener la fecha actual
const fechaISO = fechaActual.toISOString().split('T')[0];
console.log('[DEBUG FECHAS] Fecha actual como ISO string partido:', fechaISO);

// CORRECCIÓN: Usar la fecha actual sin ajustes
// Si hoy es 12 de junio de 2025, usamos esa fecha directamente
const hoy = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(fechaActual.getDate()).padStart(2, '0')}`;
console.log('[DEBUG FECHAS] Fecha HOY corregida:', hoy);

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
    barberos.value = await resBarberos.json();
    
    // Si el usuario es empleado/barbero, verificar si tiene un barbero asignado
    if (rol === 'empleado' || rol === 'barbero') {
      if (empleadoBarberoId.value) {
        // Verificar que el barbero existe
        const barberoExiste = barberos.value.find(b => b.id === Number(empleadoBarberoId.value));
        if (!barberoExiste) {
          console.log(`El barbero_id ${empleadoBarberoId.value} no existe en la lista de barberos`);
          showBarberoSelector.value = true;
        }
      } else if (nombre) {
        // Buscar por nombre si no hay barbero_id guardado
        const barberoCorrespondiente = barberos.value.find(
          b => b.nombre.toLowerCase().includes(nombre.toLowerCase()) || nombre.toLowerCase().includes(b.nombre.toLowerCase())
        );
        
        if (barberoCorrespondiente) {
          console.log(`Empleado ${nombre} asociado automáticamente con barbero ${barberoCorrespondiente.nombre} (ID: ${barberoCorrespondiente.id})`);
          empleadoBarberoId.value = barberoCorrespondiente.id;
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
    await cargarCitas();
    
    // Animar las filas de la tabla de citas
    setTimeout(() => {
      gsap.from('.cita-row', {
        opacity: 0,
        y: 15,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out'
      });
    }, 500);
    
    // Logs adicionales para depurar
    console.log('[DEBUG FECHAS] Fecha actual completa:', new Date());
    console.log('[DEBUG FECHAS] Fecha actual ISO:', new Date().toISOString());
    console.log('[DEBUG FECHAS] Fecha actual local:', new Date().toLocaleDateString());
    console.log('[DEBUG FECHAS] Fecha HOY que se usa para filtrar:', hoy);
    console.log('[DEBUG FECHAS] Citas cargadas:', citas.value.length);
    console.log('[DEBUG FECHAS] Citas filtradas para hoy:', citasFiltradas.value.length);
    
    // Cargar usuarios solo si es admin
    if (rol === 'admin') {
      try {
        const resUsuarios = await fetch(`${API_URL}/api/user`, {
          credentials: 'include'
        })
        if (resUsuarios.ok) {
          usuarios.value = await resUsuarios.json()
        } else {
          console.log('No se pudieron cargar los usuarios - acceso restringido')
          usuarios.value = []
        }
      } catch (e) {
        console.error('Error al cargar usuarios:', e)
        usuarios.value = []
      }
    } else {
      usuarios.value = []
    }

    // Cargar servicios
    const resServicios = await fetch(`${API_URL}/api/servicio`, {
      credentials: 'include'
    })
    servicios.value = await resServicios.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

async function cargarCitas() {
  try {
    loading.value = true;
    
    // Construir la URL base
    let citasUrl = `${API_URL}/api/cita`;
    const params = new URLSearchParams();
    
    // Añadir el barbero_id si es empleado
    if (rol === 'empleado' && empleadoBarberoId.value) {
      params.append('barbero_id', empleadoBarberoId.value.toString());
      console.log(`[DEBUG FECHAS] Filtrando citas para barbero_id: ${empleadoBarberoId.value}`);
    }
    
    // Añadir la fecha actual como fecha_inicio y fecha_fin
    params.append('fecha_inicio', hoy);
    params.append('fecha_fin', hoy);
    console.log(`[DEBUG FECHAS] Filtrando citas para fecha: ${hoy}`);
    
    // Añadir los parámetros a la URL
    if (params.toString()) {
      citasUrl += `?${params.toString()}`;
    }
    
    console.log(`[DEBUG FECHAS] URL completa: ${citasUrl}`);
    
    const res = await fetch(citasUrl, {
      credentials: 'include'
    });
    
    if (!res.ok) {
      console.error(`[DEBUG FECHAS] Error al cargar citas: ${res.status} ${res.statusText}`);
      throw new Error('Error al cargar citas');
    }
    
    citas.value = await res.json();
    console.log(`[DEBUG FECHAS] Citas cargadas: ${citas.value.length}`);
    
    // Mostrar las fechas de las citas para depuración
    citas.value.forEach(c => {
      if (c.fecha) {
        console.log(`[DEBUG FECHAS] Cita ID ${c.id}, fecha: ${c.fecha.slice(0, 10)}, barbero_id: ${c.barbero_id}`);
      }
    });
  } catch (e) {
    console.error('Error al cargar citas:', e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function seleccionarBarbero() {
  if (!selectedBarbero.value) {
    alert('Por favor, selecciona un barbero');
    return;
  }
  
  empleadoBarberoId.value = Number(selectedBarbero.value);
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
  await cargarCitas();
}

// Funciones para obtener nombres por id
function getNombreUsuario(id) {
  // Si no tenemos acceso a la lista de usuarios o está vacía
  if (!usuarios.value || !Array.isArray(usuarios.value) || usuarios.value.length === 0) {
    return `Cliente #${id}`
  }
  const u = usuarios.value.find(u => u.id === id)
  return u ? u.nombre : `Cliente #${id}`
}
function getNombreBarbero(id) {
  if (!barberos.value || !Array.isArray(barberos.value) || barberos.value.length === 0) {
    return `Barbero #${id}`
  }
  const b = barberos.value.find(b => b.id === id)
  return b ? b.nombre : `Barbero #${id}`
}
function getNombreServicio(id) {
  if (!servicios.value || !Array.isArray(servicios.value) || servicios.value.length === 0) {
    return `Servicio #${id}`
  }
  const s = servicios.value.find(s => s.id === id)
  return s ? s.nombre : `Servicio #${id}`
}

const citasFiltradas = computed(() => {
  // Asegurarse de que citas.value es un array
  if (!citas.value || !Array.isArray(citas.value)) {
    return [];
  }
  
  console.log(`[DEBUG FECHAS] Total citas cargadas: ${citas.value.length}`);
  
  // CORRECCIÓN: Ya no filtramos por fecha en el cliente, confiamos en el servidor
  // Solo filtramos por barbero si es necesario
  let filtradas = citas.value;
  
  // Si es empleado y tenemos el barbero correspondiente, filtrar por ese barbero
  if (rol === 'empleado' && empleadoBarberoId.value) {
    console.log(`[DEBUG FECHAS] Filtrando citas para barbero_id: ${empleadoBarberoId.value}`);
    filtradas = filtradas.filter(c => c.barbero_id === empleadoBarberoId.value);
    console.log(`[DEBUG FECHAS] Citas finales después de filtrar por barbero: ${filtradas.length}`);
  }
  
  return filtradas;
})

async function toggleEstado(cita) {
  const nuevoEstado = !cita.estado;
  try {
    const res = await fetch(`${API_URL}/api/cita/${cita.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (res.ok) {
      cita.estado = nuevoEstado;
    } else {
      alert('Error al actualizar el estado');
    }
  } catch (e) {
    alert('Error de red al actualizar el estado');
  }
}

async function sancionarUsuario(userId) {
  // Solo permitir a administradores sancionar
  if (rol !== 'admin') {
    alert('Solo los administradores pueden sancionar usuarios');
    return;
  }
  
  if (!confirm('¿Seguro que quieres sancionar a este usuario?')) return;
  try {
    const res = await fetch(`${API_URL}/api/user/${userId}/sancionar`, {
      method: 'POST',
      credentials: 'include'
    });
    if (res.ok) {
      alert('Usuario sancionado');
      // Opcional: recargar usuarios para ver la penalización actualizada
      const resUsuarios = await fetch(`${API_URL}/api/user`, {
        credentials: 'include'
      });
      usuarios.value = await resUsuarios.json();
    } else {
      alert('Error al sancionar usuario');
    }
  } catch (e) {
    alert('Error de red al sancionar usuario');
  }
}
</script>

<template>
  <div class="citas-admin-page">
    <v-container class="citas-admin-container px-4 px-sm-6 px-md-8">
      <v-row>
        <v-col cols="12" class="text-center mb-4">
          <h1 class="primary-title fade-in">CITAS DEL DÍA</h1>
          <div class="title-underline mx-auto fade-in"></div>
        </v-col>
      </v-row>

      <v-row v-if="loading" justify="center">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="accent" size="64"></v-progress-circular>
          <div class="mt-4">Cargando citas...</div>
        </v-col>
      </v-row>

      <v-row v-else-if="error">
        <v-col cols="12">
          <v-alert type="error" variant="tonal" class="fade-in">{{ error }}</v-alert>
        </v-col>
      </v-row>

      <template v-else>
        <!-- Selector de barbero para empleados -->
        <v-row v-if="rol === 'empleado' && showBarberoSelector">
          <v-col cols="12" sm="10" md="8" lg="6" class="mx-auto">
            <v-card class="mb-6 fade-in">
              <v-card-title class="text-h5 py-4 px-6">
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

        <!-- Mensaje de advertencia -->
        <v-row v-else-if="rol === 'empleado' && !empleadoBarberoId">
          <v-col cols="12" sm="10" md="8" class="mx-auto">
            <v-alert 
              type="warning"
              variant="tonal"
              class="mb-6 fade-in"
            >
              No se encontró un barbero correspondiente para ti. Contacta con el administrador.
            </v-alert>
          </v-col>
        </v-row>

        <!-- Contenido principal de citas -->
        <template v-else>
          <!-- Resumen de estadísticas -->
          <v-row class="mb-6">
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card fade-in">
                <v-card-text class="d-flex align-center">
                  <v-icon icon="mdi-calendar-check" size="large" color="accent" class="mr-4"></v-icon>
                  <div>
                    <div class="text-h5 font-weight-bold">{{ citasFiltradas.length }}</div>
                    <div class="text-caption text-medium-emphasis">Citas totales</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card fade-in">
                <v-card-text class="d-flex align-center">
                  <v-icon icon="mdi-check-circle" size="large" color="success" class="mr-4"></v-icon>
                  <div>
                    <div class="text-h5 font-weight-bold">{{ citasFiltradas.filter(c => c.estado).length }}</div>
                    <div class="text-caption text-medium-emphasis">Citas completadas</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card fade-in">
                <v-card-text class="d-flex align-center">
                  <v-icon icon="mdi-clock-outline" size="large" color="info" class="mr-4"></v-icon>
                  <div>
                    <div class="text-h5 font-weight-bold">{{ citasFiltradas.filter(c => !c.estado).length }}</div>
                    <div class="text-caption text-medium-emphasis">Citas pendientes</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card fade-in">
                <v-card-text class="d-flex align-center">
                  <v-icon icon="mdi-cash-multiple" size="large" color="warning" class="mr-4"></v-icon>
                  <div>
                    <div class="text-h5 font-weight-bold">{{ citasFiltradas.filter(c => c.pagado).length }}</div>
                    <div class="text-caption text-medium-emphasis">Citas pagadas</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Tabla de citas -->
          <v-row>
            <v-col cols="12">
              <v-card class="mb-6 fade-in">
                <v-card-title class="text-h5 py-4 px-6 d-flex align-center">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-calendar-text" size="large" color="accent" class="mr-3"></v-icon>
                    <span>Lista de Citas</span>
                    <v-chip class="ml-4" color="accent" size="small">{{ citasFiltradas.length }}</v-chip>
                  </div>
                </v-card-title>
                
                <v-card-text v-if="citasFiltradas.length">
                  <div class="table-responsive">
                    <v-table density="compact" hover>
                      <thead>
                        <tr>
                          <th class="text-left">Cliente</th>
                          <th class="text-left">Barbero</th>
                          <th class="text-left">Servicio</th>
                          <th class="text-center">Hora</th>
                          <th class="text-center">Estado</th>
                          <th class="text-center">Pagado</th>
                          <th v-if="rol === 'admin'" class="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(cita, index) in citasFiltradas" :key="cita.id" class="cita-row">
                          <td>
                            <template v-if="cita.nombre_invitado">
                              {{ cita.nombre_invitado }} <v-chip size="x-small" color="primary" class="ml-1">Invitado</v-chip>
                            </template>
                            <template v-else>
                              {{ getNombreUsuario(cita.user_id) }}
                            </template>
                          </td>
                          <td>{{ getNombreBarbero(cita.barbero_id) }}</td>
                          <td>{{ getNombreServicio(cita.servicio_id) }}</td>
                          <td class="text-center font-weight-medium">{{ cita.hora }}</td>
                          <td class="text-center">
                            <v-switch
                              v-model="cita.estado"
                              color="success"
                              hide-details
                              density="compact"
                              @change="toggleEstado(cita)"
                              class="d-inline-block"
                            ></v-switch>
                          </td>
                          <td class="text-center">
                            <v-chip
                              :color="cita.pagado ? 'success' : 'error'"
                              size="small"
                              variant="outlined"
                              :text="cita.pagado ? 'Sí' : 'No'"
                              class="font-weight-medium"
                            ></v-chip>
                          </td>
                          <td v-if="rol === 'admin'" class="text-center">
                            <v-tooltip text="Sancionar usuario">
                              <template v-slot:activator="{ props }">
                                <v-btn
                                  v-if="cita.user_id"
                                  v-bind="props"
                                  @click="sancionarUsuario(cita.user_id)"
                                  color="error"
                                  variant="text"
                                  size="small"
                                  icon="mdi-alert-circle"
                                ></v-btn>
                              </template>
                            </v-tooltip>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                </v-card-text>
                <v-card-text v-else>
                  <v-alert type="info" variant="tonal">
                    No hay citas para hoy.
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.citas-admin-page {
  background: linear-gradient(135deg, #1a1a1a 0%, #2B2B2B 50%, #333333 100%);
  color: #D9D9D9;
  padding: 2.5rem 0 2rem 0;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1;
}

.citas-admin-page::before {
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

.citas-admin-container {
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
  border-radius: 8px;
}

:deep(.v-table .v-table__wrapper > table > thead > tr > th) {
  color: #F5E009 !important;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.5rem 1rem;
  border-bottom: 2px solid rgba(245, 224, 9, 0.2);
}

:deep(.v-table .v-table__wrapper > table > tbody > tr:hover) {
  background-color: rgba(245, 224, 9, 0.1) !important;
}

:deep(.v-table .v-table__wrapper > table > tbody > tr > td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
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

/* Responsive adjustments */
@media (max-width: 960px) {
  .primary-title {
    font-size: 2.5rem !important;
  }
}

@media (max-width: 600px) {
  .citas-admin-page {
    padding: 2.5rem 1rem 2rem 1rem;
  }
  
  .primary-title {
    font-size: 2rem !important;
  }
}

.table-responsive {
  overflow-x: auto;
}

:deep(.v-chip.v-chip--size-small) {
  font-size: 0.75rem;
}

.stat-card {
  background-color: rgba(60, 60, 60, 0.7) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #D9D9D9 !important;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.4);
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.cita-row {
  transition: all 0.3s ease;
}

.cita-row:hover {
  background-color: rgba(245, 224, 9, 0.1);
}
</style>