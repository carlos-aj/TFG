<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API_URL } from '../config'
import { checkAuthenticated, getUserRole, clearAuthData } from '../utils/auth'

const isOverDarkSection = ref(false)
const isAuthenticated = ref(false)
const userRole = ref(null)
const router = useRouter()
const route = useRoute()
const drawer = ref(false)
const isScrolled = ref(false)
const lastScrollPosition = ref(0)
const isHeaderVisible = ref(true)
const headerHeight = ref(100)

// Computar la ruta activa para el resaltado en el menú móvil
const currentRoute = computed(() => route.path)

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
    router.push({ name: 'login' })
  }).catch(error => {
    console.error('Error al cerrar sesión:', error)
    // Limpiar datos de autenticación incluso si hay error
    clearAuthData()
    isAuthenticated.value = false
    userRole.value = null
    router.push({ name: 'login' })
  })
}

function onScroll() {
  // Detectar la sección oscura para cambiar color
  const darkSection = document.querySelector('.equipo')
  const header = document.querySelector('.header-section')
  if (darkSection && header) {
    const rect = darkSection.getBoundingClientRect()
    isOverDarkSection.value = rect.top <= 0 && rect.bottom > header.offsetHeight
  }
  
  // Calcular posición de scroll para efectos visuales
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  
  // Efecto de scroll para mostrar/ocultar header
  if (currentScrollPosition < 0) {
    return
  }
  
  // Establecer el estado de scroll (para estilos)
  isScrolled.value = currentScrollPosition > 50
  
  // Determinar si mostrar u ocultar el header
  if (currentScrollPosition < lastScrollPosition.value) {
    isHeaderVisible.value = true
  } else if (currentScrollPosition > 100) {
    isHeaderVisible.value = false
  }
  
  lastScrollPosition.value = currentScrollPosition
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  checkAuth()
  window.addEventListener('storage', checkAuth)
  // Inicializar el valor de altura
  headerHeight.value = 100
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('storage', checkAuth)
})
</script>

