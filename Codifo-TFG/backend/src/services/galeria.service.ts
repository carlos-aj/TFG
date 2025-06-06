import { Galeria } from '../models/Galeria';
import fs from 'fs';
import path from 'path';

export async function getGalerias(limit?: number) {
  let query = Galeria.query().withGraphFetched('barbero').orderByRaw('RANDOM()');
  if (limit) {
    query = query.limit(limit);
  }
  return await query;
}


export async function getGaleriaById(id: number) {
  return await Galeria.query().findById(id);
}

export async function createGaleria(barbero_id: number, imagenes: string[]) {
  return await Galeria.query().insert({ barbero_id, imagenes });
}

export async function updateGaleria(id: number, barbero_id: number, imagenes: string[]) {
  return await Galeria.query().patchAndFetchById(id, { barbero_id, imagenes });
}

export async function deleteGaleria(id: number) {
  // 1. Obtén la galería para saber los nombres de las imágenes
  const galeria = await Galeria.query().findById(id);
  if (!galeria) return 0;

  // 2. Elimina los archivos de imagen
  if (Array.isArray(galeria.imagenes)) {
    for (const img of galeria.imagenes) {
      const imgPath = path.join(__dirname, '../ApiGaleria', img);
      try {
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      } catch (err) {
        // Puedes loguear el error si quieres
        console.error(`Error eliminando imagen ${imgPath}:`, err);
      }
    }
  }

  // 3. Elimina la galería de la base de datos
  return await Galeria.query().deleteById(id);
}