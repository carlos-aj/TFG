import { Request, Response, NextFunction } from 'express';
import * as CitaService from '../services/cita.service';
import { sendCitaEmail } from '../utils/emailSender';
import { Servicio } from '../models/Servicio';
import { User } from '../models/User';

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

    if (data.user_id) {
      const user = await User.query().findById(data.user_id);
      if (user && user.penalizacion >= 3) {
        res.status(403).json({ message: 'No puedes reservar porque tienes 3 o más sanciones.' });
        return;
      }
    }

    const servicio = await Servicio.query().findById(data.servicio_id);
    if (!servicio) {
      res.status(400).json({ message: 'Servicio no encontrado' });
      return;
    }

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
      const citaExistente = await CitaService.findCitaByBarberoFechaHora(
        data.barbero_id, data.fecha, hora
      );
      if (citaExistente) {
        res.status(400).json({ message: 'Ya existe una cita para ese barbero en esa fecha y hora.' });
        return;
      }
    }

    const newCita = await CitaService.createCita({
      servicio_id: data.servicio_id,
      barbero_id: data.barbero_id,
      fecha: data.fecha,
      hora: data.hora,
      estado: false,
      pagado: false,
      user_id: data.user_id,
      nombre_invitado: undefined
    });

    let invitadoInfo = null;
    if (
      data.nombre_invitado &&
      data.servicio_id_invitado &&
      data.barbero_id_invitado &&
      data.hora_invitado
    ) {
      const servicioInvitado = await Servicio.query().findById(data.servicio_id_invitado);
      if (!servicioInvitado) {
        res.status(400).json({ message: 'Servicio de invitado no encontrado' });
        return;
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
          data.barbero_id_invitado, data.fecha, hora
        );
        if (citaExistente) {
          res.status(400).json({ message: 'Ya existe una cita para ese barbero (invitado) en esa fecha y hora.' });
          return;
        }
      }

      await CitaService.createCita({
        servicio_id: data.servicio_id_invitado,
        barbero_id: data.barbero_id_invitado,
        fecha: data.fecha,
        hora: data.hora_invitado,
        estado: false,
        pagado: false,
        user_id: undefined,
        nombre_invitado: data.nombre_invitado
      });

      invitadoInfo = {
        nombre: data.nombre_invitado,
        servicio: servicioInvitado.nombre,
        barbero: (await CitaService.getBarberoNombreById(data.barbero_id_invitado)),
        fecha: data.fecha,
        hora: data.hora_invitado
      };
    }

    const { user, barbero, servicio: servicioObj } = await CitaService.getCitaInfoForEmail(data);

    if (user && user.email) {
      await sendCitaEmail(user.email, {
        servicio: servicioObj?.nombre || data.servicio_id,
        barbero: barbero?.nombre || data.barbero_id,
        fecha: data.fecha,
        hora: data.hora,
        importe_pagado: data.importe_pagado || null,
        invitado: invitadoInfo
      });
    }

    res.status(201).json(newCita);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Failed to create appointment' });
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

