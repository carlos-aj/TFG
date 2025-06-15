"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.login = login;
exports.logout = logout;
exports.sancionarUsuario = sancionarUsuario;
exports.asignarBarbero = asignarBarbero;
exports.asignarBarberoEmpleado = asignarBarberoEmpleado;
const UserService = __importStar(require("../services/user.service"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET;
async function getUserById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const user = await UserService.getUserById(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error('Error getting user:', err);
        res.status(500).json({ message: 'Error getting user' });
    }
}
async function getAllUsers(req, res) {
    try {
        const users = await UserService.getAllUsers();
        if (req.user && req.user.rol === 'empleado') {
            const filteredUsers = users.map(user => ({
                id: user.id,
                nombre: user.nombre,
                apellidos: user.apellidos
            }));
            res.json(filteredUsers);
        }
        else {
            res.json(users);
        }
    }
    catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ message: 'Error getting users' });
    }
}
async function createUser(req, res) {
    try {
        const userData = req.body;
        const newUser = await UserService.createUser(userData);
        res.status(201).json({
            message: 'Usuario creado exitosamente. Por favor, revisa tu correo para confirmar tu cuenta.',
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                apellidos: newUser.apellidos,
                email: newUser.email,
                rol: newUser.rol
            }
        });
    }
    catch (err) {
        console.error('Error creating user:', err);
        if (err.code === '23505' && err.constraint === 'users_email_unique') {
            res.status(409).json({ message: 'El correo electrónico ya está registrado' });
            return;
        }
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
}
async function deleteUser(req, res) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await UserService.deleteUser(id);
        if (deleted === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
}
async function updateUser(req, res) {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        const updatedUser = await UserService.updateUser(data, id);
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(updatedUser);
    }
    catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
}
async function confirmUser(req, res) {
    try {
        const token = req.query.token;
        const user = await UserService.confirmUser(token);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User confirmed successfully' });
    }
    catch (err) {
        console.error('Error confirming user:', err);
        res.status(500).json({ message: 'Error confirming user' });
    }
}
async function login(req, res) {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
        res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
        return;
    }
    try {
        const user = await UserService.getUserByEmail(correo);
        if (!user) {
            res.status(401).json({ message: 'Credenciales incorrectas' });
            return;
        }
        const passwordMatch = await bcrypt_1.default.compare(contrasena, user.contrasena);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Credenciales incorrectas' });
            return;
        }
        if (!user.is_verified) {
            res.status(403).json({ message: 'Debes confirmar tu cuenta antes de iniciar sesión' });
            return;
        }
        if (!JWT_SECRET) {
            console.error('JWT_SECRET no está definido en las variables de entorno');
            res.status(500).json({ message: 'Error en la configuración del servidor' });
            return;
        }
        let rol = user.rol;
        if (rol !== 'admin' && rol !== 'empleado' && rol !== 'user' && rol !== 'cliente') {
            rol = 'cliente';
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            rol: rol
        }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 60 * 60 * 1000
        });
        const responseData = {
            success: true,
            token,
            rol,
            id: user.id,
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email
        };
        if (rol === 'empleado') {
            responseData.barbero_id = user.barbero_id || null;
        }
        res.json(responseData);
    }
    catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}
async function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ message: 'Logout successful' });
}
async function sancionarUsuario(req, res) {
    try {
        const id = parseInt(req.params.id);
        const user = await UserService.getUserById(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const nuevaPenalizacion = (user.penalizacion || 0) + 1;
        const updated = await UserService.updateUser({ penalizacion: nuevaPenalizacion }, id);
        res.json({ message: 'Usuario sancionado', penalizacion: nuevaPenalizacion });
    }
    catch (err) {
        res.status(500).json({ message: 'Error sancionando usuario' });
    }
}
async function asignarBarbero(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const { barbero_id } = req.body;
        if (!barbero_id) {
            res.status(400).json({ message: 'El ID del barbero es obligatorio' });
            return;
        }
        const user = await UserService.getUserById(userId);
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        if (user.rol !== 'empleado') {
            res.status(400).json({ message: 'Solo se puede asignar un barbero a usuarios con rol "empleado"' });
            return;
        }
        const barbero = await UserService.getBarberoById(parseInt(barbero_id));
        if (!barbero) {
            res.status(404).json({ message: 'Barbero no encontrado' });
            return;
        }
        const updated = await UserService.updateUser({ barbero_id: parseInt(barbero_id) }, userId);
        res.json({
            message: 'Barbero asignado correctamente',
            user: updated,
            barbero: {
                id: barbero.id,
                nombre: barbero.nombre
            }
        });
    }
    catch (err) {
        console.error('Error al asignar barbero:', err);
        res.status(500).json({ message: 'Error al asignar barbero' });
    }
}
async function asignarBarberoEmpleado(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const { barbero_id } = req.body;
        if (!barbero_id) {
            res.status(400).json({ message: 'El ID del barbero es obligatorio' });
            return;
        }
        const user = await UserService.getUserById(userId);
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        if (user.rol !== 'empleado') {
            res.status(400).json({ message: 'Solo los empleados pueden usar esta función' });
            return;
        }
        const barbero = await UserService.getBarberoById(parseInt(barbero_id));
        if (!barbero) {
            res.status(404).json({ message: 'Barbero no encontrado' });
            return;
        }
        const updated = await UserService.updateUser({ barbero_id: parseInt(barbero_id) }, userId);
        res.json({
            message: 'Barbero asignado correctamente',
            user: updated,
            barbero: {
                id: barbero.id,
                nombre: barbero.nombre
            }
        });
    }
    catch (err) {
        console.error('Error al asignar barbero:', err);
        res.status(500).json({ message: 'Error al asignar barbero' });
    }
}
