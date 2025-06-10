"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Galeria = void 0;
const objection_1 = require("objection");
class Galeria extends objection_1.Model {
}
exports.Galeria = Galeria;
Galeria.tableName = 'galeria';
Galeria.relationMappings = {
    barbero: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./Barbero').Barbero,
        join: {
            from: 'galeria.barbero_id',
            to: 'barbero.id'
        }
    }
};
