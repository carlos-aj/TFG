"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
exports.deleteUser = deleteUser;
exports.updateUser = updateUser;
exports.confirmUser = confirmUser;
exports.getUserByEmail = getUserByEmail;
exports.getBarberoById = getBarberoById;
const User_1 = require("../models/User");
const Barbero_1 = require("../models/Barbero");
const emailSender_1 = require("../utils/emailSender");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function getUserById(id) {
    return await User_1.User.query().findById(id);
}
async function getAllUsers() {
    return await User_1.User.query().select();
}
async function createUser(data) {
    const authToken = crypto_1.default.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt_1.default.hash(data.contrasena, 10);
    const user = await User_1.User.query().insert({
        ...data,
        contrasena: hashedPassword,
        rol: data.rol || 'user',
        auth_token: authToken,
        is_verified: false,
    });
    await (0, emailSender_1.sendConfirmationEmail)(user.email, authToken);
    const { auth_token, ...safeUser } = user;
    return safeUser;
}
async function deleteUser(id) {
    return await User_1.User.query().deleteById(id);
}
async function updateUser(data, userId) {
    try {
        return await User_1.User.query().patchAndFetchById(userId, data);
    }
    catch (error) {
        console.error(`Error al actualizar usuario ${userId}:`, error);
        throw error;
    }
}
async function confirmUser(token) {
    const user = await User_1.User.query().findOne({ auth_token: token });
    if (!user) {
        throw new Error('Invalid token');
    }
    const updatedUser = await User_1.User.query().patchAndFetchById(user.id, { is_verified: true, auth_token: null });
    return updatedUser;
}
async function getUserByEmail(email) {
    return await User_1.User.query().findOne({ email });
}
async function getBarberoById(id) {
    return await Barbero_1.Barbero.query().findById(id);
}
