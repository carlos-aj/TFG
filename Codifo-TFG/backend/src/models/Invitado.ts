import { Model } from 'objection';

export interface IInvitado {
  id: number;
  cita_id: number;
  nombre: string;
  servicio_id: number;
  barbero_id: number;
}

export class Invitado extends Model implements IInvitado {
  id!: number;
  cita_id!: number;
  nombre!: string;
  servicio_id!: number;
  barbero_id!: number;

  static tableName = 'invitado';
}