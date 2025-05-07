exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('nombre').notNullable();
        table.string('apellidos').notNullable();
        table.string('email').notNullable().unique();
        table.string('contrasena').notNullable();
        table.string('telefono').notNullable();
        table.integer('penalizacion').defaultTo(0);
        table.string('rol').notNullable();
        table.string('auth_token').nullable();
        table.boolean('is_verified').defaultTo(false);
        table.timestamps(true, true); 
    });
  };
  
exports.down = function(knex) {
    return knex.schema.dropTable('users');
  };
  
