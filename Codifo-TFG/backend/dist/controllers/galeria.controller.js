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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGalerias = getGalerias;
exports.getGaleriaById = getGaleriaById;
exports.createGaleria = createGaleria;
exports.updateGaleria = updateGaleria;
exports.deleteGaleria = deleteGaleria;
exports.getImagenByName = getImagenByName;
const GaleriaService = __importStar(require("../services/galeria.service"));
const path_1 = __importDefault(require("path"));
async function getGalerias(req, res) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const galerias = await GaleriaService.getGalerias(limit);
        res.json(galerias);
    }
    catch (error) {
        console.error('Error en getGalerias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
async function getGaleriaById(req, res) {
    try {
        const galeria = await GaleriaService.getGaleriaById(Number(req.params.id));
        if (!galeria) {
            res.status(404).json({ message: 'No encontrada' });
            return;
        }
        res.json(galeria);
    }
    catch (error) {
        console.error('Error en getGaleriaById:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
async function createGaleria(req, res) {
    try {
        const { barbero_id, imagenes } = req.body;
        if (!barbero_id || !imagenes) {
            res.status(400).json({ message: 'Faltan datos' });
            return;
        }
        const nueva = await GaleriaService.createGaleria(barbero_id, imagenes);
        res.status(201).json(nueva);
    }
    catch (error) {
        console.error('Error en createGaleria:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
async function updateGaleria(req, res) {
    try {
        const { barbero, imagenes } = req.body;
        const galeria = await GaleriaService.updateGaleria(Number(req.params.id), barbero, imagenes);
        if (!galeria) {
            res.status(404).json({ message: 'No encontrada' });
            return;
        }
        res.json(galeria);
    }
    catch (error) {
        console.error('Error en updateGaleria:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
async function deleteGaleria(req, res) {
    try {
        const numDeleted = await GaleriaService.deleteGaleria(Number(req.params.id));
        if (!numDeleted) {
            res.status(404).json({ message: 'No encontrada' });
            return;
        }
        res.json({ message: 'Eliminada correctamente' });
    }
    catch (error) {
        console.error('Error en deleteGaleria:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
async function getImagenByName(req, res) {
    try {
        const { filename } = req.params;
        const imagePath = path_1.default.join(__dirname, '../ApiGaleria', filename);
        res.sendFile(imagePath, (err) => {
            if (err) {
                console.error('Error al enviar imagen:', err);
                console.error('Path intentado:', imagePath);
                res.status(404).send('Imagen no encontrada');
            }
        });
    }
    catch (error) {
        console.error('Error en getImagenByName:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
