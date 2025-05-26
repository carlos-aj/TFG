import { Cita, ICita } from '../models/Cita';

export async function getAllCitas() {
  return await Cita.query();
}

export async function getCitaById(id: number) {
  return await Cita.query().findById(id);
}

export async function createCita(data: Partial<ICita>) {
  return await Cita.query().insert(data);
}

export async function updateCita(id: number, data: Partial<ICita>) {
  return await Cita.query().patchAndFetchById(id, data);
}

export async function deleteCita(id: number) {
  return await Cita.query().deleteById(id);
}
