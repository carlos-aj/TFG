import { Invitado } from '../models/Invitado';

export async function addInvitado(data: { cita_id: number; nombre: string; servicio_id: number; barbero_id: number; }) {
  return await Invitado.query().insert(data);
}

export async function getInvitadosByCita(cita_id: number) {
  return await Invitado.query().where({ cita_id });
}