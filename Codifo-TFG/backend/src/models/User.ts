import { Model } from 'objection';
// Eliminamos la importación directa para evitar ciclos
// import { Cita } from './Cita';

export interface IUser {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  contrasena: string;
  telefono: string;
  penalizacion: number;
  rol: string;
  auth_token?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export class User extends Model implements IUser {
  id!: number;
  nombre!: string;
  apellidos!: string;
  email!: string;
  contrasena!: string;
  telefono!: string;
  penalizacion!: number;
  rol!: string;
  auth_token?: string | null;
  is_verified!: boolean;
  created_at!: string;
  updated_at!: string;

  static tableName = 'users';

  // Usamos una función para definir las relaciones para evitar ciclos
  static get relationMappings() {
    // Importamos el modelo dentro de la función para evitar ciclos
    const { Cita } = require('./Cita');
    
    return {
      citas: {
        relation: Model.HasManyRelation,
        modelClass: Cita,
        join: {
          from: 'users.id', // Corregimos el nombre de la tabla
          to: 'cita.user_id'
        }
      }
    };
  }
}
