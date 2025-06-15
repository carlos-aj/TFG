"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwnerOrAdmin = exports.hasRole = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else {
            token = req.cookies?.token;
        }
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.error('JWT_SECRET no está definido en las variables de entorno');
            res.status(500).json({ message: 'Error en la configuración del servidor' });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId || decoded.id;
            if (!userId) {
                res.status(401).json({ message: 'Invalid token: no user ID' });
                return;
            }
            const user = await User_1.User.query().findById(userId);
            if (!user) {
                res.status(401).json({ message: 'User not found' });
                return;
            }
            req.user = user;
            next();
        }
        catch (jwtError) {
            console.error('Error al verificar el token JWT:', jwtError);
            res.status(401).json({ message: 'Invalid token' });
        }
    }
    catch (err) {
        console.error('Error de autenticación:', err);
        res.status(401).json({ message: 'Authentication error' });
    }
};
exports.isAuthenticated = isAuthenticated;
const hasRole = (roles) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }
            const userRole = user.rol === 'user' ? 'cliente' : user.rol;
            if (roles.includes(userRole)) {
                next();
                return;
            }
            res.status(403).json({ message: 'Insufficient permissions' });
        }
        catch (err) {
            res.status(500).json({ message: 'Error checking permissions' });
        }
    };
};
exports.hasRole = hasRole;
const isOwnerOrAdmin = (paramName) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            const resourceId = parseInt(req.params[paramName]);
            if (user.rol === 'admin' || user.rol === 'empleado') {
                next();
                return;
            }
            if (user.id === resourceId) {
                next();
                return;
            }
            res.status(403).json({ message: 'Unauthorized' });
        }
        catch (err) {
            res.status(500).json({ message: 'Error checking authorization' });
        }
    };
};
exports.isOwnerOrAdmin = isOwnerOrAdmin;
