const express = require('express');
const router = express.Router();
const autoresController = require('../controllers/autores.controller');

router.get('/autores', autoresController.listarAutores);
router.get('/autores/:id', autoresController.buscarAutorPorId);
router.post('/autores', autoresController.criarAutor);
router.put('/autores/:id', autoresController.atualizarAutor);
router.delete('/autores/:id', autoresController.deletarAutor);

module.exports = router;