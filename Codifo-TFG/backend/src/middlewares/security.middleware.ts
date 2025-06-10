import { Request, Response, NextFunction } from 'express';

// Middleware para proteger las rutas de la API
export const protectApi = (req: Request, res: Response, next: NextFunction): void => {
  // Verificar si la solicitud tiene un token de autenticación
  const token = req.cookies.token;
  
  // Si no hay token y no es una ruta pública, denegar acceso
  if (!token && !isPublicRoute(req.path, req.method)) {
    res.status(401).json({ 
      message: 'Acceso denegado. Inicia sesión para acceder a esta ruta.',
      error: 'UNAUTHORIZED'
    });
    return;
  }
  
  next();
};

// Rutas que deben ser públicas (login, registro, etc.)
const publicRoutes = [
  '/api/user/login',
  '/api/user/logout',
  '/api/user/confirm',
  '/api/galeria',
  '/galeria',
  '/api/barbero',
  '/api/servicio'
];

// Función para verificar si una ruta es pública
const isPublicRoute = (path: string, method: string): boolean => {
  // Verificar si la ruta es exactamente una ruta pública
  if (publicRoutes.includes(path)) {
    return true;
  }
  
  // Verificar si la ruta comienza con una ruta pública
  for (const route of publicRoutes) {
    if (path.startsWith(`${route}/`)) {
      return true;
    }
  }
  
  // Si es una solicitud POST a /api/user (registro)
  if (path === '/api/user' && method === 'POST') {
    return true;
  }
  
  return false;
}; 