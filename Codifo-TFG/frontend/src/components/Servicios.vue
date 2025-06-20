<template>
  <div class="servicios-page">
    <v-container class="servicios-container px-4 px-sm-6 px-md-8">
      <v-row>
        <v-col cols="12" class="text-center mb-4">
          <h1 class="primary-title fade-in">GESTIÓN DE SERVICIOS</h1>
          <div class="title-underline mx-auto fade-in"></div>
        </v-col>
      </v-row>

      <v-card class="mb-8 fade-in">
        <v-card-title class="text-h5 py-4 px-6">
          Lista de Servicios ({{ servicios.length }})
        </v-card-title>
        
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Nombre</th>
                <th class="text-left">Precio (€)</th>
                <th class="text-left">Duración (citas)</th>
                <th class="text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(servicio, index) in paginatedServicios" :key="servicio.id" class="table-row">
                <td v-if="editId !== servicio.id">{{ servicio.nombre }}</td>
                <td v-else>
                  <v-text-field 
                    v-model="editForm.nombre" 
                    variant="outlined" 
                    density="compact"
                    hide-details
                  ></v-text-field>
                </td>
                
                <td v-if="editId !== servicio.id">{{ servicio.precio }} €</td>
                <td v-else>
                  <v-text-field 
                    v-model.number="editForm.precio" 
                    variant="outlined" 
                    density="compact"
                    hide-details
                    type="number"
                    min="0"
                  ></v-text-field>
                </td>
                
                <td v-if="editId !== servicio.id">
                  {{ servicio.duracion }} ({{ servicio.duracion * 30 }} min)
                </td>
                <td v-else>
                  <v-select
                    v-model.number="editForm.duracion"
                    :items="[
                      { value: 1, title: '1 cita (30 min)' },
                      { value: 2, title: '2 citas (1 hora)' },
                      { value: 3, title: '3 citas (1h 30min)' },
                      { value: 4, title: '4 citas (2h)' }
                    ]"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-select>
                </td>
                
                <td>
                  <v-btn 
                    v-if="editId !== servicio.id" 
                    @click="startEdit(servicio)"
                    size="small"
                    color="primary"
                    variant="text"
                    icon="mdi-pencil"
                  ></v-btn>
                  
                  <v-btn 
                    v-else 
                    @click="saveEdit(servicio.id)"
                    size="small"
                    color="success"
                    variant="text"
                    icon="mdi-content-save"
                  ></v-btn>
                  
                  <v-btn 
                    v-if="editId === servicio.id" 
                    @click="cancelEdit"
                    size="small"
                    color="error"
                    variant="text"
                    icon="mdi-close"
                  ></v-btn>
                  
                  <v-btn 
                    @click="eliminarServicio(servicio.id)"
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

      <v-card class="fade-in">
        <v-card-title class="text-h5 py-4 px-6">
          Crear Servicio
        </v-card-title>
        
        <v-card-text>
          <v-form @submit.prevent="crearServicio" class="form-container">
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
                  v-model.number="form.precio"
                  label="Precio (€)"
                  variant="outlined"
                  type="number"
                  min="0"
                  required
                  class="form-field"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model.number="form.duracion"
                  label="Duración"
                  :items="[
                    { value: 1, title: '1 cita (30 min)' },
                    { value: 2, title: '2 citas (1 hora)' },
                    { value: 3, title: '3 citas (1h 30min)' },
                    { value: 4, title: '4 citas (2h)' }
                  ]"
                  variant="outlined"
                  required
                  class="form-field"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" class="d-flex justify-end">
                <v-btn 
                  type="submit" 
                  color="accent"
                  class="font-weight-bold form-button mt-4"
                  min-width="120"
                >
                  Crear
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
          
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

      <!-- Diálogo de confirmación para eliminar -->
      <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
          <v-card-title class="text-h5">Confirmar eliminación</v-card-title>
          <v-card-text>
            ¿Estás seguro de que quieres eliminar este servicio?
            Esta acción no se puede deshacer.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" variant="text" @click="closeDeleteDialog">Cancelar</v-btn>
            <v-btn color="error" variant="text" @click="deleteItemConfirm">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API_URL } from '../config'
import { gsap } from 'gsap'

const servicios = ref([])
const form = ref({ nombre: '', precio: 0, duracion: 1 })
const mensaje = ref('')
const error = ref('')

const editId = ref(null)
const editForm = ref({ nombre: '', precio: 0, duracion: 1 })

const currentPage = ref(1)
const pageSize = ref(5)

const totalPages = computed(() => Math.ceil(servicios.value.length / pageSize.value))
const paginatedServicios = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return servicios.value.slice(start, start + pageSize.value)
})

// Para el diálogo de confirmación
const dialogDelete = ref(false)
const itemToDelete = ref(null)

async function cargarServicios() {
  try {
    const response = await fetch(`${API_URL}/api/servicio`, {
      credentials: 'include'
    })
    if (response.ok) {
      servicios.value = await response.json()
      if (currentPage.value > totalPages.value) currentPage.value = totalPages.value || 1
    } else {
      servicios.value = []
      error.value = 'Error al cargar servicios'
    }
  } catch (e) {
    servicios.value = []
    error.value = `Error de red: ${e.message}`
  }
}

async function crearServicio() {
  mensaje.value = ''
  error.value = ''
  try {
    const response = await fetch(`${API_URL}/api/servicio`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (response.ok) {
      mensaje.value = 'Servicio creado correctamente'
      form.value.nombre = ''
      form.value.precio = 0
      form.value.duracion = 1
      await cargarServicios()
    } else {
      const data = await response.json()
      error.value = data.message || 'Error al crear servicio'
    }
  } catch (e) {
    error.value = 'Error de red'
  }
}

function eliminarServicio(id) {
  itemToDelete.value = id
  dialogDelete.value = true
}

function closeDeleteDialog() {
  dialogDelete.value = false
  itemToDelete.value = null
}

async function deleteItemConfirm() {
  try {
    const response = await fetch(`${API_URL}/api/servicio/${itemToDelete.value}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (response.ok) {
      await cargarServicios()
    } else {
      error.value = 'Error al eliminar servicio'
    }
  } catch {
    error.value = 'Error de red'
  } finally {
    closeDeleteDialog()
  }
}

function startEdit(servicio) {
  editId.value = servicio.id
  editForm.value = { nombre: servicio.nombre, precio: servicio.precio, duracion: servicio.duracion }
}

function cancelEdit() {
  editId.value = null
  editForm.value = { nombre: '', precio: 0, duracion: 1 }
}

async function saveEdit(id) {
  try {
    const response = await fetch(`${API_URL}/api/servicio/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    })
    if (response.ok) {
      editId.value = null
      await cargarServicios()
    } else {
      error.value = 'Error al editar servicio'
    }
  } catch {
    error.value = 'Error de red'
  }
}

onMounted(() => {
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
  
  cargarServicios();
})
</script>

<style scoped>
.servicios-page {
  background: linear-gradient(135deg, #1a1a1a 0%, #2B2B2B 50%, #333333 100%);
  color: #D9D9D9;
  padding: 2.5rem 0 2rem 0;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1;
}

.servicios-page::before {
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

.servicios-container {
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.table-row {
  transition: all 0.3s ease;
}

@media (max-width: 960px) {
  .primary-title {
    font-size: 2.5rem !important;
  }
}

@media (max-width: 600px) {
  .servicios-page {
    padding: 2.5rem 1rem 2rem 1rem;
  }
  
  .primary-title {
    font-size: 2rem !important;
  }
}
</style>