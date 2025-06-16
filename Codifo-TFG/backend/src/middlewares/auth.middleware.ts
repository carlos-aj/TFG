import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Cita } from '../models/Cita';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface JwtPayload {
  userId?: number;
  id?: number;  
  email: string;
  rol: string;
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = req.cookies?.token;
    }

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      res.status(500).json({ message: 'Error en la configuración del servidor' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      const userId = decoded.userId || decoded.id;
      if (!userId) {
        res.status(401).json({ message: 'Invalid token: no user ID' });
        return;
      }

      const user = await User.query().findById(userId);

      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error('Error al verificar el token JWT:', jwtError);
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error('Error de autenticación:', err);
    res.status(401).json({ message: 'Authentication error' });
  }
};

export const hasRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as User;
      if (!user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const userRole = user.rol === 'user' ? 'cliente' : user.rol;
      
      
      if (roles.includes(userRole)) {
        next();
        return;
      }

      res.status(403).json({ message: 'Insufficient permissions' });
    } catch (err) {
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

export const isOwnerOrAdmin = (paramName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as User;
      const resourceId = parseInt(req.params[paramName]);

      if (user.rol === 'admin' || user.rol === 'empleado') {
        next();
        return;
      }
      
      if (user.id === resourceId) {
        next();
        return;
      }

      res.status(403).json({ message: 'Unauthorized' });
    } catch (err) {
      res.status(500).json({ message: 'Error checking authorization' });
    }
  };
};

export const isCitaOwnerOrAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as User;
      const citaId = parseInt(req.params.id);

      if (user.rol === 'admin' || user.rol === 'empleado') {
        next();
        return;
      }
      
      const cita = await Cita.query().findById(citaId);
      if (!cita) {
        res.status(404).json({ message: 'Cita no encontrada' });
        return;
      }
      
      if (cita.user_id === user.id) {
        next();
        return;
      }

      res.status(403).json({ message: 'No tienes permiso para modificar esta cita' });
    } catch (err) {
      console.error('Error al verificar permisos de cita:', err);
      res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
}; 