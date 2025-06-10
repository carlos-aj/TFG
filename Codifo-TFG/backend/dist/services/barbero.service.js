"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBarberoById = getBarberoById;
exports.getAllBarberos = getAllBarberos;
exports.createBarbero = createBarbero;
exports.deleteBarbero = deleteBarbero;
exports.updateBarbero = updateBarbero;
const Barbero_1 = require("../models/Barbero");
async function getBarberoById(id) {
    return await Barbero_1.Barbero.query().findById(id);
}
async function getAllBarberos() {
    return await Barbero_1.Barbero.query().select();
}
async function createBarbero(data) {
    return await Barbero_1.Barbero.query().insert(data);
}
async function deleteBarbero(id) {
    return await Barbero_1.Barbero.query().deleteById(id);
}
async function updateBarbero(data, id) {
    return await Barbero_1.Barbero.query().patchAndFetchById(id, data);
}
