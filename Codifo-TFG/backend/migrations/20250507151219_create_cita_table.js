/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('cita', function(table) {
      table.increments('id').primary();
      
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('barbero_id').unsigned().references('id').inTable('barbero').onDelete('CASCADE');
      table.integer('servicio_id').unsigned().references('id').inTable('servicios').onDelete('CASCADE');
  
      table.date('fecha').notNullable();
      table.time('hora').notNullable();
      
      table.boolean('estado').defaultTo(false); 
      table.boolean('pagado').defaultTo(false);
  
      table.timestamps(true, true);
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('cita');
  };
  