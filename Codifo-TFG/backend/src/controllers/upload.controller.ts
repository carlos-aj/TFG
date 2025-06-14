import { Request, Response } from 'express';

export function uploadImagen(req: Request, res: Response) {
  try {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({ message: 'No se han subido archivos' });
    }
    
    const invalidFiles = (req.files as Express.Multer.File[]).filter(
      file => !file.mimetype.startsWith('image/')
    );
    
    if (invalidFiles.length > 0) {
      return res.status(400).json({ 
        message: 'Solo se permiten archivos de imagen',
        invalidFiles: invalidFiles.map(f => f.originalname)
      });
    }
    
    const filenames = req.files.map((file: Express.Multer.File) => file.filename);
    res.status(200).json({ filenames });
  } catch (error: any) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({ 
      message: 'Error al subir imágenes', 
      error: error.message 
    });
  }
}