import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { protectApi } from './middlewares/security.middleware';
import knex from './db/knex'; // Asegúrate de que la exportación de knex lo permita
import path from 'path'; // Importar el módulo path

// Importar rutas
import { userRouter } from './routes/user.routes';
import citaRouter from './routes/cita.routes';
import { servicioRouter } from './routes/servicio.routes';
import { barberoRouter } from './routes/barbero.routes';
import { publicRouter } from './routes/public.routes';
import { galeriaRouter } from './routes/galeria.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configurar CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://tfg-gamma.vercel.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Middlewares generales
app.use(cookieParser());

// La ruta del webhook de Stripe necesita un parser de body diferente (raw) y no debe tener el parser de JSON global.
app.use('/stripe-webhook', express.raw({ type: 'application/json' }), publicRouter);

// Para el resto de la API, usamos el parser de JSON.
app.use(express.json());
app.use(protectApi); // Middleware de seguridad

// Rutas de la API
app.use('/api/user', userRouter);
app.use('/api/cita', citaRouter);
app.use('/api/servicio', servicioRouter);
app.use('/api/barbero', barberoRouter);
app.use('/api/galeria', galeriaRouter);

// Función para sincronizar la secuencia de la tabla 'cita'
async function syncCitaSequence() {
  try {
    const result = await knex.raw("SELECT setval('cita_id_seq', COALESCE((SELECT MAX(id) FROM cita), 0) + 1, false);");
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
