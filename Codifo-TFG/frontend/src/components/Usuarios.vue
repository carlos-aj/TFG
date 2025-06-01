<template>
  <div>
    <h2>Lista de Usuarios</h2>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Apellidos</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Rol</th>
          <th>Penalización</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in paginatedServicios" :key="usuario.id">
          <td v-if="editId !== usuario.id">{{ usuario.nombre }}</td>
          <td v-else>
            <input v-model="editForm.nombre" />
          </td>
          <td v-if="editId !== usuario.id">{{ usuario.apellidos }}</td>
          <td v-else>
            <input v-model="editForm.apellidos" />
          </td>
          <td v-if="editId !== usuario.id">{{ usuario.email }}</td>
          <td v-else>
            <input v-model="editForm.email" />
          </td>
          <td v-if="editId !== usuario.id">{{ usuario.telefono }}</td>
          <td v-else>
            <input v-model="editForm.telefono" />
          </td>
          <td v-if="editId !== usuario.id">{{ usuario.rol }}</td>
          <td v-else>
            <select v-model="editForm.rol">
              <option value="user">user</option>
              <option value="empleado">empleado</option>
              <option value="admin">admin</option>
            </select>
          </td>
          <td v-if="editId !== usuario.id">{{ usuario.penalizacion }}</td>
          <td v-else>
            <input type="number" v-model.number="editForm.penalizacion" min="0" />
          </td>
          <td>
            <button v-if="editId !== usuario.id" @click="startEdit(usuario)">Editar</button>
            <button v-else @click="saveEdit(usuario.id)">Guardar</button>
            <button v-if="editId === usuario.id" @click="cancelEdit">Cancelar</button>
            <button @click="eliminarUsuario(usuario.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div style="margin-bottom:1rem;">
      <button :disabled="currentPage === 1" @click="currentPage--">Anterior</button>
      Página {{ currentPage }} de {{ totalPages }}
      <button :disabled="currentPage === totalPages" @click="currentPage++">Siguiente</button>
    </div>

    <h2 style="margin-top:2rem;">Crear Usuario</h2>
    <form @submit.prevent="crearUsuario">
      <div>
        <label for="nombre">Nombre:</label>
        <input id="nombre" v-model="form.nombre" required />
      </div>
      <div>
        <label for="apellidos">Apellidos:</label>
        <input id="apellidos" v-model="form.apellidos" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input id="email" v-model="form.email" required />
      </div>
      <div>
        <label for="telefono">Teléfono:</label>
        <input id="telefono" v-model="form.telefono" required />
      </div>
      <div>
        <label for="contrasena">Contraseña:</label>
        <input id="contrasena" v-model="form.contrasena" type="password" required minlength="6" />
      </div>
      <div>
        <label for="rol">Rol:</label>
        <select id="rol" v-model="form.rol" required>
          <option value="user">user</option>
          <option value="empleado">empleado</option>
          <option value="admin">admin</option>
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

const usuarios = ref([])
const form = ref({
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  contrasena: '',
  rol: 'user'
})
const mensaje = ref('')
const error = ref('')

// Para edición
const editId = ref(null)
const editForm = ref({
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  rol: 'user',
  penalizacion: 0
})

const currentPage = ref(1)
const pageSize = ref(5)

const totalPages = computed(() => Math.ceil(usuarios.value.length / pageSize.value))
const paginatedServicios = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return usuarios.value.slice(start, start + pageSize.value)
})


async function cargarUsuarios() {
  try {
    const response = await fetch('http://localhost:3000/api/user', {
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value || 1
      usuarios.value = data.sort((a, b) => {
        const orden = { admin: 0, empleado: 1, user: 2 }
        return (orden[a.rol] ?? 99) - (orden[b.rol] ?? 99)
      })
    } else {
      usuarios.value = []
    }
  } catch {
    usuarios.value = []
  }
}

async function crearUsuario() {
  mensaje.value = ''
  error.value = ''
  try {
    const response = await fetch('http://localhost:3000/api/user', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (response.ok) {
      mensaje.value = 'Usuario creado correctamente'
      form.value.nombre = ''
      form.value.apellidos = ''
      form.value.email = ''
      form.value.telefono = ''
      form.value.contrasena = ''
      form.value.rol = 'user'
      await cargarUsuarios()
    } else {
      const data = await response.json()
      error.value = data.message || 'Error al crear usuario'
    }
  } catch (e) {
    error.value = 'Error de red'
  }
}

async function eliminarUsuario(id) {
  if (!confirm('¿Seguro que quieres eliminar este usuario?')) return
  try {
    const response = await fetch(`http://localhost:3000/api/user/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (response.ok) {
      await cargarUsuarios()
    } else {
      error.value = 'Error al eliminar usuario'
    }
  } catch {
    error.value = 'Error de red'
  }
}

// Edición
function startEdit(usuario) {
  editId.value = usuario.id
  editForm.value = {
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol,
    penalizacion: usuario.penalizacion
  }
}
function cancelEdit() {
  editId.value = null
  editForm.value = {
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rol: 'user',
    penalizacion: 0
  }
}
async function saveEdit(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/user/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    })
    if (response.ok) {
      editId.value = null
      await cargarUsuarios()
    } else {
      error.value = 'Error al editar usuario'
    }
  } catch {
    error.value = 'Error de red'
  }
}

onMounted(cargarUsuarios)
</script>

<style scoped>
form {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-top: 0.5rem;
}
input, select {
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