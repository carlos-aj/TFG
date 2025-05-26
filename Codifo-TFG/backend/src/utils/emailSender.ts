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
