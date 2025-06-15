"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Barbero = void 0;
const objection_1 = require("objection");
class Barbero extends objection_1.Model {
    static get relationMappings() {
        const { Cita } = require('./Cita');
        return {
            citas: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: Cita,
                join: {
                    from: 'barbero.id',
                    to: 'cita.barbero_id'
                }
            }
        };
    }
}
exports.Barbero = Barbero;
Barbero.tableName = 'barbero';
