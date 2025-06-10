import Knex from 'knex';
import { Model } from 'objection';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile');
const environmentConfig = config[environment];

if (!environmentConfig) {
  console.error(`No se encontró configuración para el entorno: ${environment}`);
  console.error('Configuraciones disponibles:', Object.keys(config));
  process.exit(1);
}

console.log(`Conectando a la base de datos en entorno: ${environment}`);
const knex = Knex(environmentConfig);

// Inicializar Objection.js
Model.knex(knex);

export default knex;