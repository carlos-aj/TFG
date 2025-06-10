import { Router } from 'express';
import * as BarberoController from '../controllers/barbero.controller'
import { isAuthenticated, hasRole } from '../middlewares/auth.middleware';

export const barberoRouter = Router();

// Rutas públicas
barberoRouter.get('/', BarberoController.getAllBarberos);
barberoRouter.get('/:id', BarberoController.getBarberoById);

// Rutas protegidas para admin y empleados
barberoRouter.post('/', isAuthenticated, hasRole(['admin', 'empleado']), BarberoController.createBarbero);
barberoRouter.delete('/:id', isAuthenticated, hasRole(['admin']), BarberoController.deleteBarbero);
barberoRouter.put('/:id', isAuthenticated, hasRole(['admin', 'empleado']), BarberoController.updateBarbero);