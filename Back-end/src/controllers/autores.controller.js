const db = require('../../BD/tabelas');

exports.listarAutores = (req, res) => {
  db.all('SELECT * FROM autores', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(200).json(rows);
  });
};

exports.buscarAutorPorId = (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM autores WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ mensagem: 'Autor não encontrado' });
    res.status(200).json(row);
  });
};

exports.criarAutor = (req, res) => {
  const { nome, nacionalidade } = req.body;
  if (!nome) return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório." });

  const query = 'INSERT INTO autores (nome, nacionalidade) VALUES (?, ?)';
  db.run(query, [nome, nacionalidade || null], function (err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id: this.lastID, nome, nacionalidade });
  });
};

exports.atualizarAutor = (req, res) => {
  const { id } = req.params;
  const { nome, nacionalidade } = req.body;
  if (!nome) return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório." });

  const query = 'UPDATE autores SET nome = ?, nacionalidade = ? WHERE id = ?';
  db.run(query, [nome, nacionalidade || null, id], function (err) {
    if (err) return res.status(500).json({ erro: err.message });
    if (this.changes === 0) return res.status(404).json({ mensagem: 'Autor não encontrado' });
    res.status(200).json({ id: Number(id), nome, nacionalidade });
  });
};

exports.deletarAutor = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM autores WHERE id = ?', [id], function (err) {
    if (err) {
      if (err.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({ mensagem: 'Não é possível excluir o autor pois ele possui livros cadastrados.' });
      }
      return res.status(500).json({ erro: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ mensagem: 'Autor não encontrado' });
    res.status(200).json({ mensagem: 'Autor excluído com sucesso' });
  });
};