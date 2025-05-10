import { Router } from 'express';
import * as UserController from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get('/', UserController.getAllUsers);
userRouter.get('/:id', UserController.getUserById);
userRouter.post('/', UserController.createUser);
userRouter.delete('/:id', UserController.deleteUser);
userRouter.put('/:id', UserController.updateUser);

