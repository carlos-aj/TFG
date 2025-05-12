import { Model } from 'objection';
import { Cita } from './Cita';

export class User extends Model {
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

  static relationMappings = {
    citas: {
      relation: Model.HasManyRelation,
      modelClass: Cita,
      join: {
        from: 'users.id',
        to: 'cita.user_id'
      }
    }
  };
}
