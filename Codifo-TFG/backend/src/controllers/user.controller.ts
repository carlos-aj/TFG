import { Request, Response } from 'express';
import * as UserService from '../services/user.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET;

export async function getUserById(req: Request, res: Response): Promise<void> {
  try{
    const id = parseInt(req.params.id);
    const user = await UserService.getUserById(id);

    if(!user){
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  }catch (err){
    console.error('Error getting user:', err);
    res.status(500).json({ message: 'Error getting user' });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try{
    const users = await UserService.getAllUsers();
    
    if (req.user && req.user.rol === 'empleado') {
      const filteredUsers = users.map(user => ({
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos
      }));
      res.json(filteredUsers);
    } else {
      res.json(users);
    }
  }catch (err){
    console.error('Error getting users:', err);
    res.status(500).json({ message: 'Error getting users'});
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try{
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
  }catch (err: any){
    console.error('Error creating user:', err);
    if (err.code === '23505' && err.constraint === 'users_email_unique') {
      res.status(409).json({ message: 'El correo electrónico ya está registrado' });
      return;
    }
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try{
    const id = parseInt(req.params.id);
    const deleted = await UserService.deleteUser(id);

    if(deleted === 0){
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try{
    const id = parseInt(req.params.id);
    const data = req.body
    const updatedUser = await UserService.updateUser(data, id)

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(updatedUser);
  }catch (err){
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Error updating user' });
  }
}

export async function confirmUser(req: Request, res: Response): Promise<void> {
  console.log('Entrando en confirmUser');
  try{
    const token = req.query.token as string;
    const user = await UserService.confirmUser(token);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User confirmed successfully' });
  }catch (err){
    console.error('Error confirming user:', err);
    res.status(500).json({ message: 'Error confirming user' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
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

    const responseData: any = { 
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

    console.log('Login exitoso:', { 
      id: user.id, 
      rol, 
      barbero_id: user.barbero_id || 'N/A',
      token: token.substring(0, 20) + '...' 
    });

    res.json(responseData);
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: 'Logout successful' });
}

export async function sancionarUsuario(req: Request, res: Response): Promise<void> {
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
  } catch (err) {
    res.status(500).json({ message: 'Error sancionando usuario' });
  }
}

export async function asignarBarbero(req: Request, res: Response): Promise<void> {
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
  } catch (err) {
    console.error('Error al asignar barbero:', err);
    res.status(500).json({ message: 'Error al asignar barbero' });
  }
}

export async function asignarBarberoEmpleado(req: Request, res: Response): Promise<void> {
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
  } catch (err) {
    console.error('Error al asignar barbero:', err);
    res.status(500).json({ message: 'Error al asignar barbero' });
  }
}