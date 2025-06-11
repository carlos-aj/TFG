import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as UploadController from '../controllers/upload.controller';
import * as GaleriaController from '../controllers/galeria.controller';

const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, path.join(__dirname, '../ApiGaleria'));
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

export const galeriaRouter = Router();

// General routes first
galeriaRouter.get('/', GaleriaController.getGalerias);
galeriaRouter.post('/', GaleriaController.createGaleria);
galeriaRouter.post('/upload', upload.array('imagenes'), UploadController.uploadImagen);

// ID-specific routes
galeriaRouter.get('/item/:id', GaleriaController.getGaleriaById);
galeriaRouter.put('/item/:id', GaleriaController.updateGaleria);
galeriaRouter.delete('/item/:id', GaleriaController.deleteGaleria);

// Filename route - this should be last as it's a catch-all for this router
galeriaRouter.get('/:filename', GaleriaController.getImagenByName);

