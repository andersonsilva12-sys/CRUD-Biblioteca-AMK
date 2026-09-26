const express = require('express');
const cors = require('cors');

const autoresRoutes = require('./routes/autores.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const livrosRoutes = require('./routes/livros.routes'); // 1. Confirmar importação

const app = express();

app.use(cors());
app.use(express.json());

// 2. Registrar os prefixos exatos
app.use('/autores', autoresRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/livros', livrosRoutes); // Garanta que está no plural '/livros'

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});