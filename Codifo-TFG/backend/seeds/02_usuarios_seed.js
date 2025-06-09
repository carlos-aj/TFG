const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  const userPassword = await bcrypt.hash('user123', 10);

  // Empieza en id 5 porque ya tienes 4 usuarios
  const clientes = [];
  for (let i = 5; i <= 20; i++) {
    clientes.push({
      nombre: `Cliente${i}`,
      apellidos: `Apellido${i}`,
      email: `cliente${i}@barberia.com`,
      contrasena: userPassword,
      telefono: `6000000${i.toString().padStart(2, '0')}`,
      penalizacion: 0,
      rol: 'user',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  await knex('users').insert(clientes);
};