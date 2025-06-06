import { Request, Response } from 'express';

export function uploadImagen(req: Request, res: Response) {
  if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
    res.status(400).json({ message: 'No files uploaded' });
  }else{
  const filenames = req.files.map((file: any) => file.filename);
  res.json({ filenames });
  }
}