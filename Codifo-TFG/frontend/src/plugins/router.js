import { createRouter, createWebHistory } from 'vue-router'
import { checkAuthenticated, getUserRole } from '../utils/auth'

import Landing from '../components/Landing.vue'
import Login from '../components/Login.vue'
import Citas from '../components/Citas.vue'
import Conocenos from '../components/Conocenos.vue'
import Galeria from '../components/Galeria.vue'
import Register from '../components/Register.vue'
import Confirm from '../components/Confirm.vue'
import Empleados from '../components/Empleados.vue'
import Usuarios from '../components/Usuarios.vue'
import MesCompleto from '../components/MesCompleto.vue'
import Servicios from '../components/Servicios.vue'
import CitasEmpleadosAdmin from '../components/CitasEmpleadosAdmin.vue'
import NotFound from '../components/404.vue'
import CitaExito from '../components/CitaExito.vue'

const routes = [
  { path: '/', component: Landing, name: 'home', meta: { requiresAuth: false } },
  { path: '/login', component: Login, name: 'login', meta: { requiresAuth: false } },
  { path: '/citas', component: Citas, name: 'citas', meta: { requiresAuth: true, roles: ['user', 'admin', 'empleado'] } },
  { path: '/conocenos', component: Conocenos, name: 'conocenos', meta: { requiresAuth: false } },
  { path: '/galeria', component: Galeria, name: 'galeria', meta: { requiresAuth: false } },
  { path: '/register', component: Register, name: 'register', meta: { requiresAuth: false } },
  { path: '/confirm', component: Confirm, name: 'confirm', meta: { requiresAuth: false } },
  { path: '/cita-exito', component: CitaExito, name: 'cita-exito', meta: { requiresAuth: true, roles: ['user', 'admin', 'empleado'] } },
  { path: '/empleados', component: Empleados, name: 'empleados', meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/usuarios', component: Usuarios, name: 'usuarios', meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/mes-completo', component: MesCompleto, name: 'mes-completo', meta: { requiresAuth: true, requiredRole: ['admin', 'empleado'] } },
  { path: '/servicios', component: Servicios, name: 'servicios', meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/citas-empleados-admin', component: CitasEmpleadosAdmin, name: 'citas-empleados-admin', meta: { requiresAuth: true, requiredRole: ['admin', 'empleado'] } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }, 
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  try {
    const authenticated = checkAuthenticated();
    const userRole = getUserRole();

    if (to.meta.requiresAuth && !authenticated) {
      next({ name: 'login' });
      return;
    }
    
    if (to.meta.requiredRole && authenticated) {
      const requiredRoles = Array.isArray(to.meta.requiredRole) 
        ? to.meta.requiredRole 
        : [to.meta.requiredRole];
        
      if (!requiredRoles.includes(userRole)) {
        if (userRole === 'admin' || userRole === 'empleado') {
          next({ name: 'citas-empleados-admin' });
        } else {
          next({ name: 'citas' });
        }
        return;
      }
    }
    
    if (to.path === '/login' && authenticated) {
      if (userRole === 'admin' || userRole === 'empleado') {
        next({ name: 'citas-empleados-admin' });
      } else {
        next({ name: 'citas' });
      }
      return;
    }
    
    next();
  } catch (error) {
    console.error('Error en navegación:', error);
    next({ name: 'home' });
  }
});

export default router; 