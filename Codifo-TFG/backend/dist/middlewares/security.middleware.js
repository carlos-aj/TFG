"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectApi = void 0;
const protectApi = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const token = req.cookies.token;
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
const publicRoutes = [
    '/api/user/login',
    '/api/user/logout',
    '/api/user/confirm',
    '/api/galeria',
    '/galeria',
    '/api/barbero',
    '/api/servicio'
];
const isPublicRoute = (path, method) => {
    if (path === '/api/user/login') {
        return true;
    }
    if (publicRoutes.includes(path)) {
        return true;
    }
    for (const route of publicRoutes) {
        if (path.startsWith(`${route}/`)) {
            return true;
        }
    }
    if (path === '/api/user' && method === 'POST') {
        return true;
    }
    return false;
};
