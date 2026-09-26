const { _autoresEmMemoria } = require('./autores.controller');
const { _categoriasEmMemoria } = require('./categorias.controller');
 
let livros = [
    {
        id: 1,
        titulo: "Dom Casmurro",
        isbn: "9788535910663",
        ano_publicacao: 1899,
        editora: "Companhia das Letras",
        quantidade: 5,
        sinopse: "Romance de Machado de Assis.",
        autor_id: 1,
        categoria_id: 1
    }
];
 
let proximoId = 2
 
// GET
/livrosexports.listarLivros((req, res) => {
  res.status(200).json(livros);
});
 
// GET /livros/:
idexports.buscarLivroPorId((req, res) => {
  const id = parseInt(req.params.id);
  const livro = livros.find(l => l.id === id);
 
  if (!livros) {
    return res.status(404).json({mensagem: "Livro não encontrado"});
  }
 
  res.status(200).json(livro);
});
 
// POST
livrosexports.criarLivro((req, res) => {
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
 
  livros.push(novoLivro);
  res.status(201).json(novoLivro);
});
 
// PUT/livros/:
idexports.atualizarLivro = (req, res) => {
  const id = parseInt(req.params.id);
  const livroIndex = livros.findIndex(l => l.id === id);
 
  if (livroIndex === -1) {
    return res.status(404).json({ mensagem: "Livro não encontrado" });
  }
 
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
 
  // Validação de ISBN único ao atualizarif (isbn) {
    const isbnExiste = livros.some(l => l.isbn === isbn && l.id !== id);
    if (isbnExiste) {
      return res.status(400).json({ mensagem: "O 'isbn' informado já pertence a outro livro." });
    }
  }
 
  livros[livroIndex] = {
    id,
    titulo,
    isbn: isbn || null,
    ano_publicacao: ano_publicacao || null,
    editora: editora || null,
    quantidade: quantidade !== undefined ? quantidade : 0,
    sinopse: sinopse || null,
    autor_id,
    categoria_id
  };
 
  res.status(200).json(livros[livroIndex]);
 
// DELETE /livros/:
idexports.deletarLivro = (req, res) => {
  const id = parseInt(req.params.id);
  const livroIndex = livros.findIndex(l => l.id === id);
 
  if (livroIndex === -1) {
    return res.status(404).json({ mensagem: "Livro não encontrado" });
  }
 
  livros.splice(livroIndex, 1);
  res.status(200).json({ mensagem: "Livro excluído com sucesso" });
};