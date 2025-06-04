import { Router } from 'express';
import * as InvitadoController from '../controllers/invitado.controller';

export const invitadoRouter = Router();
invitadoRouter.post('/', InvitadoController.addInvitado);
invitadoRouter.get('/:cita_id', InvitadoController.getInvitadosByCita);