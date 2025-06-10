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
const Cita_1 = require("../models/Cita");
const User_1 = require("../models/User");
const Barbero_1 = require("../models/Barbero");
const Servicio_1 = require("../models/Servicio");
async function getAllCitas() {
    return await Cita_1.Cita.query();
}
async function getCitaById(id) {
    return await Cita_1.Cita.query().findById(id);
}
async function createCita(data) {
    return await Cita_1.Cita.query().insert(data);
}
async function updateCita(id, data) {
    return await Cita_1.Cita.query().patchAndFetchById(id, data);
}
async function deleteCita(id) {
    return await Cita_1.Cita.query().deleteById(id);
}
async function findCitaByBarberoFechaHora(barbero_id, fecha, hora) {
    return await Cita_1.Cita.query().where({ barbero_id, fecha, hora }).first();
}
async function getCitaInfoForEmail(data) {
    const [user, barbero, servicio] = await Promise.all([
        User_1.User.query().findById(data.user_id),
        Barbero_1.Barbero.query().findById(data.barbero_id),
        Servicio_1.Servicio.query().findById(data.servicio_id),
    ]);
    return { user, barbero, servicio };
}
async function puedeInvitar(barbero_id, fecha, hora) {
    // Busca si hay alguna cita en esa fecha y hora (con cualquier barbero)
    const citaExistente = await Cita_1.Cita.query()
        .where('fecha', fecha)
        .where('hora', hora)
        .first();
    // Si NO hay ninguna cita, puedes invitar
    return !citaExistente;
}
async function getBarberoNombreById(id) {
    const barbero = await Barbero_1.Barbero.query().findById(id);
    return barbero ? barbero.nombre : id;
}
async function getCitasByBarberoYFecha(barbero_id, fecha) {
    return await Cita_1.Cita.query()
        .where('barbero_id', barbero_id)
        .whereRaw('fecha::date = ?', [fecha]);
}
