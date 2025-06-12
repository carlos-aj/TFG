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

// Rutas protegidas para admin y empleados
userRouter.get('/', isAuthenticated, hasRole(['admin', 'empleado']), UserController.getAllUsers);

// Ruta para verificar token
userRouter.get('/verify-token', isAuthenticated, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});

userRouter.post('/:id/sancionar', isAuthenticated, hasRole(['admin']), UserController.sancionarUsuario);

// Asignar barbero a empleado (solo admin)
userRouter.post('/:id/asignar-barbero', isAuthenticated, hasRole(['admin']), UserController.asignarBarbero);

// Rutas protegidas para el propietario o admin
userRouter.get('/:id', isAuthenticated, isOwnerOrAdmin('id'), UserController.getUserById);
userRouter.put('/:id', isAuthenticated, isOwnerOrAdmin('id'), UserController.updateUser);
userRouter.delete('/:id', isAuthenticated, hasRole(['admin']), UserController.deleteUser);

