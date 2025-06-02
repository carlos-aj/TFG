import { Request, Response } from 'express';
import * as CitaService from '../services/cita.service';
import { sendCitaEmail } from '../utils/emailSender';


export async function getAllCitas(req: Request, res: Response) {
  try {
    const citas = await CitaService.getAllCitas();
    res.json(citas);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Failed to retrieve appointments' });
  }
}

export async function getCitaById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const cita = await CitaService.getCitaById(id);

    if (!cita) {
      res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(cita);
  } catch (err) {
    console.error('Error retrieving appointment:', err);
    res.status(500).json({ message: 'Failed to retrieve appointment' });
  }
}


export async function createCita(req: Request, res: Response) {
  try {
    const data = req.body;

    const citaExistente = await CitaService.findCitaByBarberoFechaHora(
      data.barbero_id,
      data.fecha,
      data.hora
    );
    if (citaExistente) {
      res.status(400).json({ message: 'Ya existe una cita para ese barbero en esa fecha y hora.' });
    }else{
      const newCita = await CitaService.createCita(data);

      const { user, barbero, servicio } = await CitaService.getCitaInfoForEmail(data);

      if (user && user.email) {
        await sendCitaEmail(user.email, {
          servicio: servicio?.nombre || data.servicio_id,
          barbero: barbero?.nombre || data.barbero_id,
          fecha: data.fecha,
          hora: data.hora
        });
      }

      res.status(201).json(newCita);
    }
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
}

export async function updateCita(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const updatedCita = await CitaService.updateCita(id, data);

    if (!updatedCita) {
      res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(updatedCita);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
}

export async function deleteCita(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await CitaService.deleteCita(id);

    if (deleted === 0) {
      res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
}

