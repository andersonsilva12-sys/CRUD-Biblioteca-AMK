const db = require('../../BD/tabelas');

exports.listarCategorias = (req, res) => {
  db.all('SELECT * FROM categorias', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(200).json(rows);
  });
};

exports.buscarCategoriaPorId = (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ mensagem: 'Categoria não encontrada' });
    res.status(200).json(row);
  });
};

exports.criarCategoria = (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório." });

  const query = 'INSERT INTO categorias (nome) VALUES (?)';
  db.run(query, [nome], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ mensagem: 'Já existe uma categoria com este nome.' });
      }
      return res.status(500).json({ erro: err.message });
    }
    res.status(201).json({ id: this.lastID, nome });
  });
};

exports.atualizarCategoria = (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório." });

  const query = 'UPDATE categorias SET nome = ? WHERE id = ?';
  db.run(query, [nome, id], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ mensagem: 'Já existe uma categoria com este nome.' });
      }
      return res.status(500).json({ erro: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ mensagem: 'Categoria não encontrada' });
    res.status(200).json({ id: Number(id), nome });
  });
};

exports.deletarCategoria = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM categorias WHERE id = ?', [id], function (err) {
    if (err) {
      if (err.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({ mensagem: 'Não é possível excluir a categoria pois ela possui livros vinculados.' });
      }
      return res.status(500).json({ erro: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ mensagem: 'Categoria não encontrada' });
    res.status(200).json({ mensagem: 'Categoria excluída com sucesso' });
  });
};