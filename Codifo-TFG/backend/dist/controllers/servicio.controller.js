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
exports.getServicioById = getServicioById;
exports.getAllServicios = getAllServicios;
exports.createServicio = createServicio;
exports.deleteServicio = deleteServicio;
exports.updateServicio = updateServicio;
const ServicioService = __importStar(require("../services/servicio.service"));
async function getServicioById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const servicio = await ServicioService.getServicioById(id);
        if (!servicio) {
            res.status(404).json({ message: 'Service not found' });
        }
        res.json(servicio);
    }
    catch (err) {
        console.error('Error getting service:', err);
        res.status(500).json({ message: 'Error getting service' });
    }
}
async function getAllServicios(req, res) {
    try {
        const servicios = await ServicioService.getAllServicios();
        res.json(servicios);
    }
    catch (err) {
        console.error('Error getting services:', err);
        res.status(500).json({ message: 'Error getting services' });
    }
}
async function createServicio(req, res) {
    try {
        const newServicio = req.body;
        const service = await ServicioService.createServicio(newServicio);
        res.status(201).json(service);
    }
    catch (err) {
        console.error('Error creating service:', err);
        res.status(500).json({ message: 'Error creating service' });
    }
}
async function deleteServicio(req, res) {
    try {
        const id = parseInt(req.params.id);
        const serviceDeleted = await ServicioService.deleteServicio(id);
        if (serviceDeleted === 0) {
            res.status(404).json({ message: 'Barber not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ message: 'Error deleting service' });
    }
}
async function updateServicio(req, res) {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        const serviceUpdated = await ServicioService.updateServicio(data, id);
        if (!serviceUpdated) {
            res.status(404).json({ message: 'Service not found' });
        }
        res.json(serviceUpdated);
    }
    catch (err) {
        console.error('Error updating service:', err);
        res.status(500).json({ message: 'Error updating service' });
    }
}
