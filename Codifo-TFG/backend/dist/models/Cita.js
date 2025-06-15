"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cita = void 0;
const objection_1 = require("objection");
class Cita extends objection_1.Model {
    static get relationMappings() {
        const { User } = require('./User');
        const { Barbero } = require('./Barbero');
        const { Servicio } = require('./Servicio');
        return {
            user: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'cita.user_id',
                    to: 'users.id'
                }
            },
            barbero: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: Barbero,
                join: {
                    from: 'cita.barbero_id',
                    to: 'barbero.id'
                }
            },
            servicio: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: Servicio,
                join: {
                    from: 'cita.servicio_id',
                    to: 'servicios.id'
                }
            }
        };
    }
}
exports.Cita = Cita;
Cita.tableName = 'cita';
Cita.jsonSchema = {
    type: 'object',
    required: ['barbero_id', 'servicio_id', 'fecha', 'hora'],
    properties: {
        id: { type: 'integer' },
        user_id: { type: ['integer', 'null'] },
        barbero_id: { type: 'integer' },
        servicio_id: { type: 'integer' },
        fecha: { type: 'string', format: 'date' },
        hora: { type: 'string' },
        estado: { type: 'boolean', default: false },
        pagado: { type: 'boolean', default: false },
        nombre_invitado: { type: ['string', 'null'] },
        servicio_id_invitado: { type: ['integer', 'null'] },
        barbero_id_invitado: { type: ['integer', 'null'] },
        hora_invitado: { type: ['string', 'null'] },
        created_at: { type: 'string' },
        updated_at: { type: 'string' }
    }
};
