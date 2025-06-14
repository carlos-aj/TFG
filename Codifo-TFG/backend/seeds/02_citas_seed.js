/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('cita').del();

  const citas = [];
  const horas = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '16:00', '16:30', '17:00', '17:30'];
  const fechas = [
    '2024-01-10', '2024-01-20', '2024-01-25', '2024-02-12', '2024-02-15', '2024-02-22',
    '2024-03-10', '2024-03-18', '2024-03-22', '2024-04-12', '2024-04-18', '2024-04-20',
    '2024-05-05', '2024-05-10', '2024-05-15', '2024-05-18'
  ];

  const citasPorBarbero = {
    1: 120, 
    2: 60,
    3: 24  
  };

  const popularidadServicio = [0, 0.30, 0.25, 0.20, 0.15, 0.07, 0.03]; 

  let citaId = 1;
  for (let barbero_id = 1; barbero_id <= 3; barbero_id++) {
    for (let n = 0; n < citasPorBarbero[barbero_id]; n++) {
      let servicio_id;
      const r = Math.random();
      let acc = 0;
      for (let i = 1; i <= 6; i++) {
        acc += popularidadServicio[i];
        if (r <= acc) {
          servicio_id = i;
          break;
        }
      }
      const user_id = 5 + Math.floor(Math.random() * 16); 
      const fecha = fechas[Math.floor(Math.random() * fechas.length)];
      const hora = horas[Math.floor(Math.random() * horas.length)];
      const estado = Math.random() > 0.3;
      const pagado = Math.random() > 0.5;
      citas.push({
        id: citaId++,
        user_id,
        barbero_id,
        servicio_id,
        fecha,
        hora,
        estado,
        pagado,
        created_at: new Date(`${fecha}T${hora}`),
        updated_at: new Date(`${fecha}T${hora}`)
      });
    }
  }

  await knex('cita').insert(citas);
};