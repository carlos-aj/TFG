import express, { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { isAuthenticated, hasRole, isOwnerOrAdmin } from '../middlewares/auth.middleware';

export const userRouter: Router = express.Router();
console.log('user.routes.ts cargado');

// Rutas públicas
userRouter.post('/', UserController.createUser);
userRouter.get('/confirm', UserController.confirmUser);
userRouter.post('/login', UserController.login);
userRouter.post('/logout', UserController.logout);

// Rutas protegidas para admin
userRouter.get('/', isAuthenticated, hasRole(['admin']), UserController.getAllUsers);
userRouter.post('/:id/sancionar', isAuthenticated, hasRole(['admin']), UserController.sancionarUsuario);

// Rutas protegidas para el propietario o admin
userRouter.get('/:id', isAuthenticated, isOwnerOrAdmin('id'), UserController.getUserById);
userRouter.put('/:id', isAuthenticated, isOwnerOrAdmin('id'), UserController.updateUser);
userRouter.delete('/:id', isAuthenticated, hasRole(['admin']), UserController.deleteUser);

// Ruta para verificar token
userRouter.get('/verify-token', isAuthenticated, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});

// Rutas protegidas - requieren autenticación
userRouter.get('/profile', isAuthenticated, UserController.getProfile);
userRouter.put('/profile', isAuthenticated, UserController.updateProfile);
userRouter.put('/change-password', isAuthenticated, UserController.changePassword);

// Rutas protegidas - requieren autenticación
userRouter.post('/verify-email', UserController.verifyEmail);
userRouter.post('/request-password-reset', UserController.requestPasswordReset);
userRouter.post('/reset-password', UserController.resetPassword);



