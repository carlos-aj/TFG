<script setup>
import { ref, onMounted } from 'vue'
import { API_URL } from '../config'

const empleados = ref([])
const barberos = ref([])
const loading = ref(true)
const error = ref('')
const success = ref('')

// Para la asignación
const selectedEmpleado = ref(null)
const selectedBarbero = ref(null)

onMounted(async () => {
  try {
    // Cargar empleados
    const resEmpleados = await fetch(`${API_URL}/api/user`, {
      credentials: 'include'
    })
    if (!resEmpleados.ok) throw new Error('Error al cargar empleados')
    const allUsers = await resEmpleados.json()
    // Filtrar solo empleados
    empleados.value = allUsers.filter(user => user.rol === 'empleado')

    // Cargar barberos
    const resBarberos = await fetch(`${API_URL}/api/barbero`, {
      credentials: 'include'
    })
    if (!resBarberos.ok) throw new Error('Error al cargar barberos')
    barberos.value = await resBarberos.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

async function asignarBarbero() {
  if (!selectedEmpleado.value || !selectedBarbero.value) {
    error.value = 'Debes seleccionar un empleado y un barbero'
    return
  }

  try {
    const res = await fetch(`${API_URL}/api/user/${selectedEmpleado.value}/asignar-barbero`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ barbero_id: selectedBarbero.value })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Error al asignar barbero')
    }

    const data = await res.json()
    success.value = data.message || 'Barbero asignado correctamente'
    error.value = ''

    // Actualizar la lista de empleados
    const resEmpleados = await fetch(`${API_URL}/api/user`, {
      credentials: 'include'
    })
    const allUsers = await resEmpleados.json()
    empleados.value = allUsers.filter(user => user.rol === 'empleado')

    // Limpiar selección
    selectedEmpleado.value = null
    selectedBarbero.value = null

    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (e) {
    error.value = e.message
    success.value = ''
  }
}

function getBarberoAsignado(empleado) {
  if (!empleado.barbero_id) return 'No asignado'
  const barbero = barberos.value.find(b => b.id === empleado.barbero_id)
  return barbero ? barbero.nombre : `Barbero #${empleado.barbero_id}`
}
</script>

<template>
  <div class="landing">
    <h1>Asignar Barberos a Empleados</h1>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <div v-if="success" class="success-message">{{ success }}</div>
      
      <div class="asignar-form">
        <h2>Asignar Barbero</h2>
        <div>
          <label>Empleado:</label>
          <select v-model="selectedEmpleado">
            <option :value="null">Selecciona un empleado</option>
            <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
              {{ emp.nombre }} {{ emp.apellidos }}
            </option>
          </select>
        </div>
        
        <div>
          <label>Barbero:</label>
          <select v-model="selectedBarbero">
            <option :value="null">Selecciona un barbero</option>
            <option v-for="barb in barberos" :key="barb.id" :value="barb.id">
              {{ barb.nombre }}
            </option>
          </select>
        </div>
        
        <button @click="asignarBarbero">Asignar</button>
      </div>
      
      <div class="empleados-list">
        <h2>Empleados y sus Barberos</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Barbero Asignado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in empleados" :key="emp.id">
              <td>{{ emp.id }}</td>
              <td>{{ emp.nombre }} {{ emp.apellidos }}</td>
              <td>{{ emp.email }}</td>
              <td>{{ getBarberoAsignado(emp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing {
  text-align: center;
}
.asignar-form {
  margin: 20px auto;
  max-width: 500px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.asignar-form div {
  margin-bottom: 15px;
}
.asignar-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.asignar-form select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.asignar-form button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.asignar-form button:hover {
  background-color: #45a049;
}
.empleados-list {
  margin-top: 30px;
}
table {
  margin: 0 auto;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px 12px;
}
.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}
.success-message {
  color: #2e7d32;
  background-color: #e8f5e9;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}
</style> 