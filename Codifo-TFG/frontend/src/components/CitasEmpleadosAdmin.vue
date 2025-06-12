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
const user_id = localStorage.getItem('user_id')
const nombre = localStorage.getItem('nombre')
const empleadoBarberoId = ref(null)
const barbero_id = localStorage.getItem('barbero_id')
const selectedBarbero = ref(null)
const showBarberoSelector = ref(false)

const hoy = new Date().toISOString().split('T')[0]

onMounted(async () => {
  try {
    // Cargar barberos primero para poder asociar el empleado con su barbero
    const resBarberos = await fetch(`${API_URL}/api/barbero`, {
      credentials: 'include'
    })
    barberos.value = await resBarberos.json()
    
    // Si el usuario es empleado, buscar el barbero correspondiente por nombre o usar el barbero_id guardado
    if (rol === 'empleado') {
      if (barbero_id && barbero_id !== '0' && barbero_id !== 'null') {
        // Usar el barbero_id guardado en localStorage
        empleadoBarberoId.value = Number(barbero_id);
        console.log(`Empleado usando barbero_id guardado: ${empleadoBarberoId.value}`);
        
        // Verificar que el barbero existe
        const barberoExiste = barberos.value.find(b => b.id === Number(barbero_id));
        if (!barberoExiste) {
          console.log(`El barbero_id ${barbero_id} no existe en la lista de barberos`);
          empleadoBarberoId.value = null;
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
          // Guardar en localStorage para futuras sesiones
          localStorage.setItem('barbero_id', barberoCorrespondiente.id.toString());
        } else {
          console.log(`No se encontró un barbero correspondiente para el empleado ${nombre}`);
          showBarberoSelector.value = true;
        }
      } else {
        showBarberoSelector.value = true;
      }
    }

    // Cargar citas - si es empleado/barbero, filtrar por su barbero_id
    await cargarCitas();
    
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
    let citasUrl = `${API_URL}/api/cita`;
    if (rol === 'empleado' && empleadoBarberoId.value) {
      citasUrl += `?barbero_id=${empleadoBarberoId.value}`;
    }
    
    const resCitas = await fetch(citasUrl, {
      credentials: 'include'
    })
    if (!resCitas.ok) throw new Error('Error al cargar citas')
    citas.value = await resCitas.json()
  } catch (e) {
    console.error('Error al cargar citas:', e);
    error.value = e.message;
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
  
  // Filtrar por fecha (hoy)
  let filtradas = citas.value.filter(c => c.fecha && c.fecha.slice(0, 10) === hoy)
  
  // Si es empleado y tenemos el barbero correspondiente, filtrar por ese barbero
  if (rol === 'empleado' && empleadoBarberoId.value) {
    console.log(`Filtrando citas para barbero_id: ${empleadoBarberoId.value}`);
    filtradas = filtradas.filter(c => c.barbero_id === empleadoBarberoId.value)
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
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <div v-if="rol === 'empleado' && showBarberoSelector" class="barbero-selector">
        <h2>Selecciona tu barbero</h2>
        <p>No se ha podido determinar automáticamente qué barbero eres. Por favor, selecciona tu barbero de la lista:</p>
        <div class="selector-container">
          <select v-model="selectedBarbero">
            <option :value="null">Selecciona un barbero</option>
            <option v-for="barbero in barberos" :key="barbero.id" :value="barbero.id">
              {{ barbero.nombre }}
            </option>
          </select>
          <button @click="seleccionarBarbero" class="btn-primary">Confirmar</button>
        </div>
      </div>
      
      <div v-else-if="rol === 'empleado' && !empleadoBarberoId" class="warning-message">
        <p>No se encontró un barbero correspondiente para ti. Contacta con el administrador.</p>
      </div>
      <table v-else-if="citasFiltradas.length">
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
      <div v-else class="info-message">No hay citas para hoy.</div>
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
.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}
.warning-message {
  color: #ff6f00;
  background-color: #fff8e1;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}
.info-message {
  color: #0288d1;
  background-color: #e1f5fe;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}
.barbero-selector {
  background-color: #e8f5e9;
  padding: 20px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 500px;
}
.selector-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}
select {
  padding: 8px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.btn-primary {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.btn-primary:hover {
  background-color: #1565c0;
}
</style>