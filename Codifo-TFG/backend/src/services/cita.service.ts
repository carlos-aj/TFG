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

export async function puedeInvitar(barbero_id: number, fecha: string, hora: string) {
  // Busca si hay alguna cita en esa fecha y hora (con cualquier barbero)
  const citaExistente = await Cita.query()
    .where('fecha', fecha)
    .where('hora', hora)
    .first();

  // Si NO hay ninguna cita, puedes invitar
  return !citaExistente;
}

export async function getBarberoNombreById(id: number) {
  const barbero = await Barbero.query().findById(id);
  return barbero ? barbero.nombre : id;
}

export async function getCitasByBarberoYFecha(barbero_id: number, fecha: string) {
  console.log('getCitasByBarberoYFecha', barbero_id, fecha);
  return await Cita.query()
    .where('barbero_id', barbero_id)
    .whereRaw('fecha::date = ?', [fecha]);
}

