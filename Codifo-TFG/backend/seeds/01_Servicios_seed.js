/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('servicios').del();
  await knex.raw('ALTER SEQUENCE servicios_id_seq RESTART WITH 1');
  await knex('servicios').insert([
    { nombre: 'Fade', precio: 10, duracion: 1 },
    { nombre: 'Fade + Barba', precio: 12, duracion: 1 },
    { nombre: 'Corte Niño', precio: 8, duracion: 1 },
    { nombre: 'Tinte clasico', precio: 20, duracion: 2 },
    { nombre: 'Tinte + diseño', precio: 10, duracion: 2 },
    { nombre: 'Arreglo Cejas', precio: 6, duracion: 1 }
  ]);
};