import { Model } from 'objection';

export interface IServicio {
  id: number;
  nombre: string;
  precio: number;
  duracion: number;
  created_at: string;
  updated_at: string;
}

export class Servicio extends Model implements IServicio {
  id!: number;
  nombre!: string;
  precio!: number;
  duracion!: number;
  created_at!: string;
  updated_at!: string;

  static tableName = 'servicios';

  static get relationMappings() {
    const { Cita } = require('./Cita');
    
    return {
      citas: {
        relation: Model.HasManyRelation,
        modelClass: Cita,
        join: {
          from: 'servicios.id',
          to: 'cita.servicio_id'
        }
      }
    };
  }
}
