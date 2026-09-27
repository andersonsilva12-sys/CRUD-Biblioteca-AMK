const express = require('express');
const cors = require('cors');

// 1. Importação das rotas
const autoresRoutes = require('./routes/autores.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const livrosRoutes = require('./routes/livros.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 2. Registro das rotas com os prefixos
app.use('/autores', autoresRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/livros', livrosRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});