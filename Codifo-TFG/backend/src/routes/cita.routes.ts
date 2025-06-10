import express, { Router } from 'express';
import * as citaController from '../controllers/cita.controller';
import * as paymentController from '../controllers/payment.controller';
import { isAuthenticated, isOwnerOrAdmin } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// Rutas públicas
router.get('/', citaController.getAllCitas);
router.get('/check/puede-invitar', citaController.checkPuedeInvitar);
router.get('/puede-invitar/check', citaController.checkPuedeInvitar);
router.get('/:id', citaController.getCitaById);

// Rutas protegidas
router.post('/', isAuthenticated, citaController.createCita);
router.put('/:id', isAuthenticated, isOwnerOrAdmin('id'), citaController.updateCita);
router.delete('/:id', isAuthenticated, isOwnerOrAdmin('id'), citaController.deleteCita);

// Rutas de pago
router.post('/pago', isAuthenticated, paymentController.createCheckoutSession);

export default router;
