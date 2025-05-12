import { Router } from 'express';
import * as ServicoController from '../controllers/servicio.controller'

export const servicioRouter = Router();

servicioRouter.get('/', ServicoController.getAllServicios);
servicioRouter.get('/:id', ServicoController.getServicioById);
servicioRouter.post('/', ServicoController.createServicio);
servicioRouter.delete('/:id', ServicoController.deleteServicio);
servicioRouter.put('/:id', ServicoController.updateServicio);