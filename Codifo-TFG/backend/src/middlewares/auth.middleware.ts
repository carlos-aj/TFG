import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface JwtPayload {
  userId?: number;
  id?: number;  // Añadir id como campo opcional para compatibilidad con tokens antiguos
  email: string;
  rol: string;
}

// Middleware para verificar si el usuario está autenticado
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verificar token en headers de Authorization
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Si no hay token en headers, intentar obtenerlo de las cookies
      token = req.cookies?.token;
    }

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Verificar el JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      res.status(500).json({ message: 'Error en la configuración del servidor' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log('Token decodificado:', decoded);

    // Buscar usuario en la base de datos
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

    // Añadir el usuario a la solicitud
    req.user = user;
    next();
  } catch (err) {
    console.error('Error de autenticación:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware para verificar roles específicos
export const hasRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as User;
      if (!user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      // Mapear 'user' a 'cliente' si es necesario para compatibilidad
      const userRole = user.rol === 'user' ? 'cliente' : user.rol;
      
      console.log(`Verificando rol: Usuario tiene ${userRole}, se requiere uno de: ${roles.join(', ')}`);
      
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

// Middleware para verificar si el usuario es el propietario del recurso o un admin
export const isOwnerOrAdmin = (paramName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as User;
      const resourceId = parseInt(req.params[paramName]);

      // Los admin y empleados siempre tienen acceso
      if (user.rol === 'admin' || user.rol === 'empleado') {
        next();
        return;
      }
      
      // Los usuarios normales solo pueden acceder a sus propios recursos
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