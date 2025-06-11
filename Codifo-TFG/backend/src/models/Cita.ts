import { Model } from 'objection';
import { User } from './User';
import { Barbero } from './Barbero';
import { Servicio } from './Servicio';

export interface ICita {
  id: number;
  user_id: number | null;  // Puede ser null para citas de invitados
  barbero_id: number;
  servicio_id: number;
  fecha: string;
  hora: string;
  estado: boolean;
  pagado: boolean;
  created_at?: string;
  updated_at?: string;
  nombre_invitado?: string | null;
}

export class Cita extends Model implements ICita {
  id!: number;
  user_id!: number | null;  // Puede ser null para citas de invitados
  barbero_id!: number;
  servicio_id!: number;
  fecha!: string;
  hora!: string;
  estado!: boolean;
  pagado!: boolean;
  created_at?: string;
  updated_at?: string;
  nombre_invitado?: string | null;

  static tableName = 'cita';

  static jsonSchema = {
    type: 'object',
    required: ['barbero_id', 'servicio_id', 'fecha', 'hora'],
    properties: {
      id: { type: 'integer' },
      user_id: { type: ['integer', 'null'] },  // Puede ser null
      barbero_id: { type: 'integer' },
      servicio_id: { type: 'integer' },
      fecha: { type: 'string', format: 'date' },
      hora: { type: 'string' },
      estado: { type: 'boolean', default: false },
      pagado: { type: 'boolean', default: false },
      nombre_invitado: { type: ['string', 'null'] },
      created_at: { type: 'string' },
      updated_at: { type: 'string' }
    }
  };

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
