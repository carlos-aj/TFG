import { Model } from 'objection';

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

  static get relationMappings() {
    const { Cita } = require('./Cita');
    
    return {
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
}
