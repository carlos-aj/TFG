import { Request, Response, NextFunction } from 'express';
import * as CitaService from '../services/cita.service';
import { sendCitaEmail } from '../utils/emailSender';
import { Servicio } from '../models/Servicio';
import { User } from '../models/User';
import { transaction } from 'objection';
import { Cita } from '../models/Cita';

export async function getAllCitas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { barbero_id, fecha, fecha_inicio, fecha_fin, includeRelations } = req.query;
    
    let citas;
    if (barbero_id && fecha_inicio && fecha_fin) {
      citas = await CitaService.getCitasByBarberoYFecha(Number(barbero_id), String(fecha_inicio), String(fecha_fin));
    } else if (barbero_id && fecha_inicio) {
      citas = await CitaService.getCitasByBarberoYFecha(Number(barbero_id), String(fecha_inicio));
    } else if (barbero_id && fecha) {
      citas = await CitaService.getCitasByBarberoYFecha(Number(barbero_id), String(fecha));
    } else if (barbero_id) {
      citas = await CitaService.getCitasByBarbero(Number(barbero_id));
    } else if (fecha_inicio && fecha_fin) {
      citas = await CitaService.getCitasByFecha(String(fecha_inicio), String(fecha_fin));
    } else if (fecha_inicio) {
      citas = await CitaService.getCitasByFecha(String(fecha_inicio));
    } else {
      citas = await CitaService.getAllCitas();
    }
    
    if (citas && Array.isArray(citas)) {
      if (citas.length > 0) {
        const primeraFecha = citas[0].fecha;
        
        try {
          if (primeraFecha && typeof primeraFecha === 'string') {
          } else {
          }
        } catch (e) {
        }
      }
    }
    
    if (includeRelations === 'true' && citas && citas.length > 0) {
      try {
        const citasIds = citas.map(c => c.id);
        const citasConRelaciones = await Cita.query()
          .findByIds(citasIds)
          .withGraphFetched('[user, barbero, servicio]');
        
        const citasMap: Record<number, any> = {};
        citasConRelaciones.forEach(c => {
          citasMap[c.id] = c;
        });
        
        citas = citas.map(c => citasMap[c.id] || c);
        
      } catch (e) {
      }
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
    
    if (data.fecha) {
      const fechaObj = new Date(data.fecha);
    }

    if (!data.servicio_id || !data.barbero_id || !data.fecha || !data.hora) {
      res.status(400).json({ message: 'Faltan datos requeridos para la cita' });
      return;
    }

    if (data.user_id) {
      try {
        const user = await User.query().findById(data.user_id);
        
        if (user && user.penalizacion >= 3) {
          res.status(403).json({ message: 'No puedes reservar porque tienes 3 o más sanciones.' });
          return;
        }
      } catch (userErr) {
        console.error('Error al verificar usuario:', userErr);
      }
    }

    let servicio;
    try {
      servicio = await Servicio.query().findById(data.servicio_id);
      
      if (!servicio) {
        res.status(400).json({ message: 'Servicio no encontrado' });
        return;
      }
    } catch (servicioErr) {
      console.error('Error al buscar servicio:', servicioErr);
      res.status(500).json({ message: 'Error al verificar el servicio' });
      return;
    }

    try {
      const franjas = Math.ceil(servicio.duracion / 30);
      
      const horas = [];
      let [h, m] = data.hora.split(':').map(Number);
      
      for (let i = 0; i < franjas; i++) {
        const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        horas.push(horaStr);
        m += 30;
        if (m >= 60) { h++; m = 0; }
      }
      

      for (const hora of horas) {
        try {
          const citaExistente = await CitaService.findCitaByBarberoFechaHora(
            data.barbero_id, data.fecha, hora
          );
          
          if (citaExistente) {
            res.status(400).json({ message: 'Ya existe una cita para ese barbero en esa fecha y hora.' });
            return;
          }
        } catch (citaErr) {
          console.error('Error al verificar cita existente:', citaErr);
          res.status(500).json({ message: 'Error al verificar disponibilidad de horarios' });
          return;
        }
      }

      const newCita = await transaction(Cita.knex(), async (trx) => {
        const citaPrincipal = await CitaService.createCita({
          servicio_id: data.servicio_id,
          barbero_id: data.barbero_id,
          fecha: data.fecha,
          hora: data.hora,
          estado: false,
          pagado: false,
          user_id: data.user_id
        }, trx);
        

        if (
          data.nombre_invitado &&
          data.servicio_id_invitado &&
          data.barbero_id_invitado &&
          data.hora_invitado
        ) {
          
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
          

          for (const hora of horasInv) {
            const citaExistente = await CitaService.findCitaByBarberoFechaHora(
              data.barbero_id_invitado, data.fecha, hora, trx
            );
            
            if (citaExistente) {
              throw new Error('Ya existe una cita para ese barbero (invitado) en esa fecha y hora.');
            }
          }

          await CitaService.createCita({
            servicio_id: data.servicio_id_invitado,
            barbero_id: data.barbero_id_invitado,
            fecha: data.fecha,
            hora: data.hora_invitado,
            estado: false,
            pagado: false,
            nombre_invitado: data.nombre_invitado
          }, trx); 
        }
        
        return citaPrincipal;
      });

      if (!data.pago_online) {
        try {
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
            await sendCitaEmail(user.email, {
              servicio: servicioObj?.nombre || 'N/A',
              barbero: barbero?.nombre || 'N/A',
              fecha: data.fecha,
              hora: data.hora,
              importe_pagado: null,
              invitado: invitadoInfo
            });
          } else {
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
  const { cita_id, force_confirm } = req.body;

  if (!cita_id && force_confirm) {
    res.status(400).json({ message: 'Se requiere cita_id para confirmar el pago' });
    return;
  }
  
  const citaId = req.body.cita_id;
  
  if (!citaId) {
    res.status(400).json({ message: 'Falta el ID de la cita' });
    return;
  }

  try {    
    try {
      await CitaService.updateCita(citaId, { pagado: true });
    } catch (updateError) {
      console.error('Error al actualizar el estado de pago de la cita:', updateError);
    }

    let cita;
    try {
      cita = await CitaService.getCitaById(citaId);
      if (!cita) {
        console.error('No se encontró la cita con ID:', citaId);
        res.status(404).json({ message: 'Cita no encontrada' });
        return;
      }
    } catch (fetchError) {
      console.error('Error al obtener información de la cita:', fetchError);
      res.status(500).json({ message: 'Error al obtener información de la cita' });
      return;
    }
    
    try {
      const citaCompleta = await Cita.query()
        .findById(citaId)
        .withGraphFetched('[user, barbero, servicio]');
        
      if (!citaCompleta) {
        console.error('No se pudo cargar la información completa de la cita');
        res.status(404).json({ message: 'No se pudo cargar la información completa de la cita' });
        return;
      }
      
      cita = citaCompleta;
    } catch (relationsError) {
      console.error('Error al cargar las relaciones de la cita:', relationsError);
    }
    
    try {
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
      } else {
        console.warn('No se pudo enviar el email: usuario sin email');
      }
    } catch (emailError) {
      console.error('Error al enviar el email de confirmación:', emailError);
    }

    res.status(200).json({ message: 'Cita confirmada y email enviado' });

  } catch (error) {
    console.error('Error general al confirmar el pago de la cita:', error);
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


