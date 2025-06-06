exports.seed = async function(knex) {
  await knex('barbero').del();
  await knex('barbero').insert([
    { nombre: 'Malik Johnson', especialidad: 'Fade de precisión', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Luka Petrov', especialidad: 'Tinte y diseños con navaja', created_at: new Date(), updated_at: new Date() },
    { nombre: 'Santi Rivas', especialidad: 'Cortes clásicos', created_at: new Date(), updated_at: new Date() },
  ]);
};