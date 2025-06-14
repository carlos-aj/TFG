import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as UploadController from '../controllers/upload.controller';
import * as GaleriaController from '../controllers/galeria.controller';

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
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

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});

export const galeriaRouter = Router();

galeriaRouter.get('/', GaleriaController.getGalerias);
galeriaRouter.post('/', GaleriaController.createGaleria);

galeriaRouter.post('/upload', (req, res) => {
  upload.array('imagenes')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'El archivo es demasiado grande. Tamaño máximo: 5MB' 
        });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    UploadController.uploadImagen(req, res);
  });
});

galeriaRouter.get('/item/:id', GaleriaController.getGaleriaById);
galeriaRouter.put('/item/:id', GaleriaController.updateGaleria);
galeriaRouter.delete('/item/:id', GaleriaController.deleteGaleria);

galeriaRouter.get('/:filename', GaleriaController.getImagenByName);

