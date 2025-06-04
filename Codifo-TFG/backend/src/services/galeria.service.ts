import { Galeria } from '../models/Galeria';

export async function getGalerias(limit?: number) {
  if (limit) {
    return await Galeria.query().limit(limit);
  }
  return await Galeria.query();
}

export async function getGaleriaById(id: number) {
  return await Galeria.query().findById(id);
}

export async function createGaleria(barbero: string, imagenes: string[]) {
  return await Galeria.query().insert({ barbero, imagenes });
}

export async function updateGaleria(id: number, barbero: string, imagenes: string[]) {
  return await Galeria.query().patchAndFetchById(id, { barbero, imagenes });
}

export async function deleteGaleria(id: number) {
  return await Galeria.query().deleteById(id);
}