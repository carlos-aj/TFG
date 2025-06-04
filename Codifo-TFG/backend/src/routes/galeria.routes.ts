import { Router } from 'express';
import * as GaleriaController from '../controllers/galeria.controller';

export const userRouter = Router();
userRouter.get('/', GaleriaController.getGalerias);
userRouter.get('/:id', GaleriaController.getGaleriaById);
userRouter.post('/', GaleriaController.createGaleria);
userRouter.put('/:id', GaleriaController.updateGaleria);
userRouter.delete('/:id', GaleriaController.deleteGaleria);

