import { Model } from 'objection';

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
  barbero_id?: number | null;
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
  barbero_id?: number | null;
  created_at!: string;
  updated_at!: string;

  static tableName = 'users';

  static get relationMappings() {
    const { Cita } = require('./Cita');
    const { Barbero } = require('./Barbero');
    
    return {
      citas: {
        relation: Model.HasManyRelation,
        modelClass: Cita,
        join: {
          from: 'users.id', 
          to: 'cita.user_id'
        }
      },
      barbero: {
        relation: Model.BelongsToOneRelation,
        modelClass: Barbero,
        join: {
          from: 'users.barbero_id',
          to: 'barbero.id'
        }
      }
    };
  }
}
