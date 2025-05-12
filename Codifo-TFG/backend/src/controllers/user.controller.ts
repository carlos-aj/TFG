import { Request, Response } from 'express';
import * as UserService from '../services/user.service';

export async function getUserById(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const user = await UserService.getUserById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
    
  }catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ message: 'Error getting user' });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try{
    const users = await UserService.getAllUsers();
    res.json(users);
  }catch (err){
    console.error('Error getting users:', err);
    res.status(500).json({ message: 'Error getting users'});
  }
}

export async function createUser(req: Request, res: Response) {
  try{
    const newUser = req.body;
    const user = await UserService.createUser(newUser);
    res.status(201).json(user);
  }catch (err){
    console.log('Error creating user:', err);
    res.status(500).json({ message: 'Error creating user'})
  }
}

export async function deleteUser(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const deleted = await UserService.deleteUser(id);

    if(deleted === 0){
      res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try{
    const id = parseInt(req.params.id);
    const data = req.body
    const updatedUser = await UserService.updateUser(data, id)

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  }catch (err){
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Error updating user' });
  }
}
