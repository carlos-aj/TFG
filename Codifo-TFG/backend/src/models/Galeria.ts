import { Model } from 'objection';

export interface IGaleria {
  id: number;
  barbero: string;
  imagenes: string[];
  created_at?: string;
  updated_at?: string;
}

export class Galeria extends Model implements IGaleria {
  id!: number;
  barbero: string;
  imagenes!: string[];
  created_at?: string;
  updated_at?: string;

  static tableName = 'galeria';
}