import { Cita, ICita } from '../models/Cita';
import { User } from '../models/User';
import { Barbero } from '../models/Barbero';
import { Servicio } from '../models/Servicio';

export async function getAllCitas() {
  try {
    const citas = await Cita.query()
      .withGraphFetched('[user, barbero, servicio]')
      .orderBy('barbero_id', 'asc')
      .orderBy('hora', 'asc');
    
    const citasFormateadas = citas.map(c => {
      if (c.fecha && typeof c.fecha !== 'string') {
        const fecha = new Date(c.fecha);
        return {
          ...c,
          fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
        };
      }
      return c;
    });
    
    return citasFormateadas;
  } catch (error) {
    console.error('Error al obtener todas las citas:', error);
    throw error;
  }
}

export async function getCitaById(id: number) {
  try {
    return await Cita.query()
      .findById(id)
      .withGraphFetched('[user, barbero, servicio]');
  } catch (error) {
    console.error(`Error al obtener cita con ID ${id}:`, error);
    throw error;
  }
}

export async function createCita(data: Partial<ICita>, trx?: import('knex').Knex.Transaction) {
  try {
    
    if (data.user_id === undefined) {
      data.user_id = null as any; 
    }
    
    const query = Cita.query(trx).insert(data);
    const result = await query;
    return result;
  } catch (error) {
    console.error('Error al crear cita:', error);
    throw error;
  }
}

export async function updateCita(id: number, data: Partial<ICita>) {
  try {
    return await Cita.query().patchAndFetchById(id, data);
  } catch (error) {
    console.error(`Error al actualizar cita con ID ${id}:`, error);
    throw error;
  }
}

export async function deleteCita(id: number) {
  try {
    return await Cita.query().deleteById(id);
  } catch (error) {
    console.error(`Error al eliminar cita con ID ${id}:`, error);
    throw error;
  }
}

export async function findCitaByBarberoFechaHora(barbero_id: number, fecha: string, hora: string, trx?: import('knex').Knex.Transaction) {
  try {
    return await Cita.query(trx).where({ barbero_id, fecha, hora }).first();
  } catch (error) {
    console.error(`Error al buscar cita por barbero ${barbero_id}, fecha ${fecha}, hora ${hora}:`, error);
    throw error;
  }
}

export async function getCitaInfoForEmail(data: any) {
  try {
    const promises = [
      data.user_id ? User.query().findById(data.user_id) : Promise.resolve(null),
      data.barbero_id ? Barbero.query().findById(data.barbero_id) : Promise.resolve(null),
      data.servicio_id ? Servicio.query().findById(data.servicio_id) : Promise.resolve(null),
    ];
    
    const [user, barbero, servicio] = await Promise.all(promises);
    return { 
      user: user as User | null, 
      barbero: barbero as Barbero | null, 
      servicio: servicio as Servicio | null 
    };
  } catch (error) {
    console.error('Error al obtener información para email:', error);
    throw error;
  }
}

export async function puedeInvitar(barbero_id: number, fecha: string, hora: string) {
  try {
    
    const citaExistente = await Cita.query()
      .where('fecha', fecha)
      .where('hora', hora)
      .first();

    const resultado = !citaExistente;
    
    return resultado;
  } catch (error) {
    console.error(`Error al verificar si puede invitar: barbero ${barbero_id}, fecha ${fecha}, hora ${hora}:`, error);
    throw error;
  }
}

export async function getBarberoNombreById(id: number) {
  try {
    const barbero = await Barbero.query().findById(id);
    return barbero ? barbero.nombre : id;
  } catch (error) {
    console.error(`Error al obtener nombre de barbero con ID ${id}:`, error);
    throw error;
  }
}

export async function getCitasByBarberoYFecha(barbero_id: number, fecha_inicio: string, fecha_fin?: string) {
  try {
    
    let query = Cita.query().where('barbero_id', barbero_id);
    
    if (fecha_fin) {
      query = query.whereRaw('fecha::date >= ?::date', [fecha_inicio])
                   .whereRaw('fecha::date <= ?::date', [fecha_fin]);
    } else {
      query = query.whereRaw('fecha::date = ?::date', [fecha_inicio]);
    }
    
    query = query.withGraphFetched('[user, barbero, servicio]')
                .orderBy('hora', 'asc');
    
    const citas = await query;
    
    const citasFormateadas = citas.map(c => {
      if (c.fecha && typeof c.fecha !== 'string') {
        const fecha = new Date(c.fecha);
        return {
          ...c,
          fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
        };
      }
      return c;
    });
    
    return citasFormateadas;
  } catch (error) {
    console.error(`Error al obtener citas por barbero ${barbero_id} y fechas ${fecha_inicio} - ${fecha_fin || fecha_inicio}:`, error);
    throw error;
  }
}

export async function getCitasByBarbero(barbero_id: number) {
  try {
    
    const citas = await Cita.query()
      .where('barbero_id', barbero_id)
      .withGraphFetched('[user, barbero, servicio]')
      .orderBy('fecha', 'asc')
      .orderBy('hora', 'asc');
    
    
    const citasFormateadas = citas.map(c => {
      if (c.fecha && typeof c.fecha !== 'string') {
        const fecha = new Date(c.fecha);
        return {
          ...c,
          fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
        };
      }
      return c;
    });
    
    return citasFormateadas;
  } catch (error) {
    console.error(`Error al obtener citas por barbero ${barbero_id}:`, error);
    throw error;
  }
}

export async function getCitasByFecha(fecha_inicio: string, fecha_fin?: string) {
  try {
    
    let query = Cita.query();
    
    if (fecha_fin) {
      query = query.whereRaw('fecha::date >= ?::date', [fecha_inicio])
                   .whereRaw('fecha::date <= ?::date', [fecha_fin]);
    } else {
      query = query.whereRaw('fecha::date = ?::date', [fecha_inicio]);
    }
    
    query = query.withGraphFetched('[user, barbero, servicio]')
                .orderBy('barbero_id', 'asc')  
                .orderBy('hora', 'asc');       
    
    const citas = await query;
    
    const citasFormateadas = citas.map(c => {
      if (c.fecha && typeof c.fecha !== 'string') {
        const fecha = new Date(c.fecha);
        return {
          ...c,
          fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
        };
      }
      return c;
    });
    
    return citasFormateadas;
  } catch (error) {
    console.error(`Error al obtener citas por rango de fechas ${fecha_inicio} - ${fecha_fin || fecha_inicio}:`, error);
    throw error;
  }
}

