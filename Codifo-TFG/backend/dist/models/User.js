"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const objection_1 = require("objection");
class User extends objection_1.Model {
    static get relationMappings() {
        const { Cita } = require('./Cita');
        const { Barbero } = require('./Barbero');
        return {
            citas: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: Cita,
                join: {
                    from: 'users.id',
                    to: 'cita.user_id'
                }
            },
            barbero: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: Barbero,
                join: {
                    from: 'users.barbero_id',
                    to: 'barbero.id'
                }
            }
        };
    }
}
exports.User = User;
User.tableName = 'users';
