import { Model } from 'objection';
import { Cita } from './Cita';

export interface IBarbero {
  id: number;
  nombre: string;
  especialidad: string;
  created_at: string;
  updated_at: string;
}

export class Barbero extends Model implements IBarbero {
  id!: number;
  nombre!: string;
  especialidad!: string;
  created_at!: string;
  updated_at!: string;

  static tableName = 'barbero';

  static relationMappings = {
    citas: {
      relation: Model.HasManyRelation,
      modelClass: Cita,
      join: {
        from: 'barbero.id',
        to: 'cita.barbero_id'
      }
    }
  };
}
