"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const CitaService = __importStar(require("../services/cita.service"));
const emailSender_1 = require("../utils/emailSender");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
exports.publicRouter = (0, express_1.Router)();
exports.publicRouter.post('/stripe-webhook', async (req, res) => {
    console.log('Webhook de Stripe recibido');
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    console.log('Verificando firma con secreto:', {
        tieneSignature: !!sig,
        tieneEndpointSecret: !!endpointSecret,
        bodyType: typeof req.body
    });
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log('Evento de Stripe verificado correctamente:', event.type);
    }
    catch (err) {
        console.error('Error verificando webhook:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
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
                    await (0, emailSender_1.sendCitaEmail)(user.email, {
                        servicio: servicio?.nombre || 'N/A',
                        barbero: barbero?.nombre || 'N/A',
                        fecha: cita.fecha,
                        hora: cita.hora,
                        importe_pagado: session.amount_total || null,
                        invitado: null
                    });
                }
            }
            catch (err) {
                console.error(`Error al procesar el webhook para la cita ${citaId}:`, err.message);
            }
            break;
        default:
    }
    res.json({ received: true });
});
