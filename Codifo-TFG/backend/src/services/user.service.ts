import { User } from '../models/User';

export async function getUserById(id: number) {
    return await User.query().findById(id);
}

export async function getAllUsers() {
    return await User.query().select();
}

export async function createUser(data: User){
    return await User.query().insert(data)
}

export async function deleteUser(id: number) {
    return await User.query().deleteById(id);
}

export async function updateUser(data: Partial<User>, id: number) {
    return await User.query().patchAndFetchById(id, data);
}