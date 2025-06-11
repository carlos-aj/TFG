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
  return `${API_URL}/ApiGaleria/${img}`
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
      <button class="eliminar-btn" @click="eliminarGruposSeleccionados" :disabled="selectedGrupos.length === 0">
        Eliminar grupos seleccionados
      </button>
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
        @click="abrirModal(galeria)"
        style="cursor:pointer"
      >
        <img
          :src="getImgUrl(galeria.imagenes[0])"
          class="galeria-img"
          :alt="`Imagen de ${galeria.barbero?.nombre || ''}`"
        />
        <div class="barbero-nombre">{{ galeria.barbero?.nombre || 'Barbero desconocido' }}</div>
      </div>
    </div>
    <button v-if="!totalLoaded && !adminMode" @click="cargarMas" :disabled="loading" class="cargar-btn">
      {{ loading ? 'Cargando...' : 'Cargar más' }}
    </button>
    <p v-else-if="!adminMode" class="fin">No hay más imágenes.</p>

    <!-- Modal de imágenes -->
    <div v-if="modalOpen" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <button class="cerrar-modal" @click="cerrarModal">×</button>
        <h2 v-if="galeriaActual">{{ galeriaActual.barbero?.nombre }}</h2>
        <div class="modal-imgs">
          <img
            v-for="(img, idx) in imagenesModal"
            :key="idx"
            :src="getImgUrl(img)"
            class="modal-img"
            :alt="`Imagen ${idx+1}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing {
  text-align: center;
  padding: 2rem;
}
.admin-bar {
  margin-bottom: 1em;
  text-align: right;
}
.galeria-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin: 2rem 0;
}
.galeria-item {
  position: relative;
}
.galeria-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0002;
}
.barbero-nombre {
  margin-top: 0.5em;
  font-weight: bold;
  color: #333;
}
.cargar-btn {
  padding: 0.7em 2em;
  font-size: 1.1em;
  background: #2B2B2B;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1em;
  transition: background 0.2s;
}
.cargar-btn:hover:enabled {
  background: #F5E009;
  color: #2B2B2B;
}
.fin {
  margin-top: 1em;
  color: #888;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  padding: 2em;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  position: relative;
}
.cerrar-modal {
  position: absolute;
  top: 1em;
  right: 1em;
  background: transparent;
  border: none;
  font-size: 2em;
  cursor: pointer;
}
.modal-imgs {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  justify-content: center;
  margin-top: 1em;
}
.modal-img {
  max-width: 180px;
  max-height: 180px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px #0002;
}
.admin-btn {
  margin-top: 0.5em;
  background: #F5E009;
  color: #2B2B2B;
  border: none;
  border-radius: 4px;
  padding: 0.3em 1em;
  cursor: pointer;
  font-weight: bold;
}
.admin-img-container {
  position: relative;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 4px;
  cursor: pointer;
}
.admin-img-container.selected {
  border: 2px solid #F5E009;
  background: #fffbe6;
}
.admin-img-container input[type="checkbox"] {
  position: absolute;
  top: 8px;
  left: 8px;
  transform: scale(1.3);
}
.eliminar-btn, .añadir-btn {
  margin-top: 1em;
  padding: 0.5em 1.5em;
  background: #2B2B2B;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
}
.eliminar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.galeria-item.selected {
  outline: 3px solid #F5E009;
  background: #fffbe6;
}
.grupo-checkbox {
  pointer-events: none;
}
.admin-menu-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 3000;
}
.admin-menu-content {
  background: #fff;
  margin: 2em 2em 0 0;
  border-radius: 10px;
  box-shadow: 0 2px 16px #0003;
  padding: 1.5em 2em;
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.admin-menu-content button {
  background: #2B2B2B;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7em 1.5em;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.2s;
}
.admin-menu-content button:hover {
  background: #F5E009;
  color: #2B2B2B;
} 
</style>