import { createApp } from 'vue'
import App from './App.vue'

import { createRouter, createWebHistory } from 'vue-router'

import Landing from './components/Landing.vue'
import Login from './components/Login.vue'
import Citas from './components/Citas.vue'
import Conocenos from './components/Conocenos.vue'
import Galeria from './components/Galeria.vue'
import Register from './components/Register.vue'
import Confirm from './components/Confirm.vue'

// Define las rutas
const routes = [
  { path: '/', component: Landing, meta: { requiresAuth: false } },
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/citas', component: Citas, meta: { requiresAuth: true } },
  { path: '/conocenos', component: Conocenos, meta: { requiresAuth: false } },
  { path: '/galeria', component: Galeria, meta: { requiresAuth: false } },
  { path: '/register', component: Register, meta: { requiresAuth: false } },
  { path: '/confirm', component: Confirm, meta: { requiresAuth: true } },
]

// Crea el router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')
