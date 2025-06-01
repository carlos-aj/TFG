import { Router } from 'express';
import * as BarberoController from '../controllers/barbero.controller'

export const barberoRouter = Router();

barberoRouter.get('/', BarberoController.getAllBarberos);
barberoRouter.get('/:id', BarberoController.getBarberoById);
barberoRouter.post('/', BarberoController.createBarbero);
barberoRouter.delete('/:id', BarberoController.deleteBarbero);
barberoRouter.put('/:id', BarberoController.updateBarbero);