exports.up = function(knex) {
  return knex.schema.createTable('galeria', function(table) {
    table.increments('id').primary();
    table.string('barbero').notNullable();
    table.specificType('imagenes', 'text[]').notNullable(); 
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('galeria');
};