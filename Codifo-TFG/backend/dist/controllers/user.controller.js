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
const UserService = __importStar(require("../services/user.service"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET;
async function getUserById(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: 'ID inválido' });
        }
        else {
            const user = await UserService.getUserById(id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        }
    }
    catch (err) {
        console.error('Error getting user:', err);
        res.status(500).json({ message: 'Error getting user' });
    }
}
async function getAllUsers(req, res) {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    }
    catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ message: 'Error getting users' });
    }
}
async function createUser(req, res) {
    try {
        const { nombre, apellidos, email, telefono, contrasena, rol } = req.body;
        if (!nombre || typeof nombre !== 'string') {
            res.status(400).json({ message: 'El nombre es obligatorio' });
        }
        if (!apellidos || typeof apellidos !== 'string') {
            res.status(400).json({ message: 'Los apellidos son obligatorios' });
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            res.status(400).json({ message: 'Introduce un email válido' });
        }
        if (!telefono || !/^\d{9,15}$/.test(telefono)) {
            res.status(400).json({ message: 'Introduce un número de teléfono válido' });
        }
        if (!contrasena || contrasena.length < 6) {
            res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }
        if (!rol) {
            res.status(400).json({ message: 'El rol es obligatorio' });
        }
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    }
    catch (err) {
        console.log('Error creating user:', err);
        res.status(500).json({ message: 'Error creating user' });
    }
}
async function deleteUser(req, res) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await UserService.deleteUser(id);
        if (deleted === 0) {
            res.status(404).json({ message: 'User not found' });
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
    }
    else {
        const user = await UserService.getUserByEmail(correo);
        if (!user) {
            res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        else {
            const passwordMatch = await bcrypt_1.default.compare(contrasena, user.contrasena);
            if (!passwordMatch) {
                res.status(401).json({ message: 'Credenciales incorrectas' });
            }
            else {
                if (!user.is_verified) {
                    res.status(403).json({ message: 'Debes confirmar tu cuenta antes de iniciar sesión' });
                }
                else {
                    if (!JWT_SECRET) {
                        throw new Error('JWT_SECRET is not defined in environment variables.');
                    }
                    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, {
                        expiresIn: '1h',
                    });
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        maxAge: 60 * 60 * 1000
                    });
                    res.json({ token, rol: user.rol, id: user.id });
                }
            }
        }
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
        }
        else {
            const nuevaPenalizacion = (user.penalizacion || 0) + 1;
            const updated = await UserService.updateUser({ penalizacion: nuevaPenalizacion }, id);
            res.json({ message: 'Usuario sancionado', penalizacion: nuevaPenalizacion });
        }
    }
    catch (err) {
        res.status(500).json({ message: 'Error sancionando usuario' });
    }
}
