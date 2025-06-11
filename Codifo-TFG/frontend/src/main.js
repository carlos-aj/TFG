import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { es } from 'vuetify/locale'
import { checkAuthenticated, getUserRole } from './utils/auth'

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
  { path: '/empleados', component: Empleados, meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/usuarios', component: Usuarios, meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/mes-completo', component: MesCompleto, meta: { requiresAuth: true, requiredRole: ['admin', 'empleado'] } },
  { path: '/servicios', component: Servicios, meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/citas-empleados-admin', component: CitasEmpleadosAdmin, meta: { requiresAuth: true, requiredRole: ['admin', 'empleado'] } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }, 
]

// Crea el router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  // Verificar si el usuario está autenticado
  const authenticated = checkAuthenticated();
  const userRole = getUserRole();
  
  console.log('Navegación:', { 
    ruta: to.path, 
    requiereAuth: to.meta.requiresAuth, 
    autenticado: authenticated,
    rol: userRole
  });

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !authenticated) {
    console.log('Redirigiendo a login: ruta protegida sin autenticación');
    next('/login');
    return;
  }
  
  // Si la ruta requiere un rol específico
  if (to.meta.requiredRole && authenticated) {
    const requiredRoles = Array.isArray(to.meta.requiredRole) 
      ? to.meta.requiredRole 
      : [to.meta.requiredRole];
      
    if (!requiredRoles.includes(userRole)) {
      console.log('Acceso denegado: rol incorrecto');
      // Redirigir según el rol actual
      if (userRole === 'admin' || userRole === 'empleado') {
        next('/citas-empleados-admin');
      } else {
        next('/citas');
      }
      return;
    }
  }
  
  // Si el usuario ya está autenticado y trata de ir a login
  if (to.path === '/login' && authenticated) {
    // Redirigir según el rol
    if (userRole === 'admin' || userRole === 'empleado') {
      console.log('Usuario ya autenticado, redirigiendo a panel admin/empleado');
      next('/citas-empleados-admin');
    } else {
      console.log('Usuario ya autenticado, redirigiendo a citas');
      next('/citas');
    }
    return;
  }
  
  // En cualquier otro caso, permitir la navegación
  next();
});

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
