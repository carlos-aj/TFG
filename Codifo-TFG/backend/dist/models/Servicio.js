"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Servicio = void 0;
const objection_1 = require("objection");
const Cita_1 = require("./Cita");
class Servicio extends objection_1.Model {
}
exports.Servicio = Servicio;
Servicio.tableName = 'servicios';
Servicio.relationMappings = {
    citas: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: Cita_1.Cita,
        join: {
            from: 'servicio.id',
            to: 'cita.servicio_id'
        }
    }
};
