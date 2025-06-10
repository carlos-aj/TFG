import * as dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import { userRouter } from './routes/user.routes';
import { barberoRouter } from './routes/barbero.routes';
import { servicioRouter } from './routes/servicio.routes';
import { citaRouter } from './routes/cita.routes';
import { galeriaRouter } from './routes/galeria.routes';
import { protectApi } from './middlewares/security.middleware';

import knex from './db/knex';
const cors = require('cors');

const app = express();

// Configuración de CORS más segura
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://tfg-gamma.vercel.app'
];

// Asegurarse de que las URLs no terminen en /
const cleanAllowedOrigins = allowedOrigins.map(origin => 
  origin.endsWith('/') ? origin.slice(0, -1) : origin
);

app.use(cors({
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    if (cleanAllowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos
app.use('/galeria', express.static(path.join(__dirname, 'ApiGaleria')));
app.use('/public', express.static(path.join(__dirname, '../../public')));

// Aplicar middleware de seguridad para proteger todas las rutas de la API
app.use(protectApi);

// Conexión base de datos
knex.raw('SELECT 1')
  .then(() => console.log('✅ Conexión a la base de datos exitosa'))
  .catch(err => console.error('❌ Error conectando a la base de datos', err));

// Rutas
app.use('/api/user', userRouter);
app.use('/api/barbero', barberoRouter);
app.use('/api/servicio', servicioRouter);
app.use('/api/cita', citaRouter);
app.use('/api/galeria', galeriaRouter);

// Iniciar servidor
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en puerto ${PORT}`);
});
