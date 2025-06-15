import { Router } from 'express';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import * as CitaService from '../services/cita.service';
import { sendCitaEmail } from '../utils/emailSender';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });
export const publicRouter = Router();

publicRouter.post('/stripe-webhook', async (req: Request, res: Response) => {
  console.log('Webhook de Stripe recibido');
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('Verificando firma con secreto:', { 
    tieneSignature: !!sig, 
    tieneEndpointSecret: !!endpointSecret,
    bodyType: typeof req.body
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret as string);
    console.log('Evento de Stripe verificado correctamente:', event.type);
  } catch (err: any) {
    console.error('Error verificando webhook:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const citaId = session.metadata?.citaId;

      if (!citaId) {
        console.error('Webhook Error: No citaId in session metadata');
        break;
      }
      
      try {
        await CitaService.updateCita(parseInt(citaId), { pagado: true });

        const cita = await CitaService.getCitaById(parseInt(citaId));
        if (!cita) {
          console.error(`Webhook Error: Cita with ID ${citaId} not found.`);
          break;
        }

        const { user, barbero, servicio } = await CitaService.getCitaInfoForEmail(cita);

        if (user && user.email) {
          await sendCitaEmail(user.email, {
            servicio: servicio?.nombre || 'N/A',
            barbero: barbero?.nombre || 'N/A',
            fecha: cita.fecha,
            hora: cita.hora,
            importe_pagado: session.amount_total || null,
            invitado: null
          });
        }
      } catch (err: any) {
        console.error(`Error al procesar el webhook para la cita ${citaId}:`, err.message);
      }
      break;
    default:
  }

  res.json({ received: true });
}); 