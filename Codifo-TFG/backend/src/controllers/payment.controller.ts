import Stripe from 'stripe';
import { Request, Response, NextFunction } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });

export async function createCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { amount, citaId } = req.body;
  
  if (!amount || !citaId) {
    console.error('Faltan datos requeridos:', { amount, citaId });
    res.status(400).json({ message: 'Se requiere amount y citaId' });
    return;
  }

  try {

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { 
            name: 'Reserva Barbería',
            description: `Cita #${citaId}`
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/cita-exito?cita_id=${citaId}`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
      metadata: {
        citaId: citaId.toString()
      }
    });
    
    res.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Error detallado al crear sesión de pago:', {
      message: err.message,
      type: err.type,
      stack: err.stack
    });
    res.status(500).json({ message: 'Error creando sesión de pago', error: err.message });
  }
}