/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('servicios', function(table) {
      table.increments('id').primary();
      table.string('nombre').notNullable();
      table.float('precio').notNullable();
      table.integer('duracion').notNullable();
      table.timestamps(true, true);
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('servicios');
  };
  