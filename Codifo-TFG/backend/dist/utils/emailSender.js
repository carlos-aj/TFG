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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfirmationEmail = sendConfirmationEmail;
exports.sendCitaEmail = sendCitaEmail;
const nodemailer = __importStar(require("nodemailer"));
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendConfirmationEmail(to, token) {
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm?token=${token}`;
    const info = await transporter.sendMail({
        from: '"Rasoio Barber Shop" <no-reply@rasoio.com>',
        to,
        subject: 'Confirma tu cuenta',
        html: `<p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
           <a href="${confirmUrl}">Confirmar cuenta</a>`,
    });
}
async function sendCitaEmail(to, citaInfo) {
    let invitadoHtml = '';
    if (citaInfo.invitado) {
        invitadoHtml = `
      <hr>
      <h3>Información de tu invitado:</h3>
      <p><b>Nombre:</b> ${citaInfo.invitado.nombre}</p>
      <p><b>Servicio:</b> ${citaInfo.invitado.servicio}</p>
      <p><b>Barbero:</b> ${citaInfo.invitado.barbero}</p>
      <p><b>Fecha:</b> ${formatFecha(citaInfo.invitado.fecha)}</p>
      <p><b>Hora:</b> ${citaInfo.invitado.hora}</p>
    `;
    }
    const importeHtml = citaInfo.importe_pagado
        ? `<p><b>Importe pagado:</b> ${citaInfo.importe_pagado / 100} €</p>`
        : '';
    const info = await transporter.sendMail({
        from: '"Rasoio Barber Shop" <no-reply@barberia.com>',
        to,
        subject: 'Confirmación de tu cita',
        html: `
      <h2>¡Cita reservada!</h2>
      <p><b>Servicio:</b> ${citaInfo.servicio}</p>
      <p><b>Barbero:</b> ${citaInfo.barbero}</p>
      <p><b>Fecha:</b> ${formatFecha(citaInfo.fecha)}</p>
      <p><b>Hora:</b> ${citaInfo.hora}</p>
      ${importeHtml}
      ${invitadoHtml}
    `,
    });
}
function formatFecha(fecha) {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
}
