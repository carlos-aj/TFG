import { Router } from 'express';
import * as CitaController from '../controllers/cita.controller';

export const citaRouter = Router();

citaRouter.get('/puede-invitar/check', CitaController.checkPuedeInvitar);
citaRouter.get('/', CitaController.getAllCitas);
citaRouter.get('/:id', CitaController.getCitaById);
citaRouter.post('/', CitaController.createCita);
citaRouter.put('/:id', CitaController.updateCita);
citaRouter.delete('/:id', CitaController.deleteCita);
citaRouter.get('/puede-invitar/check', CitaController.checkPuedeInvitar);
