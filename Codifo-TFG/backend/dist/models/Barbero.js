"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Barbero = void 0;
const objection_1 = require("objection");
const Cita_1 = require("./Cita");
class Barbero extends objection_1.Model {
}
exports.Barbero = Barbero;
Barbero.tableName = 'barbero';
Barbero.relationMappings = {
    citas: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: Cita_1.Cita,
        join: {
            from: 'barbero.id',
            to: 'cita.barbero_id'
        }
    }
};
