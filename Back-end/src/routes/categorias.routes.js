const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias.controller');

// Use apenas '/' pois o '/categorias' já foi definido no server.js
router.get('/', categoriasController.listarCategorias);
router.get('/:id', categoriasController.buscarCategoriaPorId);
router.post('/', categoriasController.criarCategoria);
router.put('/:id', categoriasController.atualizarCategoria);
router.delete('/:id', categoriasController.deletarCategoria);

module.exports = router;