<script setup>
import { ref, onMounted, computed } from 'vue'
import { API_URL } from '../config'

const citas = ref([])
const usuarios = ref([])
const barberos = ref([])
const servicios = ref([])
const loading = ref(true)
const error = ref('')
const rol = localStorage.getItem('role')
const barbero_id = localStorage.getItem('barbero_id')
const user_id = localStorage.getItem('user_id')

const hoy = new Date().toISOString().split('T')[0]

onMounted(async () => {
  try {
    // Cargar citas
    const resCitas = await fetch(`${API_URL}/api/cita`, {
      credentials: 'include'
    })
    if (!resCitas.ok) throw new Error('Error al cargar citas')
    citas.value = await resCitas.json()

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

    // Cargar barberos
    const resBarberos = await fetch(`${API_URL}/api/barbero`, {
      credentials: 'include'
    })
    barberos.value = await resBarberos.json()

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
  
  let filtradas = citas.value.filter(c => c.fecha && c.fecha.slice(0, 10) === hoy)
  if (rol === 'empleado' && barbero_id) {
    filtradas = filtradas.filter(c => String(c.barbero_id) === String(barbero_id))
  }
  return filtradas
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
  <div class="landing">
    <h1>Citas del día</h1>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <table v-if="citasFiltradas.length">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Barbero</th>
            <th>Servicio</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Pagado</th>
            <th v-if="rol === 'admin'">Sancionar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cita in citasFiltradas" :key="cita.id">
            <td>
              <template v-if="cita.nombre_invitado">
                {{ cita.nombre_invitado }} <span style="color: #1976d2; font-weight: bold;">(Invitado)</span>
              </template>
              <template v-else>
                {{ getNombreUsuario(cita.user_id) }}
              </template>
            </td>
            <td>{{ getNombreBarbero(cita.barbero_id) }}</td>
            <td>{{ getNombreServicio(cita.servicio_id) }}</td>
            <td>{{ cita.hora }}</td>
            <td>
              <input
                type="checkbox"
                :checked="cita.estado"
                @change="toggleEstado(cita)"
              />
            </td>
            <td>
              {{ cita.pagado ? 'Sí' : 'No' }}
            </td>
            <td v-if="rol === 'admin'">
              <button
                v-if="cita.user_id"
                @click="sancionarUsuario(cita.user_id)"
              >
                Sancionar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>No hay citas para hoy.</div>
    </div>
  </div>
</template>
<style scoped>
.landing {
  text-align: center;
}
table {
  margin: 0 auto;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px 12px;
}
</style>