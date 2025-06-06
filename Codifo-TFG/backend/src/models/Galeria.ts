import { Model } from 'objection';

export interface IGaleria {
  id: number;
  barbero_id: number;
  imagenes: string[];
  created_at?: string;
  updated_at?: string;
}

export class Galeria extends Model implements IGaleria {
  id!: number;
  barbero_id!: number;
  imagenes!: string[];
  created_at?: string;
  updated_at?: string;

  static tableName = 'galeria';

  static relationMappings = {
    barbero: {
      relation: Model.BelongsToOneRelation,
      modelClass: require('./Barbero').Barbero,
      join: {
        from: 'galeria.barbero_id',
        to: 'barbero.id'
      }
    }
  };
}