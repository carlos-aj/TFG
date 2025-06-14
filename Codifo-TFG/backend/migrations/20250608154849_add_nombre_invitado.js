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