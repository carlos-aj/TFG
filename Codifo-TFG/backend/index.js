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

