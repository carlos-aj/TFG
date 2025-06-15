"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCitas = getAllCitas;
exports.getCitaById = getCitaById;
exports.createCita = createCita;
exports.updateCita = updateCita;
exports.deleteCita = deleteCita;
exports.findCitaByBarberoFechaHora = findCitaByBarberoFechaHora;
exports.getCitaInfoForEmail = getCitaInfoForEmail;
exports.puedeInvitar = puedeInvitar;
exports.getBarberoNombreById = getBarberoNombreById;
exports.getCitasByBarberoYFecha = getCitasByBarberoYFecha;
exports.getCitasByBarbero = getCitasByBarbero;
exports.getCitasByFecha = getCitasByFecha;
const Cita_1 = require("../models/Cita");
const User_1 = require("../models/User");
const Barbero_1 = require("../models/Barbero");
const Servicio_1 = require("../models/Servicio");
async function getAllCitas() {
    try {
        const citas = await Cita_1.Cita.query()
            .withGraphFetched('[user, barbero, servicio]')
            .orderBy('barbero_id', 'asc')
            .orderBy('hora', 'asc');
        const citasFormateadas = citas.map(c => {
            if (c.fecha && typeof c.fecha !== 'string') {
                const fecha = new Date(c.fecha);
                return {
                    ...c,
                    fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
                };
            }
            return c;
        });
        return citasFormateadas;
    }
    catch (error) {
        console.error('Error al obtener todas las citas:', error);
        throw error;
    }
}
async function getCitaById(id) {
    try {
        return await Cita_1.Cita.query()
            .findById(id)
            .withGraphFetched('[user, barbero, servicio]');
    }
    catch (error) {
        console.error(`Error al obtener cita con ID ${id}:`, error);
        throw error;
    }
}
async function createCita(data, trx) {
    try {
        if (data.user_id === undefined) {
            data.user_id = null;
        }
        const query = Cita_1.Cita.query(trx).insert(data);
        const result = await query;
        return result;
    }
    catch (error) {
        console.error('Error al crear cita:', error);
        throw error;
    }
}
async function updateCita(id, data) {
    try {
        return await Cita_1.Cita.query().patchAndFetchById(id, data);
    }
    catch (error) {
        console.error(`Error al actualizar cita con ID ${id}:`, error);
        throw error;
    }
}
async function deleteCita(id) {
    try {
        return await Cita_1.Cita.query().deleteById(id);
    }
    catch (error) {
        console.error(`Error al eliminar cita con ID ${id}:`, error);
        throw error;
    }
}
async function findCitaByBarberoFechaHora(barbero_id, fecha, hora, trx) {
    try {
        return await Cita_1.Cita.query(trx).where({ barbero_id, fecha, hora }).first();
    }
    catch (error) {
        console.error(`Error al buscar cita por barbero ${barbero_id}, fecha ${fecha}, hora ${hora}:`, error);
        throw error;
    }
}
async function getCitaInfoForEmail(data) {
    try {
        const promises = [
            data.user_id ? User_1.User.query().findById(data.user_id) : Promise.resolve(null),
            data.barbero_id ? Barbero_1.Barbero.query().findById(data.barbero_id) : Promise.resolve(null),
            data.servicio_id ? Servicio_1.Servicio.query().findById(data.servicio_id) : Promise.resolve(null),
        ];
        const [user, barbero, servicio] = await Promise.all(promises);
        return {
            user: user,
            barbero: barbero,
            servicio: servicio
        };
    }
    catch (error) {
        console.error('Error al obtener información para email:', error);
        throw error;
    }
}
async function puedeInvitar(barbero_id, fecha, hora) {
    try {
        const citaExistente = await Cita_1.Cita.query()
            .where('fecha', fecha)
            .where('hora', hora)
            .first();
        const resultado = !citaExistente;
        return resultado;
    }
    catch (error) {
        console.error(`Error al verificar si puede invitar: barbero ${barbero_id}, fecha ${fecha}, hora ${hora}:`, error);
        throw error;
    }
}
async function getBarberoNombreById(id) {
    try {
        const barbero = await Barbero_1.Barbero.query().findById(id);
        return barbero ? barbero.nombre : id;
    }
    catch (error) {
        console.error(`Error al obtener nombre de barbero con ID ${id}:`, error);
        throw error;
    }
}
async function getCitasByBarberoYFecha(barbero_id, fecha_inicio, fecha_fin) {
    try {
        let query = Cita_1.Cita.query().where('barbero_id', barbero_id);
        if (fecha_fin) {
            query = query.whereRaw('fecha::date >= ?::date', [fecha_inicio])
                .whereRaw('fecha::date <= ?::date', [fecha_fin]);
        }
        else {
            query = query.whereRaw('fecha::date = ?::date', [fecha_inicio]);
        }
        query = query.withGraphFetched('[user, barbero, servicio]')
            .orderBy('hora', 'asc');
        const citas = await query;
        const citasFormateadas = citas.map(c => {
            if (c.fecha && typeof c.fecha !== 'string') {
                const fecha = new Date(c.fecha);
                return {
                    ...c,
                    fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
                };
            }
            return c;
        });
        return citasFormateadas;
    }
    catch (error) {
        console.error(`Error al obtener citas por barbero ${barbero_id} y fechas ${fecha_inicio} - ${fecha_fin || fecha_inicio}:`, error);
        throw error;
    }
}
async function getCitasByBarbero(barbero_id) {
    try {
        const citas = await Cita_1.Cita.query()
            .where('barbero_id', barbero_id)
            .withGraphFetched('[user, barbero, servicio]')
            .orderBy('fecha', 'asc')
            .orderBy('hora', 'asc');
        const citasFormateadas = citas.map(c => {
            if (c.fecha && typeof c.fecha !== 'string') {
                const fecha = new Date(c.fecha);
                return {
                    ...c,
                    fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
                };
            }
            return c;
        });
        return citasFormateadas;
    }
    catch (error) {
        console.error(`Error al obtener citas por barbero ${barbero_id}:`, error);
        throw error;
    }
}
async function getCitasByFecha(fecha_inicio, fecha_fin) {
    try {
        let query = Cita_1.Cita.query();
        if (fecha_fin) {
            query = query.whereRaw('fecha::date >= ?::date', [fecha_inicio])
                .whereRaw('fecha::date <= ?::date', [fecha_fin]);
        }
        else {
            query = query.whereRaw('fecha::date = ?::date', [fecha_inicio]);
        }
        query = query.withGraphFetched('[user, barbero, servicio]')
            .orderBy('barbero_id', 'asc')
            .orderBy('hora', 'asc');
        const citas = await query;
        const citasFormateadas = citas.map(c => {
            if (c.fecha && typeof c.fecha !== 'string') {
                const fecha = new Date(c.fecha);
                return {
                    ...c,
                    fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
                };
            }
            return c;
        });
        return citasFormateadas;
    }
    catch (error) {
        console.error(`Error al obtener citas por rango de fechas ${fecha_inicio} - ${fecha_fin || fecha_inicio}:`, error);
        throw error;
    }
}
