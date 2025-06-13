<script setup>
import { ref, onMounted } from 'vue'
import { API_URL } from '../config'

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

// Utilidad para mezclar un array
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
  if (accion === 'añadir') showAddModal.value = true
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
  await Promise.all(
    selectedGrupos.value.map(id =>
      fetch(`${API_URL}/api/galeria/${id}`, { method: 'DELETE' })
    )
  );
  mezclado.value = false; // <-- Añade esta línea
  await fetchGalerias();
  desactivarAdmin();
}

function subirImagen(e) {
  const files = Array.from(e.target.files)
  // Evita duplicados por nombre (opcional)
  const nombresActuales = new Set(newImageFiles.value.map(f => f.name))
  const nuevos = files.filter(f => !nombresActuales.has(f.name))
  newImageFiles.value = newImageFiles.value.concat(nuevos)
  // Si quieres permitir duplicados, simplemente:
  // newImageFiles.value = newImageFiles.value.concat(files)
}

async function guardarNuevaImagen() {
  const barbero_id = Number(newBarberoId.value)
  if (!barbero_id || newImageFiles.value.length === 0) return

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

onMounted(() => {
  fetchGalerias()
  fetchBarberos()
})
</script>

<template>
  <div class="landing">
    <h1>Galería</h1>
    <div v-if="isAdmin" class="admin-bar">
      <button class="admin-btn" @click="abrirAdminMenu" v-if="!adminMode">Administrar galería</button>
      <button class="admin-btn" @click="desactivarAdmin" v-if="adminMode">Salir administración</button>
      <!-- Menú modal pequeño para elegir acción -->
      <div v-if="showAdminMenu" class="admin-menu-modal" @click.self="cerrarAdminMenu">
        <div class="admin-menu-content">
          <button @click="seleccionarAccion('eliminar')">Eliminar grupos</button>
          <button @click="seleccionarAccion('añadir')">Añadir imágenes</button>
        </div>
      </div>
    </div>
    <!-- Eliminar grupos -->
    <div v-if="adminMode && adminAction === 'eliminar'" style="margin-bottom:1em;">
      <div class="galeria-grid">
        <div
          v-for="galeria in galerias"
          :key="galeria.id"
          class="galeria-item"
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
      <div class="admin-actions">
        <button class="admin-action-btn eliminar-btn" @click="eliminarGruposSeleccionados" :disabled="selectedGrupos.length === 0">
          Eliminar grupos seleccionados
        </button>
        <button v-if="!totalLoaded" @click="cargarMas" :disabled="loading" class="admin-action-btn cargar-btn">
          {{ loading ? 'Cargando...' : 'Cargar más' }}
        </button>
        <p v-else class="fin">No hay más imágenes.</p>
      </div>
    </div>
    <!-- Modal para añadir imágenes -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="desactivarAdmin">
      <div class="modal-content">
        <button class="cerrar-modal" @click="desactivarAdmin">×</button>
        <h2>Añadir imágenes</h2>
        <form @submit.prevent="guardarNuevaImagen" style="margin-top:1em;">
          <label>Barbero:</label>
          <select v-model="newBarberoId" required>
            <option value="" disabled>Selecciona un barbero</option>
            <option v-for="barbero in barberos" :key="barbero.id" :value="barbero.id">
              {{ barbero.nombre }}
            </option>
          </select>
          <label>Añadir imagen(es):</label>
          <input type="file" accept="image/*" @change="subirImagen" multiple required>
          <ul>
            <li v-for="(file, idx) in newImageFiles" :key="file.name">
              {{ file.name }}
              <button type="button" @click="newImageFiles.value.splice(idx, 1)">Quitar</button>
            </li>
          </ul>
          <button type="submit" class="añadir-btn">Añadir imágenes</button>
        </form>
      </div>
    </div>
    <!-- Vista normal -->
    <div v-if="!adminMode" class="galeria-grid">
      <div
        v-for="(galeria, i) in galerias"
        :key="galeria.id"
        class="galeria-item"
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
    <button v-if="!totalLoaded && !adminMode" @click="cargarMas" :disabled="loading" class="cargar-btn">
      {{ loading ? 'Cargando...' : 'Cargar más' }}
    </button>
    <p v-else-if="!adminMode" class="fin">No hay más imágenes.</p>

    <!-- Modal de imágenes con carrusel -->
    <div v-if="modalOpen" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <button class="cerrar-modal" @click="cerrarModal">×</button>
        <h2 v-if="galeriaActual">{{ galeriaActual.barbero?.nombre }}</h2>
        
        <v-carousel
          v-if="imagenesModal.length > 0"
          hide-delimiter-background
          show-arrows="hover"
          height="500"
          delimiter-icon="mdi-circle"
          :cycle="true"
          class="carousel-container"
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

h1 {
  font-family: 'DM Serif', serif !important;
  font-style: italic;
  font-size: 3rem;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}

h1::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: var(--accent-color);
  border-radius: 2px;
}

.admin-bar {
  margin-bottom: 1.5rem;
  text-align: right;
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.galeria-item.clickable {
  cursor: pointer;
}

.galeria-item.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.galeria-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.barbero-nombre {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: var(--text-color);
  padding: 12px;
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
  transition: all 0.3s ease;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.cargar-btn:hover:enabled {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
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
  backdrop-filter: blur(5px);
}

.modal-content {
  background: var(--main-bg-color);
  padding: 2.5em;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-left: 4px solid var(--accent-color);
  color: var(--text-color);
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
  transition: all 0.3s ease;
  z-index: 10;
}

.cerrar-modal:hover {
  background: var(--accent-color);
  color: var(--main-bg-color);
}

.modal-content h2 {
  font-family: 'DM Serif', serif;
  font-style: italic;
  font-size: 2rem;
  margin-bottom: 1.5rem;
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
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 3000;
  backdrop-filter: blur(3px);
}

.admin-menu-content {
  background: var(--main-bg-color);
  margin: 2em 2em 0 0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  padding: 1.5em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  border-left: 3px solid var(--accent-color);
}

.admin-menu-content button {
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-color);
  border: none;
  border-radius: 6px;
  padding: 0.8em 1.5em;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.admin-menu-content button:hover {
  background: var(--accent-color);
  color: var(--main-bg-color);
  padding-left: 2em;
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
}

form select {
  width: 100%;
}

form ul {
  list-style: none;
  padding: 0;
  text-align: left;
  margin-top: 0.5rem;
}

form li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

form li button {
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
}

.añadir-btn {
  background-color: var(--accent-color);
  color: var(--main-bg-color);
}

.añadir-btn:hover {
  background-color: #e6d208;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .galeria-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
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
}
</style>