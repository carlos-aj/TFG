exports.up = function(knex) {
  return knex.schema.createTable('invitado', function(table) {
    table.increments('id').primary();
    table.integer('cita_id').unsigned().notNullable().references('id').inTable('cita').onDelete('CASCADE');
    table.string('nombre').notNullable();
    table.integer('servicio_id').unsigned().notNullable().references('id').inTable('servicios');
    table.integer('barbero_id').unsigned().notNullable().references('id').inTable('barbero');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('invitado');
};