"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const objection_1 = require("objection");
const Cita_1 = require("./Cita");
class User extends objection_1.Model {
}
exports.User = User;
User.tableName = 'users';
User.relationMappings = {
    citas: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: Cita_1.Cita,
        join: {
            from: 'user.id',
            to: 'cita.user_id'
        }
    }
};
