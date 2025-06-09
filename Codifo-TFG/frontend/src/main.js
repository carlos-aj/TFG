import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { es } from 'vuetify/locale' // <-- Añade esta línea

import Landing from './components/Landing.vue'
import Login from './components/Login.vue'
import Citas from './components/Citas.vue'
import Conocenos from './components/Conocenos.vue'
import Galeria from './components/Galeria.vue'
import Register from './components/Register.vue'
import Confirm from './components/Confirm.vue'
import Empleados from './components/Empleados.vue'
import Usuarios from './components/Usuarios.vue'
import MesCompleto from './components/MesCompleto.vue'
import Servicios from './components/Servicios.vue'
import CitasEmpleadosAdmin from './components/CitasEmpleadosAdmin.vue'
import NotFound from './components/404.vue'


// Define las rutas
const routes = [
  { path: '/', component: Landing, meta: { requiresAuth: false } },
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/citas', component: Citas, meta: { requiresAuth: true } },
  { path: '/conocenos', component: Conocenos, meta: { requiresAuth: false } },
  { path: '/galeria', component: Galeria, meta: { requiresAuth: false } },
  { path: '/register', component: Register, meta: { requiresAuth: false } },
  { path: '/confirm', component: Confirm, meta: { requiresAuth: false } },
  { path: '/empleados', component: Empleados, meta: { requiresAuth: true } },
  { path: '/usuarios', component: Usuarios, meta: { requiresAuth: true } },
  { path: '/mes-completo', component: MesCompleto, meta: { requiresAuth: true } },
  { path: '/servicios', component: Servicios, meta: { requiresAuth: true } },
  { path: '/citas-empleados-admin', component: CitasEmpleadosAdmin, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }, 
]

// Crea el router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token') // O ajusta según tu lógica de auth

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'es',
    messages: { es },
  },
})

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')
