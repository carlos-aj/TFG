"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicioById = getServicioById;
exports.getAllServicios = getAllServicios;
exports.createServicio = createServicio;
exports.deleteServicio = deleteServicio;
exports.updateServicio = updateServicio;
const Servicio_1 = require("../models/Servicio");
async function getServicioById(id) {
    return await Servicio_1.Servicio.query().findById(id);
}
async function getAllServicios() {
    return await Servicio_1.Servicio.query().select();
}
async function createServicio(data) {
    return await Servicio_1.Servicio.query().insert(data);
}
async function deleteServicio(id) {
    return await Servicio_1.Servicio.query().deleteById(id);
}
async function updateServicio(data, id) {
    return await Servicio_1.Servicio.query().patchAndFetchById(id, data);
}
