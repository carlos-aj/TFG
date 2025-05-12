import { Model } from 'objection';
import { Cita } from './Cita';

export class Servicio extends Model {
  id!: number;
  nombre!: string;
  precio!: number;
  duracion!: number;
  created_at!: string;
  updated_at!: string;

  static tableName = 'servicio';

  static relationMappings = {
    citas: {
      relation: Model.HasManyRelation,
      modelClass: Cita,
      join: {
        from: 'servicio.id',
        to: 'cita.servicio_id'
      }
    }
  };
}
