import { Router } from 'express';
import * as BarberoController from '../controllers/barbero.controller'
import { isAuthenticated, hasRole } from '../middlewares/auth.middleware';

export const barberoRouter = Router();

barberoRouter.get('/', BarberoController.getAllBarberos);
barberoRouter.get('/:id', BarberoController.getBarberoById);

barberoRouter.post('/', isAuthenticated, hasRole(['admin', 'empleado']), BarberoController.createBarbero);
barberoRouter.delete('/:id', isAuthenticated, hasRole(['admin']), BarberoController.deleteBarbero);
barberoRouter.put('/:id', isAuthenticated, hasRole(['admin', 'empleado']), BarberoController.updateBarbero);