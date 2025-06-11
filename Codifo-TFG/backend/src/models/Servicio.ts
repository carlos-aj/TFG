import { Model } from 'objection';
// Eliminamos la importación directa para evitar ciclos
// import { Cita } from './Cita';

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

  static tableName = 'servicio';

  // Usamos una función para definir las relaciones para evitar ciclos
  static get relationMappings() {
    // Importamos el modelo dentro de la función para evitar ciclos
    const { Cita } = require('./Cita');
    
    return {
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
}
