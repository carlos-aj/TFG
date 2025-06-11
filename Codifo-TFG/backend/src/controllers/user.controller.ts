import { Request, Response } from 'express';
import * as UserService from '../services/user.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET;

export async function getUserById(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID inválido' });
    }else{
      const user = await UserService.getUserById(id);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
  }
  }catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ message: 'Error getting user' });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try{
    const users = await UserService.getAllUsers();
    res.json(users);
  }catch (err){
    console.error('Error getting users:', err);
    res.status(500).json({ message: 'Error getting users'});
  }
}

export async function createUser(req: Request, res: Response) {
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
  } catch (err) {
    console.log('Error creating user:', err);
    res.status(500).json({ message: 'Error creating user' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const deleted = await UserService.deleteUser(id);

    if(deleted === 0){
      res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const data = req.body
    const updatedUser = await UserService.updateUser(data, id)

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  }catch (err){
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Error updating user' });
  }
}

export async function confirmUser(req: Request, res: Response) {
    console.log('Entrando en confirmUser');
  try{
    const token = req.query.token as string;
    const user = await UserService.confirmUser(token);

    if (!user) {
     res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User confirmed successfully' });
  }catch (err){
    console.error('Error confirming user:', err);
    res.status(500).json({ message: 'Error confirming user' });
  }
}

export async function login(req: Request, res: Response) {
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

    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
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
    console.log('Rol original del usuario:', rol);
    
    if (rol !== 'admin' && rol !== 'empleado' && rol !== 'user' && rol !== 'cliente') {
      console.log('Rol no reconocido, asignando cliente por defecto');
      rol = 'cliente';
    }
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        rol: rol
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 60 * 60 * 1000
    });

    console.log('Login exitoso:', { id: user.id, rol, token: token.substring(0, 20) + '...' });
    res.json({ 
      success: true,
      token, 
      rol,
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      email: user.email
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: 'Logout successful' });
}

export async function sancionarUsuario(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const user = await UserService.getUserById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }else{
      const nuevaPenalizacion = (user.penalizacion || 0) + 1;
      const updated = await UserService.updateUser({ penalizacion: nuevaPenalizacion }, id);
      res.json({ message: 'Usuario sancionado', penalizacion: nuevaPenalizacion });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error sancionando usuario' });
  }
}