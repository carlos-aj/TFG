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

import knex from './db/knex';
const cors = require('cors');

const app = express();

// Asegurarse de que la URL no termine en /
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const cleanFrontendUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;

app.use(cors({
  origin: cleanFrontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/galeria', express.static(path.join(__dirname, 'ApiGaleria')));


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

app.use('/public', express.static(path.join(__dirname, '../../public')));

// Iniciar servidor
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en puerto ${PORT}`);
});
