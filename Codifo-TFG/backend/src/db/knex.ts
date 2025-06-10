const dotenv = require('dotenv');
dotenv.config();
import { Model } from 'objection';
import knex from 'knex';
import { Knex } from 'knex';

const db: Knex = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: 'db',
    user: 'postgres',
    password: 'postgres',
    database: 'tfg_db',
  },
  migrations: {
    directory: './migrations'
  }
});

Model.knex(db);

export default db;