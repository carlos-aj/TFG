import { Router } from 'express';
import * as CitaController from '../controllers/cita.controller';
import * as paymentController from '../controllers/payment.controller';
import { isAuthenticated, isOwnerOrAdmin } from '../middlewares/auth.middleware';

export const citaRouter = Router();

citaRouter.get('/puede-invitar/check', CitaController.checkPuedeInvitar);
citaRouter.get('/', CitaController.getAllCitas);
citaRouter.get('/:id', CitaController.getCitaById);

citaRouter.post('/', isAuthenticated, CitaController.createCita);
citaRouter.put('/:id', isAuthenticated, isOwnerOrAdmin('id'), CitaController.updateCita);
citaRouter.delete('/:id', isAuthenticated, isOwnerOrAdmin('id'), CitaController.deleteCita);

citaRouter.post('/pago', isAuthenticated, paymentController.createCheckoutSession);
citaRouter.post('/confirmar-pago', CitaController.confirmarPagoCita);
