import { Router } from 'express';
import * as UserController from '../controllers/user.controller';

export const userRouter = Router();
console.log('user.routes.ts cargado');
userRouter.post('/:id/sancionar', UserController.sancionarUsuario);
userRouter.get('/', UserController.getAllUsers);
userRouter.get('/confirm', UserController.confirmUser);
userRouter.get('/:id', UserController.getUserById);
userRouter.post('/', UserController.createUser);
userRouter.delete('/:id', UserController.deleteUser);
userRouter.put('/:id', UserController.updateUser);
userRouter.post('/login', UserController.login);
userRouter.post('/logout', UserController.logout);



