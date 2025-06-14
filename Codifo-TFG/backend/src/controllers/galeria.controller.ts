import { Request, Response } from 'express';
import * as GaleriaService from '../services/galeria.service';
import path from 'path';

export async function getGalerias(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const galerias = await GaleriaService.getGalerias(limit);
    res.json(galerias);
  } catch (error) {
    console.error('Error en getGalerias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getGaleriaById(req: Request, res: Response) {
  try {
    const galeria = await GaleriaService.getGaleriaById(Number(req.params.id));
    if (!galeria) {
      res.status(404).json({ message: 'No encontrada' });
      return;
    }
    res.json(galeria);
  } catch (error) {
    console.error('Error en getGaleriaById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function createGaleria(req: Request, res: Response) {
  try {
    const { barbero_id, imagenes } = req.body;
    if (!barbero_id || !imagenes) {
      res.status(400).json({ message: 'Faltan datos' });
      return;
    }
    const nueva = await GaleriaService.createGaleria(barbero_id, imagenes);
    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error en createGaleria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateGaleria(req: Request, res: Response) {
  try {
    const { barbero, imagenes } = req.body;
    const galeria = await GaleriaService.updateGaleria(Number(req.params.id), barbero, imagenes);
    if (!galeria) {
      res.status(404).json({ message: 'No encontrada' });
      return;
    }
    res.json(galeria);
  } catch (error) {
    console.error('Error en updateGaleria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function deleteGaleria(req: Request, res: Response) {
  try {
    const numDeleted = await GaleriaService.deleteGaleria(Number(req.params.id));
    if (!numDeleted) {
      res.status(404).json({ message: 'No encontrada' });
      return;
    }
    res.json({ message: 'Eliminada correctamente' });
  } catch (error) {
    console.error('Error en deleteGaleria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getImagenByName(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../ApiGaleria', filename);

    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error al enviar imagen:', err);
        console.error('Path intentado:', imagePath);
        res.status(404).send('Imagen no encontrada');
      }
    });
  } catch (error) {
    console.error('Error en getImagenByName:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}