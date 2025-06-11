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
galeriaRouter.get('/:id', GaleriaController.getGaleriaById);
galeriaRouter.get('/', GaleriaController.getGalerias);
galeriaRouter.post('/', GaleriaController.createGaleria);
galeriaRouter.put('/:id', GaleriaController.updateGaleria);
galeriaRouter.delete('/:id', GaleriaController.deleteGaleria);
galeriaRouter.post('/upload', upload.array('imagenes'), UploadController.uploadImagen);
galeriaRouter.get('/:filename', GaleriaController.getImagenByName);

