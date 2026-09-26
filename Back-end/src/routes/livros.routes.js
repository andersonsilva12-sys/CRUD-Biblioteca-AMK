const express = require('express');
const router = express.Router();
const autoresController = require('../controllers/autores.controller');

router.get('/categorias', autoresController.listarAutores);
router.get('/categorias/:id', autoresController.buscarAutorPorId);
router.post('/categorias', autoresController.criarAutor);
router.put('/categorias/:id', autoresController.atualizarAutor);
router.delete('/categorias/:id', autoresController.deletarAutor);

module.exports = router;