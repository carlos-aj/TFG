import { Router } from 'express';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import * as CitaService from '../services/cita.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });
export const webhookRouter = Router();

webhookRouter.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret as string
    );
  } catch (err: any) {
    console.error('Error verificando webhook:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Manejar el evento
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Actualizar el estado de pago de la cita
      try {
        if (session.metadata && session.metadata.citaId) {
          await CitaService.updateCita(parseInt(session.metadata.citaId), { pagado: true });
        } else {
          console.error('No se encontró el ID de la cita en los metadatos');
        }
      } catch (err: any) {
        console.error('Error actualizando cita:', err.message);
      }
      break;
    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
}); 