import { Cita, ICita } from '../models/Cita';
import { User } from '../models/User';
import { Barbero } from '../models/Barbero';
import { Servicio } from '../models/Servicio';

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

export async function findCitaByBarberoFechaHora(barbero_id: number, fecha: string, hora: string) {
  return await Cita.query().where({ barbero_id, fecha, hora }).first();
}

export async function getCitaInfoForEmail(data: any) {
  const [user, barbero, servicio] = await Promise.all([
    User.query().findById(data.user_id),
    Barbero.query().findById(data.barbero_id),
    Servicio.query().findById(data.servicio_id),
  ]);
  return { user, barbero, servicio };
}

