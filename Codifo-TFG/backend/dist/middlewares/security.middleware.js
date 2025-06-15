"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectApi = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protectApi = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);
    if (!token && !isPublicRoute(req.path, req.method)) {
        res.status(401).json({
            message: 'Acceso denegado. Inicia sesión para acceder a esta ruta.',
            error: 'UNAUTHORIZED'
        });
        return;
    }
    if (token && !isPublicRoute(req.path, req.method)) {
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                console.error('JWT_SECRET no está definido en las variables de entorno');
                next();
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (err) {
            console.warn('Token inválido en protectApi, continuando...', err);
        }
    }
    next();
};
exports.protectApi = protectApi;
const publicRoutes = [
    '/webhook/stripe',
    '/ApiGaleria',
    '/api/user/login',
    '/api/user/logout',
    '/api/user/confirm',
    '/api/galeria',
    '/galeria',
    '/api/barbero',
    '/api/servicio',
    '/api/cita/check/puede-invitar',
    '/api/cita/puede-invitar/check'
];
const isPublicRoute = (path, method) => {
    if (path === '/api/user/login' || path === '/api/user' && method === 'POST') {
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
    if (path === '/api/cita' && method === 'GET') {
        return true;
    }
    return false;
};
