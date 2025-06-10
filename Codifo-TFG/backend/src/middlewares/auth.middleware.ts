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
  userId: number;
  role: string;
}

// Middleware para verificar si el usuario está autenticado
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Invalid token format' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.query().findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
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

      if (roles.includes(user.rol)) {
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

      if (user.rol === 'admin' || user.id === resourceId) {
        next();
        return;
      }

      res.status(403).json({ message: 'Unauthorized' });
    } catch (err) {
      res.status(500).json({ message: 'Error checking authorization' });
    }
  };
}; 