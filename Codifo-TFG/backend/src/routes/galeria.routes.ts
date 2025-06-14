import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as UploadController from '../controllers/upload.controller';
import * as GaleriaController from '../controllers/galeria.controller';

// Filtro para validar que solo se suban imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar que el tipo MIME comience con 'image/'
  if (file.mimetype.startsWith('image/')) {
    // Aceptar el archivo
    cb(null, true);
  } else {
    // Rechazar el archivo
    cb(null, false);
  }
};

const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, path.join(__dirname, '../ApiGaleria'));
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Configurar multer con el almacenamiento y el filtro de archivos
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar a 5MB
  }
});

export const galeriaRouter = Router();

// General routes first
galeriaRouter.get('/', GaleriaController.getGalerias);
galeriaRouter.post('/', GaleriaController.createGaleria);

// Ruta de carga de imágenes con manejo de errores
galeriaRouter.post('/upload', (req, res) => {
  upload.array('imagenes')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Error de multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'El archivo es demasiado grande. Tamaño máximo: 5MB' 
        });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Otro tipo de error
      return res.status(400).json({ message: err.message });
    }
    
    // Si no hay errores, continuar con el controlador
    UploadController.uploadImagen(req, res);
  });
});

// ID-specific routes
galeriaRouter.get('/item/:id', GaleriaController.getGaleriaById);
galeriaRouter.put('/item/:id', GaleriaController.updateGaleria);
galeriaRouter.delete('/item/:id', GaleriaController.deleteGaleria);

// Filename route - this should be last as it's a catch-all for this router
galeriaRouter.get('/:filename', GaleriaController.getImagenByName);

