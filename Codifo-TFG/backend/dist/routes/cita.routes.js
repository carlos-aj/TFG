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
exports.citaRouter = void 0;
const express_1 = require("express");
const CitaController = __importStar(require("../controllers/cita.controller"));
const PaymentController = __importStar(require("../controllers/payment.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.citaRouter = (0, express_1.Router)();
// Rutas que requieren autenticación
exports.citaRouter.get('/puede-invitar/check', auth_middleware_1.isAuthenticated, CitaController.checkPuedeInvitar);
exports.citaRouter.post('/pago', auth_middleware_1.isAuthenticated, PaymentController.createCheckoutSession);
// Rutas para usuarios autenticados y admin
// Simplificamos esta ruta ya que protectApi ya verifica el token
exports.citaRouter.get('/', CitaController.getAllCitas);
exports.citaRouter.post('/', auth_middleware_1.isAuthenticated, CitaController.createCita);
// Rutas que requieren ser propietario o admin
exports.citaRouter.get('/:id', auth_middleware_1.isAuthenticated, (0, auth_middleware_1.isOwnerOrAdmin)('id'), CitaController.getCitaById);
exports.citaRouter.put('/:id', auth_middleware_1.isAuthenticated, (0, auth_middleware_1.isOwnerOrAdmin)('id'), CitaController.updateCita);
exports.citaRouter.delete('/:id', auth_middleware_1.isAuthenticated, (0, auth_middleware_1.isOwnerOrAdmin)('id'), CitaController.deleteCita);
