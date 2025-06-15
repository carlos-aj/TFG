"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Servicio = void 0;
const objection_1 = require("objection");
class Servicio extends objection_1.Model {
    static get relationMappings() {
        const { Cita } = require('./Cita');
        return {
            citas: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: Cita,
                join: {
                    from: 'servicios.id',
                    to: 'cita.servicio_id'
                }
            }
        };
    }
}
exports.Servicio = Servicio;
Servicio.tableName = 'servicios';
