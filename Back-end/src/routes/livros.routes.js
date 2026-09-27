const express = require('express');
const router = express.Router();
const livrosController = require('../controllers/livros.controller');

router.get('/', livrosController.listarLivros);
router.get('/:id', livrosController.buscarLivroPorId);
router.post('/', livrosController.criarLivro);
router.put('/:id', livrosController.atualizarLivro);
router.delete('/:id', livrosController.deletarLivro);

module.exports = router;