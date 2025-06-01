import { Request, Response } from 'express';
import * as BarberoService from '../services/barbero.service';

export async function getBarberoById(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const barbero = await BarberoService.getBarberoById(id);

    if(!barbero){
        res.status(404).json({ message: 'Barber not found' });
    }

    res.json(barbero);
  }catch (err){
    console.error('Error getting barber:', err);
    res.status(500).json({ message: 'Error getting barber' });
  }
}

export async function getAllBarberos(req: Request, res: Response) {
  try{
    const barberos = await BarberoService.getAllBarberos()
    res.json(barberos);
  }catch (err){
    console.error('Error getting barbers:', err);
    res.status(500).json({ message: 'Error getting barbers' });
  }
}

export async function createBarbero(req: Request, res: Response) {
  try{
    const newBarbero = req.body;
    const barbero = await BarberoService.createBarbero(newBarbero);
    res.status(201).json(barbero);
  }catch (err){
    console.error('Error creating barber:', err);
    res.status(500).json({ message: 'Error creating barber'})
  }
}

export async function deleteBarbero(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const barberDeleted = await BarberoService.deleteBarbero(id);

    if(barberDeleted === 0){
      res.status(404).json({ message: 'Barber not found' });
    }

    res.json({ message: 'Barber deleted successfully' });
  }catch (err){
    console.error('Error deleting barber:', err);
    res.status(500).json({ message: 'Error deleting baber'})
  }
}

export async function updateBarbero(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const data = req.body
    const barberUpdated = await BarberoService.updateBarbero(data, id);

    if(!barberUpdated){
      res.status(404).json({ message: 'Barber not found' });
    }

    res.json(barberUpdated);  
  }catch (err){
    console.error('Error updating barber:', err);
    res.status(500).json({ message: 'Error updating baber'})
  }
}