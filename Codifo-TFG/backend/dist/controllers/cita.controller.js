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
exports.getAllCitas = getAllCitas;
exports.getCitaById = getCitaById;
exports.createCita = createCita;
exports.updateCita = updateCita;
exports.deleteCita = deleteCita;
exports.checkPuedeInvitar = checkPuedeInvitar;
const CitaService = __importStar(require("../services/cita.service"));
const emailSender_1 = require("../utils/emailSender");
const Servicio_1 = require("../models/Servicio");
const User_1 = require("../models/User");
async function getAllCitas(req, res) {
    try {
        const { barbero_id, fecha } = req.query;
        console.log('Controller params:', barbero_id, fecha);
        let citas;
        if (barbero_id && fecha) {
            citas = await CitaService.getCitasByBarberoYFecha(Number(barbero_id), String(fecha));
        }
        else {
            citas = await CitaService.getAllCitas();
        }
        res.json(citas);
    }
    catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ message: 'Failed to retrieve appointments' });
    }
}
async function getCitaById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const cita = await CitaService.getCitaById(id);
        if (!cita) {
            res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(cita);
    }
    catch (err) {
        console.error('Error retrieving appointment:', err);
        res.status(500).json({ message: 'Failed to retrieve appointment' });
    }
}
async function createCita(req, res) {
    try {
        const data = req.body;
        if (data.user_id) {
            const user = await User_1.User.query().findById(data.user_id);
            if (user && user.penalizacion >= 3) {
                res.status(403).json({ message: 'No puedes reservar porque tienes 3 o más sanciones.' });
                return;
            }
        }
        // Obtener duración del servicio principal
        const servicio = await Servicio_1.Servicio.query().findById(data.servicio_id);
        if (!servicio) {
            res.status(400).json({ message: 'Servicio no encontrado' });
            return;
        }
        // Calcular las franjas necesarias para el servicio principal
        const franjas = Math.ceil(servicio.duracion / 30);
        const horas = [];
        let [h, m] = data.hora.split(':').map(Number);
        for (let i = 0; i < franjas; i++) {
            const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            horas.push(horaStr);
            m += 30;
            if (m >= 60) {
                h++;
                m = 0;
            }
        }
        // Comprobar que todas las franjas están libres para el servicio principal
        for (const hora of horas) {
            const citaExistente = await CitaService.findCitaByBarberoFechaHora(data.barbero_id, data.fecha, hora);
            if (citaExistente) {
                res.status(400).json({ message: 'Ya existe una cita para ese barbero en esa fecha y hora.' });
                return;
            }
        }
        // Crear la cita principal (solo campos válidos)
        const newCita = await CitaService.createCita({
            servicio_id: data.servicio_id,
            barbero_id: data.barbero_id,
            fecha: data.fecha,
            hora: data.hora,
            estado: false,
            pagado: false,
            user_id: data.user_id,
            nombre_invitado: undefined
        });
        // Si hay datos de invitado, crear la cita del invitado
        let invitadoInfo = null;
        if (data.nombre_invitado &&
            data.servicio_id_invitado &&
            data.barbero_id_invitado &&
            data.hora_invitado) {
            // Obtener duración del servicio del invitado
            const servicioInvitado = await Servicio_1.Servicio.query().findById(data.servicio_id_invitado);
            if (!servicioInvitado) {
                res.status(400).json({ message: 'Servicio de invitado no encontrado' });
                return;
            }
            // Calcular franjas del invitado
            const franjasInv = Math.ceil(servicioInvitado.duracion / 30);
            const horasInv = [];
            let [hi, mi] = data.hora_invitado.split(':').map(Number);
            for (let i = 0; i < franjasInv; i++) {
                const horaStr = `${String(hi).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
                horasInv.push(horaStr);
                mi += 30;
                if (mi >= 60) {
                    hi++;
                    mi = 0;
                }
            }
            // Comprobar que todas las franjas están libres para el invitado
            for (const hora of horasInv) {
                const citaExistente = await CitaService.findCitaByBarberoFechaHora(data.barbero_id_invitado, data.fecha, hora);
                if (citaExistente) {
                    res.status(400).json({ message: 'Ya existe una cita para ese barbero (invitado) en esa fecha y hora.' });
                    return;
                }
            }
            // Crear cita invitado (solo campos válidos)
            await CitaService.createCita({
                servicio_id: data.servicio_id_invitado,
                barbero_id: data.barbero_id_invitado,
                fecha: data.fecha,
                hora: data.hora_invitado,
                estado: false,
                pagado: false,
                user_id: undefined,
                nombre_invitado: data.nombre_invitado
            });
            invitadoInfo = {
                nombre: data.nombre_invitado,
                servicio: servicioInvitado.nombre,
                barbero: (await CitaService.getBarberoNombreById(data.barbero_id_invitado)),
                fecha: data.fecha,
                hora: data.hora_invitado
            };
        }
        const { user, barbero, servicio: servicioObj } = await CitaService.getCitaInfoForEmail(data);
        if (user && user.email) {
            await (0, emailSender_1.sendCitaEmail)(user.email, {
                servicio: servicioObj?.nombre || data.servicio_id,
                barbero: barbero?.nombre || data.barbero_id,
                fecha: data.fecha,
                hora: data.hora,
                importe_pagado: data.importe_pagado || null,
                invitado: invitadoInfo
            });
        }
        res.status(201).json(newCita);
    }
    catch (err) {
        console.error('Error creating appointment:', err);
        res.status(500).json({ message: 'Failed to create appointment' });
    }
}
async function updateCita(req, res) {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        const updatedCita = await CitaService.updateCita(id, data);
        if (!updatedCita) {
            res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(updatedCita);
    }
    catch (err) {
        console.error('Error updating appointment:', err);
        res.status(500).json({ message: 'Failed to update appointment' });
    }
}
async function deleteCita(req, res) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await CitaService.deleteCita(id);
        if (deleted === 0) {
            res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting appointment:', err);
        res.status(500).json({ message: 'Failed to delete appointment' });
    }
}
async function checkPuedeInvitar(req, res) {
    try {
        const { barbero_id, fecha, hora } = req.query;
        const puede = await CitaService.puedeInvitar(Number(barbero_id), String(fecha), String(hora));
        res.json({ puedeInvitar: puede });
    }
    catch (err) {
        res.status(500).json({ message: 'Error comprobando invitación' });
    }
}
