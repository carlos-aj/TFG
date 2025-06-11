import { Request, Response, NextFunction } from 'express';
import * as CitaService from '../services/cita.service';
import { sendCitaEmail } from '../utils/emailSender';
import { Servicio } from '../models/Servicio';
import { User } from '../models/User';
import { transaction } from 'objection';
import { Cita } from '../models/Cita';

export async function getAllCitas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { barbero_id, fecha } = req.query;
    let citas;
    if (barbero_id && fecha) {
      citas = await CitaService.getCitasByBarberoYFecha(Number(barbero_id), String(fecha));
    } else {
      citas = await CitaService.getAllCitas();
    }
    res.json(citas);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Failed to retrieve appointments' });
  }
}

export async function getCitaById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const cita = await CitaService.getCitaById(id);

    if (!cita) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    res.json(cita);
  } catch (err) {
    console.error('Error retrieving appointment:', err);
    res.status(500).json({ message: 'Failed to retrieve appointment' });
  }
}

export async function createCita(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    console.log('Datos recibidos para crear cita:', JSON.stringify(data, null, 2));

    // Validar datos requeridos
    if (!data.servicio_id || !data.barbero_id || !data.fecha || !data.hora) {
      console.error('Faltan datos requeridos para la cita:', { 
        servicio_id: data.servicio_id, 
        barbero_id: data.barbero_id, 
        fecha: data.fecha, 
        hora: data.hora 
      });
      res.status(400).json({ message: 'Faltan datos requeridos para la cita' });
      return;
    }

    // Verificar penalizaciones del usuario
    if (data.user_id) {
      try {
        const user = await User.query().findById(data.user_id);
        console.log('Usuario encontrado:', user ? 'Sí' : 'No', user ? `Penalizaciones: ${user.penalizacion}` : '');
        
        if (user && user.penalizacion >= 3) {
          res.status(403).json({ message: 'No puedes reservar porque tienes 3 o más sanciones.' });
          return;
        }
      } catch (userErr) {
        console.error('Error al verificar usuario:', userErr);
        // Continuamos aunque haya error en la verificación del usuario
      }
    }

    // Verificar servicio
    let servicio;
    try {
      servicio = await Servicio.query().findById(data.servicio_id);
      console.log('Servicio encontrado:', servicio ? 'Sí' : 'No');
      
      if (!servicio) {
        res.status(400).json({ message: 'Servicio no encontrado' });
        return;
      }
    } catch (servicioErr) {
      console.error('Error al buscar servicio:', servicioErr);
      res.status(500).json({ message: 'Error al verificar el servicio' });
      return;
    }

    // Calcular franjas horarias
    try {
      const franjas = Math.ceil(servicio.duracion / 30);
      console.log(`Servicio requiere ${franjas} franjas de 30 minutos`);
      
      const horas = [];
      let [h, m] = data.hora.split(':').map(Number);
      
      for (let i = 0; i < franjas; i++) {
        const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        horas.push(horaStr);
        m += 30;
        if (m >= 60) { h++; m = 0; }
      }
      
      console.log('Franjas horarias a verificar:', horas);

      // Verificar disponibilidad de horarios
      for (const hora of horas) {
        try {
          const citaExistente = await CitaService.findCitaByBarberoFechaHora(
            data.barbero_id, data.fecha, hora
          );
          
          if (citaExistente) {
            console.log('Cita existente encontrada en hora:', hora);
            res.status(400).json({ message: 'Ya existe una cita para ese barbero en esa fecha y hora.' });
            return;
          }
        } catch (citaErr) {
          console.error('Error al verificar cita existente:', citaErr);
          res.status(500).json({ message: 'Error al verificar disponibilidad de horarios' });
          return;
        }
      }

      // Utilizar una transacción para asegurar la atomicidad de las operaciones
      const newCita = await transaction(Cita.knex(), async (trx) => {
        // Crear la cita principal
        console.log('Creando cita principal...');
        const citaPrincipal = await CitaService.createCita({
          servicio_id: data.servicio_id,
          barbero_id: data.barbero_id,
          fecha: data.fecha,
          hora: data.hora,
          estado: false,
          pagado: false,
          user_id: data.user_id
        }, trx); // Pasar la transacción al servicio
        
        console.log('Cita principal creada con ID:', citaPrincipal.id);

        // Procesar invitado si existe
        if (
          data.nombre_invitado &&
          data.servicio_id_invitado &&
          data.barbero_id_invitado &&
          data.hora_invitado
        ) {
          console.log('Procesando información de invitado...');
          
          const servicioInvitado = await Servicio.query(trx).findById(data.servicio_id_invitado);
          if (!servicioInvitado) {
            throw new Error('Servicio de invitado no encontrado');
          }

          const franjasInv = Math.ceil(servicioInvitado.duracion / 30);
          const horasInv = [];
          let [hi, mi] = data.hora_invitado.split(':').map(Number);
          
          for (let i = 0; i < franjasInv; i++) {
            const horaStr = `${String(hi).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
            horasInv.push(horaStr);
            mi += 30;
            if (mi >= 60) { hi++; mi = 0; }
          }
          
          console.log('Franjas horarias de invitado a verificar:', horasInv);

          for (const hora of horasInv) {
            const citaExistente = await CitaService.findCitaByBarberoFechaHora(
              data.barbero_id_invitado, data.fecha, hora, trx
            );
            
            if (citaExistente) {
              throw new Error('Ya existe una cita para ese barbero (invitado) en esa fecha y hora.');
            }
          }

          console.log('Creando cita de invitado...');
          await CitaService.createCita({
            servicio_id: data.servicio_id_invitado,
            barbero_id: data.barbero_id_invitado,
            fecha: data.fecha,
            hora: data.hora_invitado,
            estado: false,
            pagado: false,
            nombre_invitado: data.nombre_invitado
          }, trx); // Pasar la transacción al servicio
        }
        
        return citaPrincipal;
      });

      // Enviar email solo si no es un flujo de pago online
      if (!data.pago_online) {
        try {
          console.log('Obteniendo información para email (cita no pagada online)...');
          const { user, barbero, servicio: servicioObj } = await CitaService.getCitaInfoForEmail(data);

          let invitadoInfo = null;
          if (data.nombre_invitado && data.servicio_id_invitado && data.barbero_id_invitado) {
            const servicioInvitado = await Servicio.query().findById(data.servicio_id_invitado);
            invitadoInfo = {
              nombre: data.nombre_invitado,
              servicio: servicioInvitado?.nombre || 'N/A',
              barbero: (await CitaService.getBarberoNombreById(data.barbero_id_invitado)),
              fecha: data.fecha,
              hora: data.hora_invitado
            };
          }

          if (user && 'email' in user && user.email) {
            console.log('Enviando email a:', user.email);
            await sendCitaEmail(user.email, {
              servicio: servicioObj?.nombre || 'N/A',
              barbero: barbero?.nombre || 'N/A',
              fecha: data.fecha,
              hora: data.hora,
              importe_pagado: null, // No hay pago inmediato
              invitado: invitadoInfo
            });
            console.log('Email enviado correctamente');
          } else {
            console.log('No se envió email: usuario sin email');
          }
        } catch (emailErr) {
          console.error('Error al enviar email:', emailErr);
        }
      }

      res.status(201).json(newCita);
    } catch (processingErr) {
      console.error('Error en el procesamiento de la cita:', processingErr);
      res.status(500).json({ message: 'Error en el procesamiento de la cita' });
    }
  } catch (err) {
    console.error('Error general al crear cita:', err);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
}

export async function confirmarPagoCita(req: Request, res: Response): Promise<void> {
  const { cita_id } = req.body;

  if (!cita_id) {
    res.status(400).json({ message: 'Falta el ID de la cita' });
    return;
  }

  try {
    // 1. Marcar la cita como pagada
    await CitaService.updateCita(cita_id, { pagado: true });

    // 2. Obtener la cita completa con sus relaciones
    const cita = await CitaService.getCitaById(cita_id);
    if (!cita) {
      res.status(404).json({ message: 'Cita no encontrada después de actualizar' });
      return;
    }
    
    // 3. Enviar el email con los datos de la cita
    if (cita.user && cita.user.email) {
      let invitadoInfo = null;
      if (cita.nombre_invitado && cita.servicio_id_invitado && cita.barbero_id_invitado && cita.hora_invitado) {
          const servicioInvitado = await Servicio.query().findById(cita.servicio_id_invitado);
          invitadoInfo = {
              nombre: cita.nombre_invitado,
              servicio: servicioInvitado?.nombre || 'N/A',
              barbero: (await CitaService.getBarberoNombreById(cita.barbero_id_invitado)),
              fecha: cita.fecha,
              hora: cita.hora_invitado
          };
      }

      await sendCitaEmail(cita.user.email, {
        servicio: cita.servicio?.nombre || 'N/A',
        barbero: cita.barbero?.nombre || 'N/A',
        fecha: cita.fecha,
        hora: cita.hora,
        importe_pagado: cita.servicio?.precio ? Number(cita.servicio.precio) : null,
        invitado: invitadoInfo
      });
    }

    res.status(200).json({ message: 'Cita confirmada y email enviado' });

  } catch (error) {
    console.error('Error al confirmar el pago de la cita:', error);
    res.status(500).json({ message: 'Error al confirmar el pago' });
  }
}

export async function updateCita(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const updatedCita = await CitaService.updateCita(id, data);

    if (!updatedCita) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    res.json(updatedCita);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
}

export async function deleteCita(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const deleted = await CitaService.deleteCita(id);

    if (deleted === 0) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
}

export async function checkPuedeInvitar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { barbero_id, fecha, hora } = req.query;
    const puede = await CitaService.puedeInvitar(Number(barbero_id), String(fecha), String(hora));
    res.json({ puedeInvitar: puede });
  } catch (err) {
    res.status(500).json({ message: 'Error comprobando invitación' });
  }
}


