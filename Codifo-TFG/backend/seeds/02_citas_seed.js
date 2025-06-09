/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('cita').del();
  await knex('cita').insert([
    { user_id: 5, barbero_id: 1, servicio_id: 1, fecha: '2024-05-10', hora: '10:00', estado: true, pagado: true, created_at: new Date('2024-05-10T09:00:00'), updated_at: new Date('2024-05-10T10:30:00') },
    { user_id: 6, barbero_id: 1, servicio_id: 2, fecha: '2024-05-15', hora: '11:00', estado: true, pagado: true, created_at: new Date('2024-05-15T10:30:00'), updated_at: new Date('2024-05-15T11:30:00') },
    { user_id: 7, barbero_id: 1, servicio_id: 3, fecha: '2024-04-12', hora: '12:00', estado: true, pagado: false, created_at: new Date('2024-04-12T11:30:00'), updated_at: new Date('2024-04-12T12:30:00') },
    { user_id: 8, barbero_id: 1, servicio_id: 4, fecha: '2024-03-18', hora: '13:30', estado: true, pagado: true, created_at: new Date('2024-03-18T13:00:00'), updated_at: new Date('2024-03-18T14:00:00') },
    { user_id: 9, barbero_id: 1, servicio_id: 5, fecha: '2024-02-22', hora: '16:00', estado: true, pagado: false, created_at: new Date('2024-02-22T15:30:00'), updated_at: new Date('2024-02-22T16:30:00') },
    { user_id: 10, barbero_id: 1, servicio_id: 6, fecha: '2024-01-10', hora: '17:30', estado: true, pagado: true, created_at: new Date('2024-01-10T17:00:00'), updated_at: new Date('2024-01-10T18:00:00') },

    { user_id: 11, barbero_id: 2, servicio_id: 1, fecha: '2024-04-20', hora: '12:00', estado: true, pagado: false, created_at: new Date('2024-04-20T11:30:00'), updated_at: new Date('2024-04-20T12:30:00') },
    { user_id: 12, barbero_id: 2, servicio_id: 2, fecha: '2024-03-22', hora: '16:30', estado: true, pagado: true, created_at: new Date('2024-03-22T16:00:00'), updated_at: new Date('2024-03-22T17:00:00') },
    { user_id: 13, barbero_id: 2, servicio_id: 3, fecha: '2024-02-15', hora: '09:30', estado: true, pagado: false, created_at: new Date('2024-02-15T09:00:00'), updated_at: new Date('2024-02-15T10:00:00') },
    { user_id: 14, barbero_id: 2, servicio_id: 4, fecha: '2024-01-25', hora: '13:00', estado: true, pagado: true, created_at: new Date('2024-01-25T12:30:00'), updated_at: new Date('2024-01-25T13:30:00') },
    { user_id: 15, barbero_id: 2, servicio_id: 5, fecha: '2024-05-05', hora: '10:30', estado: true, pagado: true, created_at: new Date('2024-05-05T10:00:00'), updated_at: new Date('2024-05-05T11:00:00') },
    { user_id: 16, barbero_id: 2, servicio_id: 6, fecha: '2024-04-18', hora: '11:30', estado: true, pagado: false, created_at: new Date('2024-04-18T11:00:00'), updated_at: new Date('2024-04-18T12:00:00') },

    { user_id: 17, barbero_id: 3, servicio_id: 1, fecha: '2024-03-10', hora: '09:00', estado: true, pagado: true, created_at: new Date('2024-03-10T08:30:00'), updated_at: new Date('2024-03-10T09:30:00') },
    { user_id: 18, barbero_id: 3, servicio_id: 2, fecha: '2024-02-12', hora: '10:30', estado: true, pagado: false, created_at: new Date('2024-02-12T10:00:00'), updated_at: new Date('2024-02-12T11:00:00') },
    { user_id: 19, barbero_id: 3, servicio_id: 3, fecha: '2024-01-20', hora: '12:00', estado: true, pagado: true, created_at: new Date('2024-01-20T11:30:00'), updated_at: new Date('2024-01-20T12:30:00') },
    { user_id: 20, barbero_id: 3, servicio_id: 4, fecha: '2024-05-18', hora: '13:30', estado: true, pagado: false, created_at: new Date('2024-05-18T13:00:00'), updated_at: new Date('2024-05-18T14:00:00') }
  ]);
};