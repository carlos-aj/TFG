import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'barbershop'
    },
    migrations: {
      directory: path.join(__dirname, '../migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, '../seeds')
    }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, '../migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, '../seeds')
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};

// Asegurarse de que la configuración está correcta
console.log('Configuración de Knex cargada:', Object.keys(config));

module.exports = config; 