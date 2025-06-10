import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware para verificar si el usuario está autenticado
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Verificar si hay un token en las cookies
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: 'No autorizado: token no proporcionado' });
      return;
    }

    // Verificar el token
    const secretKey = process.env.JWT_SECRET || 'tu_clave_secreta';
    const decoded = jwt.verify(token, secretKey);
    
    // Añadir el usuario decodificado a la solicitud
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'No autorizado: token inválido' });
  }
};

// Middleware para verificar roles específicos
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Primero verificar si el usuario está autenticado
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
        return;
      }
      
      // Verificar si el usuario tiene el rol requerido
      if (!roles.includes(req.user.rol)) {
        res.status(403).json({ message: 'Prohibido: no tienes permisos suficientes' });
        return;
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error en la verificación de roles' });
    }
  };
};

// Middleware para verificar si el usuario es el propietario del recurso o un admin
export const isOwnerOrAdmin = (idParamName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verificar si el usuario está autenticado
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado: usuario no autenticado' });
        return;
      }
      
      // Si es admin o empleado, permitir acceso
      if (req.user.rol === 'admin' || req.user.rol === 'empleado') {
        next();
        return;
      }
      
      // Si es el propietario del recurso, permitir acceso
      const resourceId = req.params[idParamName];
      if (req.user.id === parseInt(resourceId)) {
        next();
        return;
      }
      
      // Si no es ninguno de los anteriores, denegar acceso
      res.status(403).json({ message: 'Prohibido: no tienes permisos suficientes' });
    } catch (error) {
      res.status(500).json({ message: 'Error en la verificación de permisos' });
    }
  };
}; 