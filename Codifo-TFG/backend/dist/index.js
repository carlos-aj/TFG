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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const security_middleware_1 = require("./middlewares/security.middleware");
const knex_1 = __importDefault(require("./db/knex"));
const user_routes_1 = require("./routes/user.routes");
const cita_routes_1 = require("./routes/cita.routes");
const servicio_routes_1 = require("./routes/servicio.routes");
const barbero_routes_1 = require("./routes/barbero.routes");
const public_routes_1 = require("./routes/public.routes");
const galeria_routes_1 = require("./routes/galeria.routes");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://www.rasoio.es'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use('/api/stripe-webhook', express_1.default.raw({ type: 'application/json' }), public_routes_1.publicRouter);
app.use(express_1.default.json());
app.use(security_middleware_1.protectApi);
app.use('/api/user', user_routes_1.userRouter);
app.use('/api/cita', cita_routes_1.citaRouter);
app.use('/api/servicio', servicio_routes_1.servicioRouter);
app.use('/api/barbero', barbero_routes_1.barberoRouter);
app.use('/api/galeria', galeria_routes_1.galeriaRouter);
async function syncCitaSequence() {
    try {
        const result = await knex_1.default.raw("SELECT setval('cita_id_seq', COALESCE((SELECT MAX(id) FROM cita), 0) + 1, false);");
        console.log('Secuencia de ID de citas sincronizada correctamente.', result);
    }
    catch (error) {
        console.error('Error al sincronizar la secuencia de citas:', error);
    }
}
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Servidor en puerto ${PORT}`);
    await syncCitaSequence();
});
