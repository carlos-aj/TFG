import { Model } from 'objection';

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

  static get tableName() {
    return 'users';
  }
}
