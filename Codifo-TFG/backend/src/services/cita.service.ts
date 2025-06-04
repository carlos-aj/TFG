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

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number);
  const date = new Date(0, 0, 0, h, m + minutos);
  return date.toTimeString().slice(0, 5);
}

export async function puedeInvitar(barbero_id: number, fecha: string, hora: string) {
  // Calcula las horas adyacentes
  const horaAntes = sumarMinutos(hora, -30);
  const horaDespues = sumarMinutos(hora, 30);

  // Busca si hay citas ocupadas en las horas adyacentes (con cualquier barbero)
  const citaAntes = await Cita.query().where({ fecha, hora: horaAntes }).first();
  const citaDespues = await Cita.query().where({ fecha, hora: horaDespues }).first();

  // Si alguna de las horas adyacentes está libre (no hay cita), se puede invitar
  const puedeInvitar = !citaAntes || !citaDespues;

  // Opcional: si solo quieres que haya al menos un hueco libre, usa:
  // const puedeInvitar = !citaAntes || !citaDespues;

  console.log('citaAntes:', citaAntes);
  console.log('citaDespues:', citaDespues);
  console.log('puedeInvitar:', puedeInvitar);

  return puedeInvitar;
}

