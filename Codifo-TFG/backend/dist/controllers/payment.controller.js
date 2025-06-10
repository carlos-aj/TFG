"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = createCheckoutSession;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
async function createCheckoutSession(req, res) {
    const { amount } = req.body;
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
        });
        res.json({ sessionId: session.id });
    }
    catch (err) {
        res.status(500).json({ message: 'Error creando sesión de pago' });
    }
}
