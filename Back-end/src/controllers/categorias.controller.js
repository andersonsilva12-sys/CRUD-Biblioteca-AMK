let categorias = [
    { id: 1, nome: "Romance" },
    { id: 2, nome: "Ficção Científica" }
];
let proximoId = 3;

// GET /categorias
exports.listarCategorias = (req, res) => {
    res.status(200).json(categorias);
};

// GET /categorias/:id
exports.buscarCategoriaPorId = (req, res) => {
    const id = parseInt(req.params.id);
    const categoria = categorias.find(c => c.id === id);

    if (!categoria) {
        return res.status(404).json({ mensagem: "Categoria não encontrada" });
    }

    res.status(200).json(categoria);
};

// POST /categorias
exports.criarCategoria = (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório" });
    }

    // Regra do contrato: 'nome' deve ser único
    const jaExiste = categorias.some(c => c.nome.toLowerCase() === nome.toLowerCase());
    if (jaExiste) {
        return res.status(400).json({ mensagem: "Já existe uma categoria com esse nome" });
    }

    const novaCategoria = {
        id: proximoId++,
        nome
    };
    categorias.push(novaCategoria);
    res.status(201).json(novaCategoria);
};

// PUT /categorias/:id
exports.atualizarCategoria = (req, res) => {
    const id = parseInt(req.params.id);
    const { nome } = req.body;

    const categoriaIndex = categorias.findIndex(c => c.id === id);
    if (categoriaIndex === -1) {
        return res.status(404).json({ mensagem: "Categoria não encontrada" });
    }
    if (!nome) {
        return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório" });
    }
    // Validar se o novo nome já está em uso por outra categoria
    const jaExiste = categorias.some(c => c.nome.toLowerCase() === nome.toLowerCase() && c.id !== id);
    if (jaExiste) {
        return res.status(400).json({ mensagem: "Já existe uma categoria com esse nome" });
    }

    categorias[categoriaIndex].nome = nome;
    res.status(200).json(categorias[categoriaIndex]);
};

// DELETE /categorias/:id

exports.deletarCategoria = (req, res) => {
    const id = parseInt(req.params.id);
    const categoriaIndex = categorias.findIndex(c => c.id === id);

    if (categoriaIndex === -1) {
        return res.status(404).json({ mensagem: "Categoria não encontrada" });
    }

    categorias.splice(categoriaIndex, 1);
    res.status(200).json({ mensagem: "Categoria deletada com sucesso" });
};

// Exporta o array para validação no controller de livros
exports._categoriasEmMemoria = categorias;