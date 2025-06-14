<script setup>
import { ref, onMounted } from 'vue'
import { API_URL } from '../config'
import { gsap } from 'gsap'

const galerias = ref([])
const barberos = ref([])
const limit = ref(8)
const loading = ref(false)
const totalLoaded = ref(false)

const modalOpen = ref(false)
const imagenesModal = ref([])
const galeriaActual = ref(null)

// Admin
const isAdmin = ref(localStorage.getItem('role') === 'admin')
const adminMode = ref(false)
const adminAction = ref('eliminar') // 'eliminar' o 'añadir'
const showAdminMenu = ref(false)
const showAddModal = ref(false)
const selectedGrupos = ref([]) // IDs de grupos seleccionados para eliminar
const newImageFiles = ref([])
const newBarberoId = ref('')
const mezclado = ref(false);
const errorMensaje = ref('');
const mostrarError = ref(false);
const barberoError = ref('');
const imagenesError = ref('');


function getImgUrl(img) {
  if (img.startsWith('http')) return img
  return `${API_URL}/api/galeria/${img}`
}

async function fetchGalerias() {
  loading.value = true
  const res = await fetch(`${API_URL}/api/galeria?limit=${limit.value}`)
  const data = await res.json()
  if (!mezclado.value) {
    galerias.value = shuffleArray(data)
    mezclado.value = true
  } else {
    // Añade solo los que no están ya (por id)
    const existentes = new Set(galerias.value.map(g => g.id))
    const nuevos = data.filter(g => !existentes.has(g.id))
    galerias.value = galerias.value.concat(nuevos)
  }
  totalLoaded.value = data.length < limit.value
  loading.value = false
}

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

async function fetchBarberos() {
  const res = await fetch(`${API_URL}/api/barbero`)
  barberos.value = await res.json()
}

function cargarMas() {
  limit.value += 8
  fetchGalerias()
}

function abrirModal(galeria) {
  galeriaActual.value = galeria
  imagenesModal.value = galeria.imagenes
  modalOpen.value = true
}

function cerrarModal() {
  modalOpen.value = false
  imagenesModal.value = []
  galeriaActual.value = null
}

// --- ADMIN FUNCIONES ---
function abrirAdminMenu() {
  showAdminMenu.value = true
}

function cerrarAdminMenu() {
  showAdminMenu.value = false
}

function seleccionarAccion(accion) {
  adminAction.value = accion
  adminMode.value = true
  showAdminMenu.value = false
  selectedGrupos.value = []
  newImageFiles.value = []
  newBarberoId.value = ''
  if (accion === 'añadir') {
    showAddModal.value = true
  }
}

function desactivarAdmin() {
  adminMode.value = false
  adminAction.value = 'eliminar'
  selectedGrupos.value = []
  newImageFiles.value = []
  newBarberoId.value = ''
  showAddModal.value = false
}

function toggleGrupo(id) {
  const idx = selectedGrupos.value.indexOf(id)
  if (idx === -1) selectedGrupos.value.push(id)
  else selectedGrupos.value.splice(idx, 1)
}

async function eliminarGruposSeleccionados() {
  try {
    await Promise.all(
      selectedGrupos.value.map(id =>
        fetch(`${API_URL}/api/galeria/item/${id}`, { 
          method: 'DELETE',
          credentials: 'include'
        })
      )
    );
    mezclado.value = false;
    await fetchGalerias();
    desactivarAdmin();
  } catch (error) {
    console.error("Error al eliminar grupos:", error);
    errorMensaje.value = "Error al eliminar las imágenes seleccionadas";
    mostrarError.value = true;
    setTimeout(() => {
      mostrarError.value = false;
    }, 4000);
  }
}

