import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendConfirmationEmail(to: string, token: string) {
  const confirmUrl = `${process.env.FRONTEND_URL}/confirm?token=${token}`;

  const info = await transporter.sendMail({
    from: '""Rasoio Barber Shop" <no-reply@tuapp.com>',
    to,
    subject: 'Confirma tu cuenta',
    html: `<p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
           <a href="${confirmUrl}">Confirmar cuenta</a>`,
  });

}

interface InvitadoInfo {
  nombre: string;
  servicio: string | number;
  barbero: string | number;
  fecha: string;
  hora: string;
}

interface CitaEmailInfo {
  servicio: string | number;
  barbero: string | number;
  fecha: string;
  hora: string;
  importe_pagado?: number | null;
  invitado?: InvitadoInfo | null;
}

export async function sendCitaEmail(to: string, citaInfo: CitaEmailInfo) {
  try {
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

    const estadoPagoHtml = citaInfo.importe_pagado && citaInfo.importe_pagado > 0
      ? `<p><b>Estado del pago:</b> Pagado</p><p><b>Importe pagado:</b> ${citaInfo.importe_pagado} €</p>`
      : `<p><b>Estado del pago:</b> Pendiente de pago en el local</p>`;

    const info = await transporter.sendMail({
      from: '""Rasoio Barber Shop" <no-reply@barberia.com>',
      to,
      subject: 'Confirmación de tu cita',
      html: `
        <h2>¡Cita reservada!</h2>
        <p><b>Servicio:</b> ${citaInfo.servicio}</p>
        <p><b>Barbero:</b> ${citaInfo.barbero}</p>
        <p><b>Fecha:</b> ${formatFecha(citaInfo.fecha)}</p>
        <p><b>Hora:</b> ${citaInfo.hora}</p>
        ${estadoPagoHtml}
        ${invitadoHtml}
      `,
    });
  } catch (error) {
    console.error('Error al enviar correo de cita:', error);
    throw error;
  }
}

function formatFecha(fecha: string) {
  try {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return fecha;
  }
}