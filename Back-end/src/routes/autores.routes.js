const express = require('express');
const router = express.Router();
const autoresController = require('../controllers/autores.controller');

router.get('/', autoresController.listarAutores);
router.get('/:id', autoresController.buscarAutorPorId);
router.post('/', autoresController.criarAutor);
router.put('/:id', autoresController.atualizarAutor);
router.delete('/:id', autoresController.deletarAutor);

module.exports = router;