import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { protectApi } from './middlewares/security.middleware';
import knex from './db/knex'; // Asegúrate de que la exportación de knex lo permita

// Importar rutas
import { userRouter } from './routes/user.routes';
import citaRouter from './routes/cita.routes';
import { servicioRouter } from './routes/servicio.routes';
import { barberoRouter } from './routes/barbero.routes';
import { webhookRouter } from './routes/webhook.routes';
import { galeriaRouter } from './routes/galeria.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configurar CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://tfg-gamma.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Configurar el webhook de Stripe antes de express.json()
app.use('/webhook', express.raw({type: 'application/json'}));

app.use(cookieParser());
app.use(express.json());

// Aplicar middleware de seguridad para proteger todas las rutas de la API
app.use(protectApi);

// Rutas
app.use('/api/user', userRouter);
app.use('/api/cita', citaRouter);
app.use('/api/servicio', servicioRouter);
app.use('/api/barbero', barberoRouter);
app.use('/api/galeria', galeriaRouter);
app.use('/webhook', webhookRouter);

// Función para sincronizar la secuencia de la tabla 'cita'
async function syncCitaSequence() {
  try {
    const result = await knex.raw("SELECT setval('cita_id_seq', COALESCE((SELECT MAX(id) FROM cita), 1), false);");
    console.log('Secuencia de ID de citas sincronizada correctamente.', result);
  } catch (error) {
    console.error('Error al sincronizar la secuencia de citas:', error);
  }
}

// Iniciar servidor
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Servidor en puerto ${PORT}`);
  await syncCitaSequence();
});
