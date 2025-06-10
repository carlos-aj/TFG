import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { isAuthenticated, hasRole, isOwnerOrAdmin } from '../middlewares/auth.middleware';

export const userRouter = Router();
console.log('user.routes.ts cargado');

// Rutas públicas
userRouter.post('/', UserController.createUser); // Registro de usuarios
userRouter.get('/confirm', UserController.confirmUser); // Confirmación de email
userRouter.post('/login', UserController.login); // Login
userRouter.post('/logout', UserController.logout); // Logout

// Rutas protegidas para admin
userRouter.get('/', isAuthenticated, hasRole(['admin']), UserController.getAllUsers);
userRouter.post('/:id/sancionar', isAuthenticated, hasRole(['admin']), UserController.sancionarUsuario);

// Rutas protegidas para el propietario o admin
userRouter.get('/:id', isAuthenticated, isOwnerOrAdmin('id'), UserController.getUserById);
userRouter.put('/:id', isAuthenticated, isOwnerOrAdmin('id'), UserController.updateUser);
userRouter.delete('/:id', isAuthenticated, hasRole(['admin']), UserController.deleteUser);