<template>
  <!-- Header para pantallas grandes -->
  <v-app-bar 
    :class="{ 
      'header-dark': isOverDarkSection, 
      'header-scrolled': isScrolled,
      'header-hidden': !isHeaderVisible
    }" 
    class="header-section" 
    elevation="2"
    :height="isScrolled ? 80 : headerHeight"
    app
  >
    <div class="d-flex align-center mx-2">
      <router-link :to="{ name: 'home' }">
        <img 
          class="logo-image" 
          src="../assets/Logo.png" 
          alt="Logo"
          :style="{
            width: isScrolled ? '100px' : '120px',
            height: isScrolled ? '70px' : '90px'
          }"
        />
      </router-link>
    </div>
    
    <v-spacer></v-spacer>
    
    <!-- Menú para pantallas grandes -->
    <div class="d-none d-md-block">
      <v-tabs class="custom-tabs" :height="isScrolled ? 80 : 100" show-arrows align-tabs="center">
        <v-tab to="/" :ripple="false" class="font-weight-bold">Inicio</v-tab>
        <!-- Caso 1: No registrado -->
        <template v-if="!isAuthenticated">
          <v-tab to="/conocenos" :ripple="false" class="font-weight-bold">Conócenos</v-tab>
          <v-tab to="/galeria" :ripple="false" class="font-weight-bold">Galería</v-tab>
          <v-tab to="/citas" :ripple="false" class="font-weight-bold">Citas</v-tab>
          <v-tab to="/login" :ripple="false" class="font-weight-bold">
            LogIn
          </v-tab>
        </template>
        <!-- Caso 2: Registrado user -->
        <template v-else-if="userRole === 'user' || userRole === 'cliente'">
          <v-tab to="/conocenos" :ripple="false" class="font-weight-bold">Conócenos</v-tab>
          <v-tab to="/galeria" :ripple="false" class="font-weight-bold">Galería</v-tab>
          <v-tab to="/citas" :ripple="false" class="font-weight-bold">Citas</v-tab>
          <v-tab @click.prevent="logout" :ripple="false" class="font-weight-bold">
            Logout
          </v-tab>
        </template>
        <!-- Caso 3: Registrado empleado -->
        <template v-else-if="userRole === 'empleado'">
          <v-tab to="/citas-empleados-admin" :ripple="false" class="font-weight-bold">Citas</v-tab>
          <v-tab to="/mes-completo" :ripple="false" class="font-weight-bold">Mes Completo</v-tab>
          <v-tab @click.prevent="logout" :ripple="false" class="font-weight-bold">
            Logout
          </v-tab>
        </template>
        <!-- Caso 4: Registrado admin -->
        <template v-else-if="userRole === 'admin'">
          <v-tab to="/empleados" :ripple="false" class="font-weight-bold">Empleados</v-tab>
          <v-tab to="/servicios" :ripple="false" class="font-weight-bold">Servicios</v-tab>
          <v-tab to="/citas-empleados-admin" :ripple="false" class="font-weight-bold">Citas</v-tab>
          <v-tab to="/mes-completo" :ripple="false" class="font-weight-bold">Mes Completo</v-tab>
          <v-tab to="/usuarios" :ripple="false" class="font-weight-bold">Usuarios</v-tab>
          <v-tab to="/galeria" :ripple="false" class="font-weight-bold">Galeria</v-tab>
          <v-tab @click.prevent="logout" :ripple="false" class="font-weight-bold">
            Logout
          </v-tab>
        </template>
      </v-tabs>
    </div>
    
    <!-- Botón de menú para móviles -->
    <v-app-bar-nav-icon 
      @click="drawer = !drawer" 
      class="d-md-none hamburguesa-icon"
      color="primary"
      size="40"
    ></v-app-bar-nav-icon>
  </v-app-bar>

  <!-- Drawer para navegación móvil -->
  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="right"
    width="280"
  >
    <v-list>
      <v-list-item>
        <v-img
          class="mx-auto my-4"
          src="../assets/Logo.png"
          alt="Logo"
          contain
          max-width="100"
        />
      </v-list-item>
      
      <v-divider></v-divider>
      
      <!-- Caso 1: No registrado -->
      <template v-if="!isAuthenticated">
        <v-list-item
          to="/conocenos"
          :active="currentRoute === '/conocenos'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-information-outline"></v-icon>
          </template>
          <v-list-item-title>Conócenos</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/galeria"
          :active="currentRoute === '/galeria'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-image-multiple"></v-icon>
          </template>
          <v-list-item-title>Galería</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/citas"
          :active="currentRoute === '/citas'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-calendar"></v-icon>
          </template>
          <v-list-item-title>Citas</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/login"
          :active="currentRoute === '/login'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-login"></v-icon>
          </template>
          <v-list-item-title>LogIn</v-list-item-title>
        </v-list-item>
      </template>
      
      <!-- Caso 2: Registrado user -->
      <template v-else-if="userRole === 'user' || userRole === 'cliente'">
        <v-list-item
          to="/conocenos"
          :active="currentRoute === '/conocenos'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-information-outline"></v-icon>
          </template>
          <v-list-item-title>Conócenos</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/galeria"
          :active="currentRoute === '/galeria'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-image-multiple"></v-icon>
          </template>
          <v-list-item-title>Galería</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/citas"
          :active="currentRoute === '/citas'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-calendar"></v-icon>
          </template>
          <v-list-item-title>Citas</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          @click="logout"
          active-color="error"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-logout" color="error"></v-icon>
          </template>
          <v-list-item-title class="text-error">Logout</v-list-item-title>
        </v-list-item>
      </template>
      
      <!-- Caso 3: Registrado empleado -->
      <template v-else-if="userRole === 'empleado'">
        <v-list-item
          to="/citas-empleados-admin"
          :active="currentRoute === '/citas-empleados-admin'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-calendar-check"></v-icon>
          </template>
          <v-list-item-title>Citas</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/mes-completo"
          :active="currentRoute === '/mes-completo'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-calendar-month"></v-icon>
          </template>
          <v-list-item-title>Mes Completo</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          @click="logout"
          active-color="error"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-logout" color="error"></v-icon>
          </template>
          <v-list-item-title class="text-error">Logout</v-list-item-title>
        </v-list-item>
      </template>
      
      <!-- Caso 4: Registrado admin -->
      <template v-else-if="userRole === 'admin'">
        <v-list-item
          to="/empleados"
          :active="currentRoute === '/empleados'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-account-group"></v-icon>
          </template>
          <v-list-item-title>Empleados</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/servicios"
          :active="currentRoute === '/servicios'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-content-cut"></v-icon>
          </template>
          <v-list-item-title>Servicios</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/citas-empleados-admin"
          :active="currentRoute === '/citas-empleados-admin'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-calendar-check"></v-icon>
          </template>
          <v-list-item-title>Citas</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/mes-completo"
          :active="currentRoute === '/mes-completo'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-calendar-month"></v-icon>
          </template>
          <v-list-item-title>Mes Completo</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/usuarios"
          :active="currentRoute === '/usuarios'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-account-multiple"></v-icon>
          </template>
          <v-list-item-title>Usuarios</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          to="/galeria"
          :active="currentRoute === '/galeria'"
          active-color="primary"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-image-multiple"></v-icon>
          </template>
          <v-list-item-title>Galeria</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          @click="logout"
          active-color="error"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-logout" color="error"></v-icon>
          </template>
          <v-list-item-title class="text-error">Logout</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.header-section {
  background-color: var(--main-bg-color);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.4s ease;
  border-bottom: 2px solid rgba(245, 224, 9, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-dark {
  background-color: rgba(101, 101, 101, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.header-scrolled {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.header-hidden {
  transform: translateY(-100%);
  box-shadow: none;
}

.logo-image {
  display: block;
  transition: all 0.3s ease;
  object-fit: contain;
}

.logo-image:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 8px rgba(245, 224, 9, 0.6));
}

.custom-tabs {
  height: 100%;
  transition: all 0.3s ease;
}

.custom-tabs :deep(.v-tab) {
  color: var(--text-color);
  font-family: var(--font-primary);
  font-size: 22px;
  letter-spacing: 1px;
  text-transform: none;
  margin: 0 4px;
  min-width: 0;
  padding: 0 16px;
  height: 100%;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0.9;
}

.header-scrolled .custom-tabs :deep(.v-tab) {
  font-size: 20px;
}

.custom-tabs :deep(.v-tab::after) {
  content: '';
  position: absolute;
  bottom: 12px;
  left: 50%;
  width: 0;
  height: 3px;
  background-color: var(--accent-color);
  transform: translateX(-50%);
  transition: width 0.3s ease, height 0.2s ease;
  border-radius: 4px;
}

.custom-tabs :deep(.v-tab:hover::after),
.custom-tabs :deep(.v-tab--selected::after) {
  width: 70%;
}

.custom-tabs :deep(.v-tab:hover),
.custom-tabs :deep(.v-tab--selected) {
  color: var(--accent-color);
  transform: translateY(-2px);
  opacity: 1;
  text-shadow: 0 0 10px rgba(245, 224, 9, 0.4);
}

/* Efecto especial para el botón de login/logout */
.custom-tabs :deep(.v-tab:last-child) {
  margin-left: 6px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.custom-tabs :deep(.v-tab:last-child:hover) {
  border: 1px solid rgba(245, 224, 9, 0.6);
  background-color: rgba(245, 224, 9, 0.1);
}

/* Drawer styles */
:deep(.v-navigation-drawer) {
  background-color: var(--main-bg-color);
}

:deep(.v-navigation-drawer .v-list) {
  background-color: transparent;
  padding: 12px;
}

:deep(.v-navigation-drawer .v-list-item) {
  margin-bottom: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.v-navigation-drawer .v-list-item:hover) {
  background-color: rgba(245, 224, 9, 0.1);
}

:deep(.v-navigation-drawer .v-list-item.v-list-item--active) {
  background-color: rgba(245, 224, 9, 0.15);
}

:deep(.v-navigation-drawer .v-list-item__title) {
  font-size: 16px;
  font-weight: 500;
  font-family: var(--font-primary);
}

:deep(.v-navigation-drawer .v-divider) {
  margin: 12px 0;
  border-color: rgba(255, 255, 255, 0.1);
}

/* Ajustes responsive */
@media (max-width: 960px) {
  .custom-tabs :deep(.v-tab) {
    font-size: 18px;
    padding: 0 10px;
  }
}

@media (min-width: 1600px) {
  .custom-tabs :deep(.v-tab) {
    font-size: 24px;
    padding: 0 20px;
  }
}

.hamburguesa-icon {
  min-width: 80px !important;
  min-height: 80px !important;
  width: 80px !important;
  height: 80px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
}
.hamburguesa-icon :deep(svg) {
  width: 80px !important;
  height: 80px !important;
  min-width: 80px !important;
  min-height: 80px !important;
}
@media (max-width: 600px) {
  .hamburguesa-icon {
    min-width: 96px !important;
    min-height: 96px !important;
    width: 96px !important;
    height: 96px !important;
  }
  .hamburguesa-icon :deep(svg) {
    width: 96px !important;
    height: 96px !important;
    min-width: 96px !important;
    min-height: 96px !important;
  }
}
@media (min-width: 960px) {
  .hamburguesa-icon {
    display: none !important;
  }
}
</style>
