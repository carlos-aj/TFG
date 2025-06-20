import { Barbero, IBarbero } from "../models/Barbero"

export async function getBarberoById(id: number) {
    return await Barbero.query().findById(id);
}

export async function getAllBarberos() {
    return await Barbero.query().select();
}

export async function createBarbero(data: IBarbero) {
    return await Barbero.query().insert(data);
}

export async function deleteBarbero(id: number) {
    return await Barbero.query().deleteById(id)
}

export async function updateBarbero(data: Partial<IBarbero>, id: number) {
    return await Barbero.query().patchAndFetchById(id, data);
}