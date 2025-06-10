"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectApi = void 0;
// Middleware para proteger las rutas de la API
const protectApi = (req, res, next) => {
    // Permitir solicitudes OPTIONS (preflight CORS)
    if (req.method === 'OPTIONS') {
        return next();
    }
    // Verificar si la solicitud tiene un token de autenticación
    const token = req.cookies.token;
    // Depuración: registrar información sobre la solicitud
    console.log('Path:', req.path);
    console.log('Method:', req.method);
    console.log('Cookies:', req.cookies);
    console.log('Token:', token);
    // Si no hay token y no es una ruta pública, denegar acceso
    if (!token && !isPublicRoute(req.path, req.method)) {
        res.status(401).json({
            message: 'Acceso denegado. Inicia sesión para acceder a esta ruta.',
            error: 'UNAUTHORIZED'
        });
        return;
    }
    next();
};
exports.protectApi = protectApi;
// Rutas que deben ser públicas (login, registro, etc.)
const publicRoutes = [
    '/api/user/login',
    '/api/user/logout',
    '/api/user/confirm',
    '/api/galeria',
    '/galeria',
    '/api/barbero',
    '/api/servicio',
    '/api/cita' // Añadido temporalmente para pruebas
];
// Función para verificar si una ruta es pública
const isPublicRoute = (path, method) => {
    // Rutas de login y registro siempre son públicas
    if (path === '/api/user/login') {
        return true;
    }
    // Verificar si la ruta es exactamente una ruta pública
    if (publicRoutes.includes(path)) {
        return true;
    }
    // Verificar si la ruta comienza con una ruta pública
    for (const route of publicRoutes) {
        if (path.startsWith(`${route}/`)) {
            return true;
        }
    }
    // Si es una solicitud POST a /api/user (registro)
    if (path === '/api/user' && method === 'POST') {
        return true;
    }
    return false;
};
