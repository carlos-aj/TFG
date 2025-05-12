import { Model } from 'objection';
import { User } from './User';
import { Barbero } from './Barbero';
import { Servicio } from './Servicio';

export class Cita extends Model {
  id!: number;
  user_id!: number;
  barbero_id!: number;
  servicio_id!: number;
  fecha!: string;
  hora!: string;
  estado!: boolean;
  pagado!: boolean;
  created_at?: string;
  updated_at?: string;

  static tableName = 'cita';

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'cita.user_id',
        to: 'users.id'
      }
    },
    barbero: {
      relation: Model.BelongsToOneRelation,
      modelClass: Barbero,
      join: {
        from: 'cita.barbero_id',
        to: 'barbero.id'
      }
    },
    servicio: {
      relation: Model.BelongsToOneRelation,
      modelClass: Servicio,
      join: {
        from: 'cita.servicio_id',
        to: 'servicio.id'
      }
    }
  };
}
