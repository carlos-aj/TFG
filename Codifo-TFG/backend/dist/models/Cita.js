"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cita = void 0;
const objection_1 = require("objection");
const User_1 = require("./User");
const Barbero_1 = require("./Barbero");
const Servicio_1 = require("./Servicio");
class Cita extends objection_1.Model {
}
exports.Cita = Cita;
Cita.tableName = 'cita';
Cita.relationMappings = {
    user: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: User_1.User,
        join: {
            from: 'cita.user_id',
            to: 'users.id'
        }
    },
    barbero: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: Barbero_1.Barbero,
        join: {
            from: 'cita.barbero_id',
            to: 'barbero.id'
        }
    },
    servicio: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: Servicio_1.Servicio,
        join: {
            from: 'cita.servicio_id',
            to: 'servicio.id'
        }
    }
};
