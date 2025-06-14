"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwnerOrAdmin = exports.hasRole = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({ message: 'No autorizado: token no proporcionado' });
            return;
        }
        const secretKey = process.env.JWT_SECRET || 'tu_clave_secreta';
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'No autorizado: token inválido' });
    }
};
exports.isAuthenticated = isAuthenticated;
const hasRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
                return;
            }
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
const isOwnerOrAdmin = (idParamName = 'id') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
                return;
            }
            if (req.user.rol === 'admin' || req.user.rol === 'empleado') {
                next();
                return;
            }
            const resourceId = req.params[idParamName];
            if (req.user.id === parseInt(resourceId)) {
                next();
                return;
            }
            res.status(403).json({ message: 'Prohibido: no tienes permisos suficientes' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error en la verificación de permisos' });
        }
    };
};
exports.isOwnerOrAdmin = isOwnerOrAdmin;
