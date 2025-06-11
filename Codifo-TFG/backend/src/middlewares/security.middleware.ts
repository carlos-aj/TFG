import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId?: number;
  id?: number;
  email: string;
  rol: string;
}

// Middleware para proteger las rutas de la API
export const protectApi = (req: Request, res: Response, next: NextFunction): void => {
  // Permitir solicitudes OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Verificar si la solicitud tiene un token de autenticación
  const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);
  
  // Si no hay token y no es una ruta pública, denegar acceso
  if (!token && !isPublicRoute(req.path, req.method)) {
    console.log('Acceso denegado a ruta protegida:', req.path, req.method);
    res.status(401).json({ 
      message: 'Acceso denegado. Inicia sesión para acceder a esta ruta.',
      error: 'UNAUTHORIZED'
    });
    return;
  }

  // Si hay token, verificar que sea válido (pero no bloquear si no lo es, eso lo hará isAuthenticated)
  if (token && !isPublicRoute(req.path, req.method)) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        console.error('JWT_SECRET no está definido en las variables de entorno');
        next();
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      console.log('Token verificado en protectApi:', { 
        userId: decoded.userId || decoded.id, 
        rol: decoded.rol 
      });
    } catch (err) {
      console.warn('Token inválido en protectApi, continuando...', err);
      // No bloqueamos aquí, dejamos que isAuthenticated lo haga si es necesario
    }
  }
  
  next();
};

// Rutas que deben ser públicas (login, registro, etc.)
const publicRoutes = [
  '/webhook/stripe',
  '/uploads',
  '/api/user/login',
  '/api/user/logout',
  '/api/user/confirm',
  '/api/galeria',
  '/galeria',
  '/api/barbero',
  '/api/servicio',
  '/api/cita/check/puede-invitar',
  '/api/cita/puede-invitar/check'
];

// Función para verificar si una ruta es pública
const isPublicRoute = (path: string, method: string): boolean => {
  console.log('Verificando si la ruta es pública:', path, method);
  
  // Rutas de login y registro siempre son públicas
  if (path === '/api/user/login' || path === '/api/user' && method === 'POST') {
    console.log('Ruta de login/registro permitida');
    return true;
  }
  
  // Verificar si la ruta es exactamente una ruta pública
  if (publicRoutes.includes(path)) {
    console.log('Ruta exacta permitida:', path);
    return true;
  }
  
  // Verificar si la ruta comienza con una ruta pública
  for (const route of publicRoutes) {
    if (path.startsWith(`${route}/`)) {
      console.log('Ruta con prefijo permitida:', path);
      return true;
    }
  }
  
  // GET requests to /api/cita are public
  if (path === '/api/cita' && method === 'GET') {
    console.log('GET a /api/cita permitido');
    return true;
  }
  
  console.log('Ruta no pública:', path);
  return false;
}; 