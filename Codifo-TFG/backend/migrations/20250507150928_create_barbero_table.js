/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('barbero', function(table) {
      table.increments('id').primary();
      table.string('nombre').notNullable();
      table.string('especialidad').notNullable();
      table.timestamps(true, true); 
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('barbero');
  };
  