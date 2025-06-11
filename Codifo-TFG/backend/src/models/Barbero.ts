import { Model } from 'objection';
// Eliminamos la importación directa para evitar ciclos
// import { Cita } from './Cita';

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

  // Usamos una función para definir las relaciones para evitar ciclos
  static get relationMappings() {
    // Importamos el modelo dentro de la función para evitar ciclos
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
