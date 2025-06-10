"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const UserController = __importStar(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.userRouter = (0, express_1.Router)();
console.log('user.routes.ts cargado');
// Rutas públicas
exports.userRouter.post('/', UserController.createUser); // Registro de usuarios
exports.userRouter.get('/confirm', UserController.confirmUser); // Confirmación de email
exports.userRouter.post('/login', UserController.login); // Login
exports.userRouter.post('/logout', UserController.logout); // Logout
// Rutas protegidas para admin
exports.userRouter.get('/', auth_middleware_1.isAuthenticated, (0, auth_middleware_1.hasRole)(['admin']), UserController.getAllUsers);
exports.userRouter.post('/:id/sancionar', auth_middleware_1.isAuthenticated, (0, auth_middleware_1.hasRole)(['admin']), UserController.sancionarUsuario);
// Rutas protegidas para el propietario o admin
exports.userRouter.get('/:id', auth_middleware_1.isAuthenticated, (0, auth_middleware_1.isOwnerOrAdmin)('id'), UserController.getUserById);
exports.userRouter.put('/:id', auth_middleware_1.isAuthenticated, (0, auth_middleware_1.isOwnerOrAdmin)('id'), UserController.updateUser);
exports.userRouter.delete('/:id', auth_middleware_1.isAuthenticated, (0, auth_middleware_1.hasRole)(['admin']), UserController.deleteUser);
