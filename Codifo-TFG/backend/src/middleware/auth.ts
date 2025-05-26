import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;


export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token){
    res.sendStatus(401);
  }else{
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err){
            res.sendStatus(403);
        }else{
        (req as any).user = user;
        next();
        }
    });
    }
}
