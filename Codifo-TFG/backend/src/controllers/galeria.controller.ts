import { Request, Response } from 'express';
import * as GaleriaService from '../services/galeria.service';
import path from 'path';

export async function getGalerias(req: Request, res: Response) {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const galerias = await GaleriaService.getGalerias(limit);
  res.json(galerias);
}

export async function getGaleriaById(req: Request, res: Response) {
  const galeria = await GaleriaService.getGaleriaById(Number(req.params.id));
  if (!galeria) res.status(404).json({ message: 'No encontrada' });
  res.json(galeria);
}

export async function createGaleria(req: Request, res: Response) {
  const { barbero_id, imagenes } = req.body;
  if (!barbero_id || !imagenes) res.status(400).json({ message: 'Faltan datos' });
  const nueva = await GaleriaService.createGaleria(barbero_id, imagenes);
  res.status(201).json(nueva);
}

export async function updateGaleria(req: Request, res: Response) {
  const { barbero, imagenes } = req.body;
  const galeria = await GaleriaService.updateGaleria(Number(req.params.id), barbero, imagenes);
  if (!galeria) res.status(404).json({ message: 'No encontrada' });
  res.json(galeria);
}

export async function deleteGaleria(req: Request, res: Response) {
  const numDeleted = await GaleriaService.deleteGaleria(Number(req.params.id));
  if (!numDeleted){ 
    res.status(404).json({ message: 'No encontrada' });
    }else{
        res.json({ message: 'Eliminada correctamente' });
    }
}

export async function getImagenByName(req: Request, res: Response) {
  const { filename } = req.params;
  const imagePath = path.resolve(process.cwd(), 'ApiGaleria', filename);
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('Error al enviar imagen:', err);
      res.status(404).send('Imagen no encontrada');
    }
  });
}