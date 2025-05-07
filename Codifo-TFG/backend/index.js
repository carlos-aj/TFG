const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => res.json({ msg: 'API funcionando' }));

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Servidor en puerto ${process.env.PORT || 3000}`);
});

const knex = require('knex')(require('./src/db/knexfile').development);

knex.raw('SELECT 1')
  .then(() => console.log('✅ Conexión a la base de datos exitosa'))
  .catch(err => console.error('❌ Error conectando a la base de datos', err));


