<template>
  <div>
    <h2>Lista de Empleados</h2>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Especialidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="barbero in paginatedBarberos" :key="barbero.id">
          <td v-if="editId !== barbero.id">{{ barbero.nombre }}</td>
          <td v-else>
            <input v-model="editForm.nombre" />
          </td>
          <td v-if="editId !== barbero.id">{{ barbero.especialidad }}</td>
          <td v-else>
            <input v-model="editForm.especialidad" />
          </td>
          <td>
            <button v-if="editId !== barbero.id" @click="startEdit(barbero)">Editar</button>
            <button v-else @click="saveEdit(barbero.id)">Guardar</button>
            <button v-if="editId === barbero.id" @click="cancelEdit">Cancelar</button>
            <button @click="eliminarBarbero(barbero.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div style="margin-bottom:1rem;">
      <button :disabled="currentPage === 1" @click="currentPage--">Anterior</button>
      Página {{ currentPage }} de {{ totalPages }}
      <button :disabled="currentPage === totalPages" @click="currentPage++">Siguiente</button>
    </div>

    <h2 style="margin-top:2rem;">Crear Empleado</h2>
    <form @submit.prevent="crearBarbero">
      <div>
        <label for="nombre">Nombre:</label>
        <input id="nombre" v-model="form.nombre" required />
      </div>
      <div>
        <label for="especialidad">Especialidad:</label>
        <input id="especialidad" v-model="form.especialidad" required />
      </div>
      <button type="submit">Crear</button>
    </form>
    <p v-if="mensaje" style="color: green">{{ mensaje }}</p>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

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

async function cargarBarberos() {
  try {
    const response = await fetch('http://localhost:3000/api/barbero', {
      credentials: 'include'
    })
    if (response.ok) {
      barberos.value = await response.json()
      if (currentPage.value > totalPages.value) currentPage.value = totalPages.value || 1
    } else {
      barberos.value = []
    }
  } catch {
    barberos.value = []
  }
}

async function crearBarbero() {
  mensaje.value = ''
  error.value = ''
  try {
    const response = await fetch('http://localhost:3000/api/barbero', {
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
    } else {
      const data = await response.json()
      error.value = data.message || 'Error al crear empleado'
    }
  } catch (e) {
    error.value = 'Error de red'
  }
}

async function eliminarBarbero(id) {
  if (!confirm('¿Seguro que quieres eliminar este empleado?')) return
  try {
    const response = await fetch(`http://localhost:3000/api/barbero/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (response.ok) {
      await cargarBarberos()
    } else {
      error.value = 'Error al eliminar empleado'
    }
  } catch {
    error.value = 'Error de red'
  }
}

// Edición
function startEdit(barbero) {
  editId.value = barbero.id
  editForm.value = { nombre: barbero.nombre, especialidad: barbero.especialidad }
}
function cancelEdit() {
  editId.value = null
  editForm.value = { nombre: '', especialidad: '' }
}
async function saveEdit(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/barbero/${id}`, {
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
    }
  } catch {
    error.value = 'Error de red'
  }
}

onMounted(cargarBarberos)
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