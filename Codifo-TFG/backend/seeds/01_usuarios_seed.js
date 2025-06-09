const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('users').del();
  await knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const barberoPassword = await bcrypt.hash('barbero123', 10);

  await knex('users').insert([
    {
      nombre: 'Admin',
      apellidos: 'Principal',
      email: 'admin@barberia.com',
      contrasena: passwordHash,
      telefono: '600000001',
      penalizacion: 0,
      rol: 'admin',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Malik',
      apellidos: 'Johnson',
      email: 'malik@barberia.com',
      contrasena: barberoPassword,
      telefono: '600000002',
      penalizacion: 0,
      rol: 'empleado',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Luka',
      apellidos: 'Petrov',
      email: 'luka@barberia.com',
      contrasena: barberoPassword,
      telefono: '600000003',
      penalizacion: 0,
      rol: 'empleado',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Santi',
      apellidos: 'Rivas',
      email: 'santi@barberia.com',
      contrasena: barberoPassword,
      telefono: '600000004',
      penalizacion: 0,
      rol: 'empleado',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};