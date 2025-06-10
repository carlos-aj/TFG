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
exports.getGalerias = getGalerias;
exports.getGaleriaById = getGaleriaById;
exports.createGaleria = createGaleria;
exports.updateGaleria = updateGaleria;
exports.deleteGaleria = deleteGaleria;
const GaleriaService = __importStar(require("../services/galeria.service"));
async function getGalerias(req, res) {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const galerias = await GaleriaService.getGalerias(limit);
    res.json(galerias);
}
async function getGaleriaById(req, res) {
    const galeria = await GaleriaService.getGaleriaById(Number(req.params.id));
    if (!galeria)
        res.status(404).json({ message: 'No encontrada' });
    res.json(galeria);
}
async function createGaleria(req, res) {
    const { barbero_id, imagenes } = req.body;
    if (!barbero_id || !imagenes)
        res.status(400).json({ message: 'Faltan datos' });
    const nueva = await GaleriaService.createGaleria(barbero_id, imagenes);
    res.status(201).json(nueva);
}
async function updateGaleria(req, res) {
    const { barbero, imagenes } = req.body;
    const galeria = await GaleriaService.updateGaleria(Number(req.params.id), barbero, imagenes);
    if (!galeria)
        res.status(404).json({ message: 'No encontrada' });
    res.json(galeria);
}
async function deleteGaleria(req, res) {
    const numDeleted = await GaleriaService.deleteGaleria(Number(req.params.id));
    if (!numDeleted) {
        res.status(404).json({ message: 'No encontrada' });
    }
    else {
        res.json({ message: 'Eliminada correctamente' });
    }
}
