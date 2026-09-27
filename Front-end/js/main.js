const API_URL = 'http://localhost:3000';

// 1. Função para carregar e listar as categorias na tela
async function carregarCategorias() {
  try {
    const resposta = await fetch(`${API_URL}/categorias`);
    const categorias = await resposta.json();
    console.log('Categorias recebidas:', categorias);
    
    // Aqui podes manipular o DOM (ex.: preencher uma tabela ou select no HTML)
  } catch (erro) {
    console.error('Erro ao buscar categorias:', erro);
  }
}

// 2. Função para cadastrar uma nova categoria (POST)
async function cadastrarCategoria(nomeCategoria) {
  try {
    const resposta = await fetch(`${API_URL}/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: nomeCategoria })
    });

    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao cadastrar');

    console.log('Categoria cadastrada com sucesso:', dados);
    carregarCategorias(); // Recarrega a lista
  } catch (erro) {
    console.error('Erro no cadastro:', erro.message);
  }
}

// Executa assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
  carregarCategorias();
});