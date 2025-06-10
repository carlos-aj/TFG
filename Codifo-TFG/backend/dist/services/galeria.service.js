"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGalerias = getGalerias;
exports.getGaleriaById = getGaleriaById;
exports.createGaleria = createGaleria;
exports.updateGaleria = updateGaleria;
exports.deleteGaleria = deleteGaleria;
const Galeria_1 = require("../models/Galeria");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function getGalerias(limit) {
    let query = Galeria_1.Galeria.query().withGraphFetched('barbero').orderByRaw('RANDOM()');
    if (limit) {
        query = query.limit(limit);
    }
    return await query;
}
async function getGaleriaById(id) {
    return await Galeria_1.Galeria.query().findById(id);
}
async function createGaleria(barbero_id, imagenes) {
    return await Galeria_1.Galeria.query().insert({ barbero_id, imagenes });
}
async function updateGaleria(id, barbero_id, imagenes) {
    return await Galeria_1.Galeria.query().patchAndFetchById(id, { barbero_id, imagenes });
}
async function deleteGaleria(id) {
    // 1. Obtén la galería para saber los nombres de las imágenes
    const galeria = await Galeria_1.Galeria.query().findById(id);
    if (!galeria)
        return 0;
    // 2. Elimina los archivos de imagen
    if (Array.isArray(galeria.imagenes)) {
        for (const img of galeria.imagenes) {
            const imgPath = path_1.default.join(__dirname, '../ApiGaleria', img);
            try {
                if (fs_1.default.existsSync(imgPath)) {
                    fs_1.default.unlinkSync(imgPath);
                }
            }
            catch (err) {
                // Puedes loguear el error si quieres
                console.error(`Error eliminando imagen ${imgPath}:`, err);
            }
        }
    }
    // 3. Elimina la galería de la base de datos
    return await Galeria_1.Galeria.query().deleteById(id);
}
