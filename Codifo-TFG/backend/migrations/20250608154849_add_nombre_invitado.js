// Ejemplo de migración con Knex.js
// filepath: backend/migrations/xxxxxx_add_nombre_invitado_to_cita.js
exports.up = function(knex) {
  return knex.schema.table('cita', function(table) {
    table.string('nombre_invitado', 255);
  });
};

exports.down = function(knex) {
  return knex.schema.table('cita', function(table) {
    table.dropColumn('nombre_invitado');
  });
};