function subirImagen(e) {
  const files = Array.from(e.target.files)
  // Validar que solo sean imágenes
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  // Si hay archivos que no son imágenes, mostrar un mensaje
  if (imageFiles.length < files.length) {
    errorMensaje.value = 'Solo se permiten archivos de imagen';
    mostrarError.value = true;
    // Limpiar el input file para que el usuario pueda intentar de nuevo
    e.target.value = ''
    
    // Ocultar el mensaje de error después de 4 segundos
    setTimeout(() => {
      mostrarError.value = false;
    }, 4000);
  }
  
  // Solo procesamos los archivos de imagen
  if (imageFiles.length > 0) {
    // Evita duplicados por nombre (opcional)
    const nombresActuales = new Set(newImageFiles.value.map(f => f.name))
    const nuevos = imageFiles.filter(f => !nombresActuales.has(f.name))
    newImageFiles.value = newImageFiles.value.concat(nuevos)
  }
}

async function guardarNuevaImagen() {
  // Resetear errores
  barberoError.value = '';
  errorMensaje.value = '';
  mostrarError.value = false;
  imagenesError.value = '';
  
  const barbero_id = Number(newBarberoId.value)
  
  // Validación personalizada
  if (!barbero_id) {
    barberoError.value = 'Por favor, selecciona un barbero';
    return;
  }
  
  if (newImageFiles.value.length === 0) {
    imagenesError.value = 'Por favor, selecciona al menos una imagen';
    return;
  }

  const formData = new FormData()
  for (const file of newImageFiles.value) {
    formData.append('imagenes', file)
  }

  const res = await fetch(`${API_URL}/api/galeria/upload`, {
    method: 'POST',
    body: formData
  })
  const { filenames } = await res.json()

  await fetch(`${API_URL}/api/galeria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barbero_id, imagenes: filenames })
  })
  await fetchGalerias()
  desactivarAdmin()
}

function quitarImagen(idx) {
  // Crear una copia del array y eliminar el elemento
  const nuevosArchivos = [...newImageFiles.value];
  nuevosArchivos.splice(idx, 1);
  newImageFiles.value = nuevosArchivos;
}

onMounted(() => {
  // Animación específica para el subrayado
  gsap.from('.title-underline', {
    opacity: 0,
    width: 0,
    duration: 0.8,
    delay: 0.2,
    ease: 'power2.out'
  });
  
  fetchGalerias()
  fetchBarberos()
})
</script>

<template>
  <div class="landing">
    <h1 class="primary-title fade-in">GALERÍA</h1>
    <div class="title-underline mx-auto fade-in"></div>
    <div v-if="isAdmin" class="admin-bar fade-in">
      <button class="admin-btn" @click="abrirAdminMenu" v-if="!adminMode">Administrar galería</button>
      <button class="admin-btn" @click="desactivarAdmin" v-if="adminMode">Salir administración</button>
    </div>
    
    <!-- Estado de carga -->
    <v-row v-if="loading" justify="center" class="my-8">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="accent" size="64"></v-progress-circular>
        <div class="mt-4">Cargando imágenes...</div>
      </v-col>
    </v-row>
    
    <!-- Eliminar grupos -->
    <div v-if="adminMode && adminAction === 'eliminar'" style="margin-bottom:1em;">
      <div class="galeria-grid">
        <div
          v-for="galeria in galerias"
          :key="galeria.id"
          class="galeria-item fade-in"
          :class="{ selected: selectedGrupos.includes(galeria.id) }"
          @click="toggleGrupo(galeria.id)"
          style="cursor:pointer; position:relative;"
        >
          <img
            :src="getImgUrl(galeria.imagenes[0])"
            class="galeria-img"
            :alt="`Imagen de ${galeria.barbero?.nombre || ''}`"
          />
          <div class="barbero-nombre">{{ galeria.barbero?.nombre || 'Barbero desconocido' }}</div>
          <input type="checkbox"
            class="grupo-checkbox"
            :checked="selectedGrupos.includes(galeria.id)"
            style="position:absolute;top:10px;left:10px;transform:scale(1.5);pointer-events:none;"
            readonly
          />
        </div>
      </div>
      <div class="admin-actions fade-in">
        <button class="admin-action-btn eliminar-btn" @click="eliminarGruposSeleccionados" :disabled="selectedGrupos.length === 0">
          Eliminar grupos seleccionados
        </button>
        <button v-if="!totalLoaded && !loading" @click="cargarMas" class="admin-action-btn cargar-btn">
          Cargar más
        </button>
        <p v-else-if="totalLoaded" class="fin">No hay más imágenes.</p>
      </div>
    </div>
    
    <!-- Vista normal -->
    <div v-if="!adminMode" class="galeria-grid">
      <div
        v-for="(galeria, i) in galerias"
        :key="galeria.id"
        class="galeria-item fade-in"
        @click="galeria.imagenes.length > 1 ? abrirModal(galeria) : null"
        :class="{ 'clickable': galeria.imagenes.length > 1 }"
      >
        <img
          :src="getImgUrl(galeria.imagenes[0])"
          class="galeria-img"
          :alt="`Imagen de ${galeria.barbero?.nombre || ''}`"
        />
        <div class="barbero-nombre">{{ galeria.barbero?.nombre || 'Barbero desconocido' }}</div>
        <div v-if="galeria.imagenes.length > 1" class="multi-image-badge">
          <v-icon icon="mdi-image-multiple" color="white" size="small"></v-icon>
          <span>{{ galeria.imagenes.length }}</span>
        </div>
      </div>
    </div>
    <button v-if="!totalLoaded && !adminMode && !loading" @click="cargarMas" class="cargar-btn fade-in">
      Cargar más
    </button>
    <p v-else-if="!adminMode && totalLoaded" class="fin fade-in">No hay más imágenes.</p>

    <!-- Modal para añadir imágenes -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="desactivarAdmin">
      <div class="modal-content modal-form">
        <button class="cerrar-modal" @click="desactivarAdmin">×</button>
        <h2 class="primary-title fade-in">Añadir imágenes</h2>
        <div class="title-underline mx-auto fade-in"></div>
        <form @submit.prevent="guardarNuevaImagen" style="margin-top:1em; width: 100%;" class="fade-in">
          <label>Barbero:</label>
          <v-select
            v-model="newBarberoId"
            :items="barberos.map(b => ({ value: b.id, title: b.nombre }))"
            variant="outlined"
            bg-color="rgba(43, 43, 43, 0.7)"
            color="var(--accent-color)"
            label="Selecciona un barbero"
            placeholder="Selecciona un barbero"
            :error-messages="barberoError"
            @update:model-value="barberoError = ''"
            hide-details="auto"
          ></v-select>
          <label>Añadir imagen(es):</label>
          <div class="custom-file-input">
            <v-btn
              color="accent"
              variant="outlined"
              prepend-icon="mdi-file-image"
              @click="$refs.fileInput.click()"
              class="file-select-btn"
              :class="{ 'error-border': imagenesError }"
            >
              Elegir archivos
            </v-btn>
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              @change="subirImagen" 
              multiple
              class="hidden-input"
            >
          </div>
          
          <v-alert
            v-if="imagenesError"
            type="error"
            variant="tonal"
            density="compact"
            icon="mdi-alert-circle"
            border="start"
            class="mt-2 mb-2"
          >
            {{ imagenesError }}
          </v-alert>
          
          <v-alert
            v-if="mostrarError"
            type="error"
            variant="tonal"
            density="compact"
            icon="mdi-alert-circle"
            border="start"
            closable
            class="mt-2 mb-2"
            @click:close="mostrarError = false"
          >
            {{ errorMensaje }}
          </v-alert>
          
          <ul>
            <li v-for="(file, idx) in newImageFiles" :key="file.name">
              <div class="d-flex align-center justify-space-between">
                <span class="file-name">{{ file.name }}</span>
                <v-btn
                  size="small"
                  color="error"
                  variant="text"
                  icon="mdi-delete"
                  @click="quitarImagen(idx)"
                ></v-btn>
              </div>
            </li>
          </ul>
          <div class="d-flex justify-end mt-4">
            <v-btn 
              type="submit" 
              color="accent"
              class="font-weight-bold"
              min-width="120"
              prepend-icon="mdi-image-plus"
            >
              Añadir imágenes
            </v-btn>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de imágenes con carrusel -->
    <div v-if="modalOpen" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content modal-carousel">
        <button class="cerrar-modal" @click="cerrarModal">×</button>
        <h2 v-if="galeriaActual" class="primary-title fade-in">{{ galeriaActual.barbero?.nombre }}</h2>
        <div class="title-underline mx-auto fade-in"></div>
        
        <v-carousel
          v-if="imagenesModal.length > 0"
          hide-delimiter-background
          show-arrows="hover"
          height="500"
          delimiter-icon="mdi-circle"
          :cycle="true"
          class="carousel-container fade-in"
        >
          <v-carousel-item
            v-for="(img, idx) in imagenesModal"
            :key="idx"
          >
            <div class="carousel-item-container">
              <img
                :src="getImgUrl(img)"
                class="carousel-img"
                :alt="`Imagen ${idx+1}`"
              />
            </div>
          </v-carousel-item>
        </v-carousel>
      </div>
    </div>
    
    <!-- Menú modal pequeño para elegir acción -->
    <div v-if="showAdminMenu" class="admin-menu-modal" @click.self="cerrarAdminMenu">
      <div class="admin-menu-content">
        <button @click="seleccionarAccion('eliminar')">Eliminar grupos</button>
        <button @click="seleccionarAccion('añadir')">Añadir imágenes</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing {
  text-align: center;
  padding: 1rem;
  padding-top: 3.5rem;
  padding-bottom: 0.5rem;
  background-color: var(--main-bg-color);
  color: var(--text-color);
  min-height: 100vh;
}

.primary-title {
  color: var(--text-color);
  letter-spacing: 3px;
  margin-bottom: 0.3rem;
  font-size: 3rem !important;
  font-family: 'DM Serif Display', serif !important;
  font-style: italic;
  position: relative;
  display: inline-block;
}

h1 {
  font-family: 'DM Serif Display', serif !important;
  font-style: italic;
  font-size: 3rem;
  margin-bottom: 0.3rem;
  letter-spacing: 3px;
  position: relative;
  display: inline-block;
}

.title-underline {
  width: 100px;
  height: 4px;
  background-color: var(--accent-color);
  margin-bottom: 2rem;
}

h1::after {
  display: none;
}

.admin-bar {
  margin-bottom: 1.5rem;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  padding: 0 1rem;
}

.galeria-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin: 2.5rem 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.galeria-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.galeria-item.clickable {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.galeria-item.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.galeria-item.clickable:hover .galeria-img {
  transform: scale(1.05);
}

.galeria-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.barbero-nombre {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5), transparent);
  color: var(--text-color);
  padding: 20px 12px 12px;
  font-family: 'DM Serif', serif;
  font-style: italic;
  font-weight: 500;
  text-align: center;
}

.multi-image-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  padding: 3px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.galeria-item:hover .multi-image-badge {
  background-color: var(--accent-color);
  color: var(--main-bg-color);
  transform: translateY(-3px);
}

.cargar-btn {
  padding: 0.8em 2.5em;
  font-size: 1.1em;
  background: var(--accent-color);
  color: var(--main-bg-color);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 2em;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.cargar-btn:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.7;
}

.fin {
  margin-top: 1.5em;
  color: var(--text-color);
  font-style: italic;
  opacity: 0.8;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: var(--main-bg-color);
  padding: 2.5em;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
  border-left: 4px solid var(--accent-color);
  color: var(--text-color);
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.modal-form {
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.modal-carousel {
  overflow: hidden;
}

.cerrar-modal {
  position: absolute;
  top: 1em;
  right: 1em;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  font-size: 1.8em;
  cursor: pointer;
  color: var(--text-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal-content h2 {
  font-family: 'DM Serif Display', serif !important;
  font-style: italic;
  font-size: 2rem;
  margin-bottom: 0.3rem;
  letter-spacing: 2px;
  text-align: center;
  color: var(--text-color);
}

.carousel-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.carousel-item-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.carousel-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.admin-btn {
  margin-top: 0.5em;
  background: var(--accent-color);
  color: var(--main-bg-color);
  border: none;
  border-radius: 4px;
  padding: 0.5em 1.2em;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.galeria-item.selected {
  outline: 3px solid var(--accent-color);
  box-shadow: 0 0 20px rgba(245, 224, 9, 0.4);
}

.grupo-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  transform: scale(1.5);
  pointer-events: none;
  accent-color: var(--accent-color);
}

.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: 400px;
  margin: 2em auto 0 auto;
}

.admin-action-btn {
  padding: 0.8em 2.5em;
  font-size: 1.1em;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  font-family: inherit;
  font-weight: 500;
}

.eliminar-btn {
  background: #e53935;
  color: #fff;
}

.eliminar-btn:disabled {
  background: #bdbdbd;
  color: #fff;
  cursor: not-allowed;
}

.cargar-btn {
  background: var(--accent-color);
  color: var(--main-bg-color);
}

.cargar-btn:disabled {
  background: #bdbdbd;
  color: #fff;
  cursor: not-allowed;
}

.admin-menu-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  backdrop-filter: blur(3px);
}

.admin-menu-content {
  background: var(--main-bg-color);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  padding: 2em;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
  border-left: 4px solid var(--accent-color);
  z-index: 9001;
  position: relative;
  width: 300px;
  max-width: 90%;
}

.admin-menu-content::before {
  content: "Opciones";
  display: block;
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1.5rem;
  margin-bottom: 0.5em;
  color: var(--text-color);
  text-align: center;
  letter-spacing: 1px;
}

.admin-menu-content button {
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-color);
  border: none;
  border-radius: 6px;
  padding: 1em 1.5em;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-weight: 500;
}

.admin-menu-content button:hover {
  background: var(--accent-color);
  color: var(--main-bg-color);
  padding-left: 2em;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .galeria-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    padding: 0 10px;
  }
  
  .galeria-img {
    height: 200px;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .modal-content {
    padding: 1.5em;
    max-width: 95vw;
  }
  
  .carousel-container {
    height: 300px !important;
  }

  .barbero-nombre {
    font-size: 0.9rem;
    padding: 15px 8px 8px;
  }
}

@media (max-width: 480px) {
  .galeria-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
  
  .galeria-img {
    height: 150px;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .modal-content {
    padding: 1em;
  }
  
  .carousel-container {
    height: 250px !important;
  }
}

/* Asegurar que todos los h2 del componente usen la fuente correcta */
h2 {
  font-family: 'DM Serif Display', serif !important;
  font-style: italic;
}

/* Estilos para el formulario de añadir imágenes */
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--text-color);
}

form label {
  font-weight: bold;
  margin-bottom: 0.3rem;
  display: block;
  text-align: left;
}

form select, form input[type="file"] {
  padding: 0.7rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.2);
  color: var(--text-color);
  width: 100%;
}

form select {
  appearance: menulist;
  height: 45px;
  font-size: 1rem;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, var(--text-color) 50%), 
                    linear-gradient(135deg, var(--text-color) 50%, transparent 50%);
  background-position: calc(100% - 20px) center, calc(100% - 15px) center;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 30px;
  color-scheme: dark;
}

form select option {
  background-color: var(--main-bg-color);
  color: var(--text-color);
  padding: 10px;
}

form select:focus {
  outline: 2px solid var(--accent-color);
}

form input[type="file"] {
  padding: 10px;
  cursor: pointer;
}

form input[type="file"]::file-selector-button {
  background-color: var(--accent-color);
  color: var(--main-bg-color);
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  font-weight: bold;
}

form ul {
  list-style: none;
  padding: 0;
  text-align: left;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
}

form li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.7rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0;
}

form li:last-child {
  border-bottom: none;
}

form li .file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.añadir-btn {
  background-color: var(--accent-color);
  color: var(--main-bg-color);
}

.custom-file-input {
  position: relative;
  margin-bottom: 1rem;
}

.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.file-select-btn {
  width: 100%;
}

.error-border {
  border: 1px solid #ff5252 !important;
}
</style>