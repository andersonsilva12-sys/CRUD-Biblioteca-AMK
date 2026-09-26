const express = require('express');
const cors = require('cors');

const autoresRoutes = require('./routes/autores.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const livrosRoutes = require('./routes/livros.routes');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use(autoresRoutes);
app.use(categoriasRoutes);
app.use(livrosRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});