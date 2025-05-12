import { Request, Response } from "express";
import * as ServicioService from "../services/servicio.service";

export async function getServicioById(req: Request, res: Response) {
    try{
        const id = parseInt(req.params.id);
        const servicio = await ServicioService.getServicioById(id);
        
        if(!servicio){
            res.status(404).json({ message: 'Service not found' });
        }

        res.json(servicio);
    }catch (err){
        console.error('Error getting service:', err);
        res.status(500).json({ message: 'Error getting service' });
    }
}

export async function getAllServicios(req: Request, res: Response) {
  try{
    const servicios = await ServicioService.getAllServicios()
    res.json(servicios);
  }catch (err){
    console.error('Error getting services:', err);
    res.status(500).json({ message: 'Error getting services' });
  }
}

export async function createServicio(req: Request, res: Response) {
  try{
    const newServicio = req.body;
    const service = await ServicioService.createServicio(newServicio);
    res.status(201).json(service);
  }catch (err){
    console.error('Error creating service:', err);
    res.status(500).json({ message: 'Error creating service'})
  }
}

export async function deleteServicio(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const serviceDeleted = await ServicioService.deleteServicio(id);

    if(serviceDeleted === 0){
      res.status(404).json({ message: 'Barber not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  }catch (err){
    console.error('Error deleting service:', err);
    res.status(500).json({ message: 'Error deleting service'})
  }
}

export async function updateServicio(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const data = req.body
    const serviceUpdated = await ServicioService.updateServicio(data, id);

    if(!serviceUpdated){
      res.status(404).json({ message: 'Service not found' });
    }

    res.json(serviceUpdated);  
  }catch (err){
    console.error('Error updating service:', err);
    res.status(500).json({ message: 'Error updating service'})
  }
}