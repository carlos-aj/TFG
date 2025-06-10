"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwnerOrAdmin = exports.hasRole = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    try {
        // Verificar si hay un token en las cookies
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({ message: 'No autorizado: token no proporcionado' });
            return;
        }
        // Verificar el token
        const secretKey = process.env.JWT_SECRET || 'tu_clave_secreta';
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        // Añadir el usuario decodificado a la solicitud
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'No autorizado: token inválido' });
    }
};
exports.isAuthenticated = isAuthenticated;
// Middleware para verificar roles específicos
const hasRole = (roles) => {
    return (req, res, next) => {
        try {
            // Primero verificar si el usuario está autenticado
            if (!req.user) {
                res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
                return;
            }
            // Verificar si el usuario tiene el rol requerido
            if (!roles.includes(req.user.rol)) {
                res.status(403).json({ message: 'Prohibido: no tienes permisos suficientes' });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({ message: 'Error en la verificación de roles' });
        }
    };
};
exports.hasRole = hasRole;
// Middleware para verificar si el usuario es el propietario del recurso o un admin
const isOwnerOrAdmin = (idParamName = 'id') => {
    return (req, res, next) => {
        try {
            // Verificar si el usuario está autenticado
            if (!req.user) {
                res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
                return;
            }
            // Si es admin o empleado, permitir acceso
            if (req.user.rol === 'admin' || req.user.rol === 'empleado') {
                next();
                return;
            }
            // Si es el propietario del recurso, permitir acceso
            const resourceId = req.params[idParamName];
            if (req.user.id === parseInt(resourceId)) {
                next();
                return;
            }
            // Si no es ninguno de los anteriores, denegar acceso
            res.status(403).json({ message: 'Prohibido: no tienes permisos suficientes' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error en la verificación de permisos' });
        }
    };
};
exports.isOwnerOrAdmin = isOwnerOrAdmin;
