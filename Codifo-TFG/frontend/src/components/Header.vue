<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '../config'
import { checkAuthenticated, getUserRole, clearAuthData } from '../utils/auth'

const isOverDarkSection = ref(false)
const isAuthenticated = ref(false)
const userRole = ref(null)
const router = useRouter()

function checkAuth() {
  isAuthenticated.value = checkAuthenticated()
  userRole.value = getUserRole()
}

function logout() {
  fetch(`${API_URL}/api/user/logout`, {
    method: 'POST',
    credentials: 'include'
  }).then(() => {
    clearAuthData()
    isAuthenticated.value = false
    userRole.value = null
    router.push('/login')
  }).catch(error => {
    console.error('Error al cerrar sesión:', error)
    // Limpiar datos de autenticación incluso si hay error
    clearAuthData()
    isAuthenticated.value = false
    userRole.value = null
    router.push('/login')
  })
}

function onScroll() {
  const darkSection = document.querySelector('.equipo')
  const header = document.querySelector('section')
  if (!darkSection || !header) return
  const rect = darkSection.getBoundingClientRect()
  isOverDarkSection.value = rect.top <= 0 && rect.bottom > header.offsetHeight
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  checkAuth()
  window.addEventListener('storage', checkAuth)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('storage', checkAuth)
})
</script>

<template>
  <section :class="{ 'header-dark': isOverDarkSection }">
    <div>
      <router-link to="/">
        <img class="imagen1" src="../assets/Logo.png" alt="Logo">
      </router-link>
    </div>
    <div>
      <ul class="nav nav-underline justify-content-end-underline">
        <!-- Caso 1: No registrado -->
        <template v-if="!isAuthenticated">
          <li class="nav-item">
            <router-link class="nav-link" to="/conocenos" active-class="active" exact-active-class="active">Conócenos</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/galeria" active-class="active" exact-active-class="active">Galería</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/citas" active-class="active" exact-active-class="active">Citas</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/login" active-class="active" exact-active-class="active">LogIn</router-link>
          </li>
        </template>

        <!-- Caso 2: Registrado user -->
        <template v-else-if="userRole === 'user' || userRole === 'cliente'">
          <li class="nav-item">
            <router-link class="nav-link" to="/conocenos" active-class="active" exact-active-class="active">Conócenos</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/galeria" active-class="active" exact-active-class="active">Galería</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/citas" active-class="active" exact-active-class="active">Citas</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
          </li>
        </template>

        <!-- Caso 3: Registrado empleado -->
        <template v-else-if="userRole === 'empleado'">
          <li class="nav-item">
            <router-link class="nav-link" to="/citas-empleados-admin" active-class="active" exact-active-class="active">Citas</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/mes-completo" active-class="active" exact-active-class="active">Mes Completo</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
          </li>
        </template>

        <!-- Caso 4: Registrado admin -->
        <template v-else-if="userRole === 'admin'">
          <li class="nav-item">
            <router-link class="nav-link" to="/empleados" active-class="active" exact-active-class="active">Empleados</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/servicios" active-class="active" exact-active-class="active">Servicios</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/citas-empleados-admin" active-class="active" exact-active-class="active">Citas</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/mes-completo" active-class="active" exact-active-class="active">Mes Completo</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/usuarios" active-class="active" exact-active-class="active">Usuarios</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/galeria" active-class="active" exact-active-class="active">Galeria</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
          </li>
        </template>
      </ul>
    </div>
  </section>
</template>
<style scoped>
section {
  background-color: #2B2B2B;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  transition: background 0.3s;
}

section.header-dark {
  background-color: #656565;
}

.imagen1 {
  width: 120px;           
  height: auto;
  display: block;
}

.nav-link {
  color: #FFFFFF !important;
  font-size: 28px !important;
  transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.nav-underline .nav-link::after {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.nav-link:hover,
.nav-link.active {
  color: #F5E009 !important;
}
</style>
