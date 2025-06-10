import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Model } from 'objection';
import Knex from 'knex';
import * as dotenv from 'dotenv';
import { protectApi } from './middlewares/security.middleware';

// Importar rutas
import { userRouter } from './routes/user.routes';
import citaRouter from './routes/cita.routes';
import { servicioRouter } from './routes/servicio.routes';
import { barberoRouter } from './routes/barbero.routes';
import { webhookRouter } from './routes/webhook.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar Knex
const knexConfig = require('./db/knexfile');
const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);
Model.knex(knex);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Rutas
app.use('/api/users', userRouter);
app.use('/api/citas', protectApi, citaRouter);
app.use('/api/servicios', protectApi, servicioRouter);
app.use('/api/barberos', protectApi, barberoRouter);
app.use('/api/webhook', webhookRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
