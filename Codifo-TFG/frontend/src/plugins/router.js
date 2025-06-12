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
import AsignarBarberos from '../components/AsignarBarberos.vue'
import NotFound from '../components/404.vue'
import CitaExito from '../components/CitaExito.vue'

// Define las rutas
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
  { path: '/asignar-barberos', component: AsignarBarberos, name: 'asignar-barberos', meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }, 
]

// Crea el router
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Siempre vuelve al inicio cuando se navega
    return { top: 0 }
  }
})

// Navegación global
router.beforeEach((to, from, next) => {
  try {
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
      next({ name: 'login' });
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
          next({ name: 'citas-empleados-admin' });
        } else {
          next({ name: 'citas' });
        }
        return;
      }
    }
    
    // Si el usuario ya está autenticado y trata de ir a login
    if (to.path === '/login' && authenticated) {
      // Redirigir según el rol
      if (userRole === 'admin' || userRole === 'empleado') {
        console.log('Usuario ya autenticado, redirigiendo a panel admin/empleado');
        next({ name: 'citas-empleados-admin' });
      } else {
        console.log('Usuario ya autenticado, redirigiendo a citas');
        next({ name: 'citas' });
      }
      return;
    }
    
    // En cualquier otro caso, permitir la navegación
    next();
  } catch (error) {
    console.error('Error en navegación:', error);
    next({ name: 'home' });
  }
});

export default router; 