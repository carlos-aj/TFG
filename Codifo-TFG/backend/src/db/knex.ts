import { Model } from 'objection';
import knex from 'knex';
import { Knex } from 'knex';

const db: Knex = knex({
  client: 'pg',
  connection: {
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
