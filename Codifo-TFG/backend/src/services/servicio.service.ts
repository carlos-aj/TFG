import { Servicio, IServicio } from "../models/Servicio";

export async function getServicioById(id: number) {
    return await Servicio.query().findById(id);
}

export async function getAllServicios() {
    return await Servicio.query().select()
}

export async function createServicio(data: IServicio) {
    return await Servicio.query().insert(data);
}

export async function deleteServicio(id: number) {
    return await Servicio.query().deleteById(id);
}

export async function updateServicio(data: Partial<IServicio>, id: number) {
    return await Servicio.query().patchAndFetchById(id, data);
}