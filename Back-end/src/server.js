const express = require('express');
const cors = require('cors');

// Importação das rotas
const autoresRoutes = require('./routes/autores.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const livrosRoutes = require('./routes/livros.routes');

const app = express();

app.use(cors());

// Aumenta o limite para permitir imagens em Base64
app.use(express.json({ limit: '10mb' }));

app.use('/autores', autoresRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/livros', livrosRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
