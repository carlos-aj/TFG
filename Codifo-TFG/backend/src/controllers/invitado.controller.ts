import { Request, Response } from 'express';
import * as InvitadoService from '../services/invitado.service';

export async function addInvitado(req: Request, res: Response) {
  try {
    const invitado = await InvitadoService.addInvitado(req.body);
    res.status(201).json(invitado);
  } catch (err) {
    res.status(500).json({ message: 'Error añadiendo invitado' });
  }
}

export async function getInvitadosByCita(req: Request, res: Response) {
  try {
    const cita_id = parseInt(req.params.cita_id);
    const invitados = await InvitadoService.getInvitadosByCita(cita_id);
    res.json(invitados);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo invitados' });
  }
}