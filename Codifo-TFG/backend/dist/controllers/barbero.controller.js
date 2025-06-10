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
exports.getBarberoById = getBarberoById;
exports.getAllBarberos = getAllBarberos;
exports.createBarbero = createBarbero;
exports.deleteBarbero = deleteBarbero;
exports.updateBarbero = updateBarbero;
const BarberoService = __importStar(require("../services/barbero.service"));
async function getBarberoById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const barbero = await BarberoService.getBarberoById(id);
        if (!barbero) {
            res.status(404).json({ message: 'Barber not found' });
        }
        res.json(barbero);
    }
    catch (err) {
        console.error('Error getting barber:', err);
        res.status(500).json({ message: 'Error getting barber' });
    }
}
async function getAllBarberos(req, res) {
    try {
        const barberos = await BarberoService.getAllBarberos();
        res.json(barberos);
    }
    catch (err) {
        console.error('Error getting barbers:', err);
        res.status(500).json({ message: 'Error getting barbers' });
    }
}
async function createBarbero(req, res) {
    try {
        const newBarbero = req.body;
        const barbero = await BarberoService.createBarbero(newBarbero);
        res.status(201).json(barbero);
    }
    catch (err) {
        console.error('Error creating barber:', err);
        res.status(500).json({ message: 'Error creating barber' });
    }
}
async function deleteBarbero(req, res) {
    try {
        const id = parseInt(req.params.id);
        const barberDeleted = await BarberoService.deleteBarbero(id);
        if (barberDeleted === 0) {
            res.status(404).json({ message: 'Barber not found' });
        }
        res.json({ message: 'Barber deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting barber:', err);
        res.status(500).json({ message: 'Error deleting baber' });
    }
}
async function updateBarbero(req, res) {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        const barberUpdated = await BarberoService.updateBarbero(data, id);
        if (!barberUpdated) {
            res.status(404).json({ message: 'Barber not found' });
        }
        res.json(barberUpdated);
    }
    catch (err) {
        console.error('Error updating barber:', err);
        res.status(500).json({ message: 'Error updating baber' });
    }
}
