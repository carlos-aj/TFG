exports.up = function(knex) {
  return knex.schema.createTable('galeria', function(table) {
    table.increments('id').primary();
    table.integer('barbero_id').unsigned().references('id').inTable('barbero').notNullable();
    table.specificType('imagenes', 'text[]').notNullable(); 
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('galeria');
};