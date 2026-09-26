// Simulação de banco de dados em memória
let autores = [
    { id: 1, nome: "Machado de Assis", nacionalidade: "Brasileiro" }
];
let proximoId = 2;

//GET - /autores
exports.listarAutores = (req, res) => {
    res.status(200).json(autores);
};

// GET /autores/:id
exports.buscarAutorPorId = (req, res) => {
    const id = parseInt(req.params.id);
    const autor = autores.find(a => a.id === id);

    if (!autor) {
        return res.status(404).json({ mensagem: "Autor não encontrado" });
    }
    res.status(200).json(autor);
};

// POST /autores
exports.criarAutor = (req, res) => {
    const { nome, nacionalidade } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório" });
    }

    const novoAutor = {
        id: proximoId++,
        nome,
        nacionalidade: nacionalidade || "Desconhecida"
    };
    autores.push(novoAutor);
    res.status(201).json(novoAutor);
};

// PUT /autores/:id

exports.atualizarAutor = (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, nacionalidade } = req.body;

    const autorIndex = autores.findIndex(a => a.id === id);
    if (autorIndex === -1) {
        return res.status(404).json({ mensagem: "Autor não encontrado" });
    }
    if (!nome) {
        return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório" });
    }

    autores[autorIndex] = {
        id,
        nome,
        nacionalidade: nacionalidade !== undefined ? nacionalidade : autores[autorIndex].nacionalidade
    };

    res.status(200).json(autores[autorIndex]);
};

// DELETE /autores/:id
exports.deletarAutor = (req, res) => {
    const id = parseInt(req.params.id);
    const autorIndex = autores.findIndex(a => a.id === id);

    if (autorIndex === -1) {
        return res.status(404).json({mensagem: "Autor não encontrado"});
    }

    autores.splice(autorIndex, 1);
    res.status(200).json({mensagem: "Autor deletado com sucesso"});
};

// Exporta o array para poder checar a existência de autor_id no controller de livros
exports._autoresEmMemoria = autores;


