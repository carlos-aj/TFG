exports.seed = async function(knex) {
  await knex('galeria').del(); // Borra primero la galería
  await knex('barbero').del();
  await knex.raw('ALTER SEQUENCE barbero_id_seq RESTART WITH 1');
  await knex('barbero').insert([
    { nombre: 'Malik Johnson', especialidad: 'Fade de precisión', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Luka Petrov', especialidad: 'Tinte y diseños con navaja', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Santi Rivas', especialidad: 'Cortes clásicos', created_at: new Date(), updated_at: new Date() },
  ]);
};