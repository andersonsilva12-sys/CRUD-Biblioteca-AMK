const db = require('../../BD/tabelas');

exports.listarLivros = (req, res) => {
  db.all('SELECT * FROM livros', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(200).json(rows);
  });
};

exports.buscarLivroPorId = (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM livros WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ mensagem: 'Livro não encontrado' });
    res.status(200).json(row);
  });
};

exports.criarLivro = (req, res) => {
  const {
    titulo,
    isbn,
    ano_publicacao,
    editora,
    quantidade,
    sinopse,
    autor_id,
    categoria_id
  } = req.body;

  if (!titulo || autor_id === undefined || categoria_id === undefined) {
    return res.status(400).json({ mensagem: "Campos obrigatórios: titulo, autor_id, categoria_id." });
  }

  const query = `
    INSERT INTO livros (titulo, isbn, ano_publicacao, editora, quantidade, sinopse, autor_id, categoria_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    titulo,
    isbn || null,
    ano_publicacao || null,
    editora || null,
    quantidade !== undefined ? quantidade : 0,
    sinopse || null,
    autor_id,
    categoria_id
  ];

  db.run(query, params, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ mensagem: "O 'isbn' informado já está cadastrado." });
      }
      if (err.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({ mensagem: "O 'autor_id' ou 'categoria_id' fornecido não existe." });
      }
      return res.status(500).json({ erro: err.message });
    }

    res.status(201).json({
      id: this.lastID,
      titulo,
      isbn: isbn || null,
      ano_publicacao: ano_publicacao || null,
      editora: editora || null,
      quantidade: quantidade !== undefined ? quantidade : 0,
      sinopse: sinopse || null,
      autor_id,
      categoria_id
    });
  });
};

exports.atualizarLivro = (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    isbn,
    ano_publicacao,
    editora,
    quantidade,
    sinopse,
    autor_id,
    categoria_id
  } = req.body;

  if (!titulo || autor_id === undefined || categoria_id === undefined) {
    return res.status(400).json({ mensagem: "Campos obrigatórios: titulo, autor_id, categoria_id." });
  }

  const query = `
    UPDATE livros 
    SET titulo = ?, isbn = ?, ano_publicacao = ?, editora = ?, quantidade = ?, sinopse = ?, autor_id = ?, categoria_id = ?
    WHERE id = ?
  `;

  const params = [
    titulo,
    isbn || null,
    ano_publicacao || null,
    editora || null,
    quantidade !== undefined ? quantidade : 0,
    sinopse || null,
    autor_id,
    categoria_id,
    id
  ];

  db.run(query, params, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ mensagem: "O 'isbn' informado já pertence a outro livro." });
      }
      if (err.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({ mensagem: "O 'autor_id' ou 'categoria_id' fornecido não existe." });
      }
      return res.status(500).json({ erro: err.message });
    }

    if (this.changes === 0) return res.status(404).json({ mensagem: 'Livro não encontrado' });

    res.status(200).json({
      id: Number(id),
      titulo,
      isbn: isbn || null,
      ano_publicacao: ano_publicacao || null,
      editora: editora || null,
      quantidade: quantidade !== undefined ? quantidade : 0,
      sinopse: sinopse || null,
      autor_id,
      categoria_id
    });
  });
};

exports.deletarLivro = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM livros WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ erro: err.message });
    if (this.changes === 0) return res.status(404).json({ mensagem: 'Livro não encontrado' });
    res.status(200).json({ mensagem: 'Livro excluído com sucesso' });
  });
};