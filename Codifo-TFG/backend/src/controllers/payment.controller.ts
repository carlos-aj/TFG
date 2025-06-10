import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });

export async function createCheckoutSession(req: Request, res: Response) {
  const { amount, citaId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Reserva Barbería' },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/cita-exito`,
      cancel_url: `${process.env.FRONTEND_URL}/cita-cancelada`,
      metadata: {
        citaId: citaId.toString()
      }
    });
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating payment session:', err);
    res.status(500).json({ message: 'Error creando sesión de pago' });
  }
}