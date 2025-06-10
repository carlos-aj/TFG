import { Router } from 'express';
import * as CitaController from '../controllers/cita.controller';
import * as PaymentController from '../controllers/payment.controller';
import { isAuthenticated, hasRole, isOwnerOrAdmin } from '../middlewares/auth.middleware';

export const citaRouter = Router();

// Rutas que requieren autenticación
citaRouter.get('/puede-invitar/check', isAuthenticated, CitaController.checkPuedeInvitar);
citaRouter.post('/pago', isAuthenticated, PaymentController.createCheckoutSession);

// Rutas para usuarios autenticados y admin
citaRouter.get('/', isAuthenticated, CitaController.getAllCitas);
citaRouter.post('/', isAuthenticated, CitaController.createCita);

// Rutas que requieren ser propietario o admin
citaRouter.get('/:id', isAuthenticated, isOwnerOrAdmin('id'), CitaController.getCitaById);
citaRouter.put('/:id', isAuthenticated, isOwnerOrAdmin('id'), CitaController.updateCita);
citaRouter.delete('/:id', isAuthenticated, isOwnerOrAdmin('id'), CitaController.deleteCita);
