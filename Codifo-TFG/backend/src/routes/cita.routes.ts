import { Router } from 'express';
import * as CitaController from '../controllers/cita.controller';
import * as paymentController from '../controllers/payment.controller';
import { isAuthenticated, isOwnerOrAdmin } from '../middlewares/auth.middleware';

export const citaRouter = Router();

// PUBLIC ROUTES
// Specific routes must come before generic ones
citaRouter.get('/puede-invitar/check', CitaController.checkPuedeInvitar);
citaRouter.get('/', CitaController.getAllCitas);
citaRouter.get('/:id', CitaController.getCitaById);

// PROTECTED ROUTES
citaRouter.post('/', isAuthenticated, CitaController.createCita);
citaRouter.put('/:id', isAuthenticated, isOwnerOrAdmin('id'), CitaController.updateCita);
citaRouter.delete('/:id', isAuthenticated, isOwnerOrAdmin('id'), CitaController.deleteCita);

// PAYMENT ROUTE
citaRouter.post('/pago', isAuthenticated, paymentController.createCheckoutSession);
citaRouter.post('/confirmar-pago', isAuthenticated, CitaController.confirmarPagoCita);
