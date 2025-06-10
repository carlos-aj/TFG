import { Router } from 'express';
import * as ServicoController from '../controllers/servicio.controller'
import { isAuthenticated, hasRole } from '../middlewares/auth.middleware';

export const servicioRouter = Router();

// Rutas públicas
servicioRouter.get('/', ServicoController.getAllServicios);
servicioRouter.get('/:id', ServicoController.getServicioById);

// Rutas protegidas para admin
servicioRouter.post('/', isAuthenticated, hasRole(['admin']), ServicoController.createServicio);
servicioRouter.delete('/:id', isAuthenticated, hasRole(['admin']), ServicoController.deleteServicio);
servicioRouter.put('/:id', isAuthenticated, hasRole(['admin']), ServicoController.updateServicio);