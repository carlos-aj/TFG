const path = require('path');
const fs = require('fs');

const galeriaDir = path.join(__dirname, '../src/ApiGaleria');

exports.seed = async function(knex) {
  await knex('galeria').del();
  await knex.raw('ALTER SEQUENCE galeria_id_seq RESTART WITH 1');

  const imagenes = fs.readdirSync(galeriaDir).filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  const grupos = {};

  for (const img of imagenes) {
    const match = img.match(/^([^-]+)-(\d+)-\d+\./);
    if (!match) continue;
    // Convierte guiones bajos a espacios para buscar el nombre real
    const barberoNombre = match[1].replace(/_/g, ' ');
    const identificador = match[2];
    const key = `${barberoNombre}-${identificador}`;
    if (!grupos[key]) grupos[key] = { barberoNombre, imagenes: [] };
    grupos[key].imagenes.push(img);
  }

  for (const { barberoNombre, imagenes } of Object.values(grupos)) {
    // Busca el id del barbero por su nombre
    const barbero = await knex('barbero').where('nombre', barberoNombre).first();
    if (!barbero) {
      console.warn(`Barbero no encontrado: ${barberoNombre}, saltando grupo`);
      continue;
    }
    await knex('galeria').insert({
      barbero_id: barbero.id,
      imagenes,
    });
  }
};