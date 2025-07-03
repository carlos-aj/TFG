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
    console.log('Creando sesión de pago con:', { 
      amount, 
      citaId,
      stripeKeyConfigured: !!process.env.STRIPE_SECRET_KEY,
      frontendUrl: process.env.FRONTEND_URL
    });

    let frontendUrl = process.env.FRONTEND_URL || '';
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
      frontendUrl = `https://${frontendUrl}`;
    }

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
      success_url: `${frontendUrl}/cita-exito?cita_id=${citaId}`,
      cancel_url: `${frontendUrl}/`,
      metadata: {
        citaId: citaId.toString()
      }
    });
    
    console.log('Sesión de pago creada correctamente:', { sessionId: session.id });
    res.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Error detallado al crear sesión de pago:', {
      message: err.message,
      type: err.type,
      code: err.code,
      param: err.param,
      stack: err.stack
    });
    res.status(500).json({ message: 'Error creando sesión de pago', error: err.message });
  }
}