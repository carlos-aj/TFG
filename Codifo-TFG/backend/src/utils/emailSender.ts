import * as nodemailer from 'nodemailer';


console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS);

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
    from: '"Tu App" <no-reply@tuapp.com>',
    to,
    subject: 'Confirma tu cuenta',
    html: `<p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
           <a href="${confirmUrl}">Confirmar cuenta</a>`,
  });

  console.log('Correo de confirmación enviado: %s', info.messageId);
}

export async function sendCitaEmail(to: string, citaInfo: any) {
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

  const info = await transporter.sendMail({
    from: '"Barbería" <no-reply@barberia.com>',
    to,
    subject: 'Confirmación de tu cita',
    html: `
      <h2>¡Cita reservada!</h2>
      <p><b>Servicio:</b> ${citaInfo.servicio}</p>
      <p><b>Barbero:</b> ${citaInfo.barbero}</p>
      <p><b>Fecha:</b> ${formatFecha(citaInfo.fecha)}</p>
      <p><b>Hora:</b> ${citaInfo.hora}</p>
      ${invitadoHtml}
    `,
  });
  console.log('Correo de cita enviado: %s', info.messageId);
}

function formatFecha(fecha: string) {
  // Si ya es tipo Date, conviértelo a string ISO
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}