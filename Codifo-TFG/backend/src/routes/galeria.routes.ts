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

// General routes
galeriaRouter.get('/', GaleriaController.getGalerias);
galeriaRouter.post('/', GaleriaController.createGaleria);

// Upload route
galeriaRouter.post('/upload', upload.array('imagenes'), UploadController.uploadImagen);

// ID-specific routes with regex to match only numbers
galeriaRouter.get('/:id([0-9]+)', GaleriaController.getGaleriaById);
galeriaRouter.put('/:id([0-9]+)', GaleriaController.updateGaleria);
galeriaRouter.delete('/:id([0-9]+)', GaleriaController.deleteGaleria);

// Filename route - will only be matched if the parameter is not a number
galeriaRouter.get('/:filename', GaleriaController.getImagenByName);

