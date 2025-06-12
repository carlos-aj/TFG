import { Cita, ICita } from '../models/Cita';
import { User } from '../models/User';
import { Barbero } from '../models/Barbero';
import { Servicio } from '../models/Servicio';

export async function getAllCitas() {
  try {
    return await Cita.query();
  } catch (error) {
    console.error('Error al obtener todas las citas:', error);
    throw error;
  }
}

export async function getCitaById(id: number) {
  try {
    // Cargar la cita con sus relaciones para tener toda la información necesaria
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
    console.log('Creando cita con datos:', JSON.stringify(data, null, 2));
    
    // Asegurarse de que user_id sea null si no está definido
    if (data.user_id === undefined) {
      data.user_id = null as any; // Necesario para compatibilidad con la base de datos
    }
    
    const query = Cita.query(trx).insert(data);
    const result = await query;
    console.log('Cita creada correctamente:', result.id);
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
    console.log(`Verificando si puede invitar: barbero ${barbero_id}, fecha ${fecha}, hora ${hora}`);
    
    // Busca si hay alguna cita en esa fecha y hora (con cualquier barbero)
    const citaExistente = await Cita.query()
      .where('fecha', fecha)
      .where('hora', hora)
      .first();

    const resultado = !citaExistente;
    console.log(`Resultado de puedeInvitar: ${resultado}`);
    
    // Si NO hay ninguna cita, puedes invitar
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

export async function getCitasByBarberoYFecha(barbero_id: number, fecha: string) {
  try {
    console.log(`[DEBUG FECHAS] Buscando citas para barbero ${barbero_id} en fecha ${fecha}`);
    
    // Obtener todas las citas del barbero primero
    const todasCitas = await Cita.query()
      .where('barbero_id', barbero_id);
    
    console.log(`[DEBUG FECHAS] Total citas para barbero ${barbero_id}: ${todasCitas.length}`);
    
    // Mostrar las fechas de las citas para depuración
    todasCitas.forEach(cita => {
      console.log(`[DEBUG FECHAS] Cita ID ${cita.id}, fecha en BD: ${cita.fecha}, fecha formateada: ${new Date(cita.fecha).toISOString().split('T')[0]}`);
    });
    
    // Filtrar manualmente para ver qué está pasando
    const citasFiltradas = todasCitas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      const fechaStr = `${fechaCita.getFullYear()}-${String(fechaCita.getMonth() + 1).padStart(2, '0')}-${String(fechaCita.getDate()).padStart(2, '0')}`;
      const coincide = fechaStr === fecha;
      console.log(`[DEBUG FECHAS] Cita ID ${cita.id}, fecha formateada manual: ${fechaStr}, coincide con ${fecha}: ${coincide}`);
      return coincide;
    });
    
    console.log(`[DEBUG FECHAS] Citas filtradas manualmente: ${citasFiltradas.length}`);
    
    // Usar una comparación de fecha sin considerar la hora para evitar problemas de zona horaria
    const citas = await Cita.query()
      .where('barbero_id', barbero_id)
      .whereRaw('TO_CHAR(fecha::date, \'YYYY-MM-DD\') = ?', [fecha]);
    
    console.log(`[DEBUG FECHAS] Citas encontradas con whereRaw: ${citas.length}`);
    
    // Comparar los resultados
    if (citasFiltradas.length !== citas.length) {
      console.log(`[DEBUG FECHAS] ¡ALERTA! Los resultados son diferentes: filtrado manual ${citasFiltradas.length} vs query ${citas.length}`);
    }
    
    return citas;
  } catch (error) {
    console.error(`Error al obtener citas por barbero ${barbero_id} y fecha ${fecha}:`, error);
    throw error;
  }
}

export async function getCitasByBarbero(barbero_id: number) {
  try {
    return await Cita.query()
      .where('barbero_id', barbero_id);
  } catch (error) {
    console.error(`Error al obtener citas por barbero ${barbero_id}:`, error);
    throw error;
  }
}

