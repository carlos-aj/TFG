<template>
  <div>
    <h2>Lista de Servicios</h2>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio (€)</th>
          <th>Duración (citas)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="servicio in paginatedServicios" :key="servicio.id">
          <td v-if="editId !== servicio.id">{{ servicio.nombre }}</td>
          <td v-else>
            <input v-model="editForm.nombre" />
          </td>
          <td v-if="editId !== servicio.id">{{ servicio.precio }}</td>
          <td v-else>
            <input type="number" v-model.number="editForm.precio" min="0" />
          </td>
          <td v-if="editId !== servicio.id">{{ servicio.duracion }}</td>
          <td v-else>
            <input type="number" v-model.number="editForm.duracion" min="0" />
          </td>
          <td>
            <button v-if="editId !== servicio.id" @click="startEdit(servicio)">Editar</button>
            <button v-else @click="saveEdit(servicio.id)">Guardar</button>
            <button v-if="editId === servicio.id" @click="cancelEdit">Cancelar</button>
            <button @click="eliminarServicio(servicio.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div style="margin-bottom:1rem;">
      <button :disabled="currentPage === 1" @click="currentPage--">Anterior</button>
      Página {{ currentPage }} de {{ totalPages }}
      <button :disabled="currentPage === totalPages" @click="currentPage++">Siguiente</button>
    </div>

    <h2 style="margin-top:2rem;">Crear Servicio</h2>
    <form @submit.prevent="crearServicio">
      <div>
        <label for="nombre">Nombre:</label>
        <input id="nombre" v-model="form.nombre" required />
      </div>
      <div>
        <label for="precio">Precio (€):</label>
        <input id="precio" type="number" v-model.number="form.precio" min="0" required />
      </div>
      <div>
        <label for="duracion">Duración (nº de citas):</label>
        <select id="duracion" v-model.number="form.duracion" required>
            <option :value="1">1 cita (30 min)</option>
            <option :value="2">2 citas (1 hora)</option>
            <option :value="3">3 citas (1h 30min)</option>
            <option :value="4">4 citas (2h)</option>
        </select>
      </div>
      <button type="submit">Crear</button>
    </form>
    <p v-if="mensaje" style="color: green">{{ mensaje }}</p>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const servicios = ref([])
const form = ref({ nombre: '', precio: 0, duracion: 0 })
const mensaje = ref('')
const error = ref('')

// Para edición
const editId = ref(null)
const editForm = ref({ nombre: '', precio: 0, duracion: 0 })

const currentPage = ref(1)
const pageSize = ref(5)

const totalPages = computed(() => Math.ceil(servicios.value.length / pageSize.value))
const paginatedServicios = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return servicios.value.slice(start, start + pageSize.value)
})

async function cargarServicios() {
  try {
    const response = await fetch('http://localhost:3000/api/servicio', {
      credentials: 'include'
    })
    if (response.ok) {
      servicios.value = await response.json()
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value || 1
    } else {
      servicios.value = []
    }
  } catch {
    servicios.value = []
  }
}

async function crearServicio() {
  mensaje.value = ''
  error.value = ''
  try {
    const response = await fetch('http://localhost:3000/api/servicio', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (response.ok) {
      mensaje.value = 'Servicio creado correctamente'
      form.value.nombre = ''
      form.value.precio = 0
      form.value.duracion = 0
      await cargarServicios()
    } else {
      const data = await response.json()
      error.value = data.message || 'Error al crear servicio'
    }
  } catch (e) {
    error.value = 'Error de red'
  }
}

async function eliminarServicio(id) {
  if (!confirm('¿Seguro que quieres eliminar este servicio?')) return
  try {
    const response = await fetch(`http://localhost:3000/api/servicio/${id}`, {
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
  }
}

// Edición
function startEdit(servicio) {
  editId.value = servicio.id
  editForm.value = { nombre: servicio.nombre, precio: servicio.precio, duracion: servicio.duracion }
}
function cancelEdit() {
  editId.value = null
  editForm.value = { nombre: '', precio: 0, duracion: 0 }
}
async function saveEdit(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/servicio/${id}`, {
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

onMounted(cargarServicios)
</script>

<style scoped>
form {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-top: 0.5rem;
}
input {
  width: 100%;
  padding: 0.3rem;
  margin-top: 0.2rem;
}
button {
  margin: 0 0.2rem 0.2rem 0;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}
th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}
</style>