const API_URL = 'http://localhost:3000';
let livrosData = [];
let autoresData = [];
let categoriasData = [];
let livroEmEdicaoId = null; // Controla se estamos criando ou editando

// 1. Carregar Autores e Categorias para os selects do Modal
async function carregarOpcoesSelect() {
  try {
    const [resAutores, resCategorias] = await Promise.all([
      fetch(`${API_URL}/autores`),
      fetch(`${API_URL}/categorias`)
    ]);

    autoresData = await resAutores.json();
    categoriasData = await resCategorias.json();

    const selectAutor = document.getElementById('autor_id');
    const selectCategoria = document.getElementById('categoria_id');

    if (selectAutor && selectCategoria) {
      selectAutor.innerHTML = '<option value="">Selecione um autor...</option>';
      selectCategoria.innerHTML = '<option value="">Selecione uma categoria...</option>';

      autoresData.forEach(a => selectAutor.innerHTML += `<option value="${a.id}">${a.nome}</option>`);
      categoriasData.forEach(c => selectCategoria.innerHTML += `<option value="${c.id}">${c.nome}</option>`);
    }
  } catch (erro) {
    console.error('Erro ao carregar opções dos selects:', erro);
  }
}

// 2. Controle de Abertura/Fechamento do Modal
async function abrirModal(livro = null) {
  await carregarOpcoesSelect();
  const modal = document.getElementById('modalLivro');
  const tituloModal = modal.querySelector('h2');

  if (livro) {
    // Modo Edição: Preenche todos os campos com os dados atuais do livro
    livroEmEdicaoId = livro.id;
    tituloModal.textContent = 'Editar Livro';
    document.getElementById('titulo').value = livro.titulo || '';
    document.getElementById('autor_id').value = livro.autor_id || '';
    document.getElementById('categoria_id').value = livro.categoria_id || '';
    
    // Novos campos adicionados:
    if (document.getElementById('isbn')) document.getElementById('isbn').value = livro.isbn || '';
    if (document.getElementById('ano_publicacao')) document.getElementById('ano_publicacao').value = livro.ano_publicacao || '';
    if (document.getElementById('editora')) document.getElementById('editora').value = livro.editora || '';
    if (document.getElementById('sinopse')) document.getElementById('sinopse').value = livro.sinopse || '';
  } else {
    // Modo Cadastro: Limpa todos os campos
    livroEmEdicaoId = null;
    tituloModal.textContent = 'Cadastrar Novo Livro';
    document.getElementById('formLivro').reset();
  }

  if (modal) modal.style.display = 'flex';
}

function fecharModal() {
  const modal = document.getElementById('modalLivro');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('formLivro').reset();
    livroEmEdicaoId = null;
  }
}

// 3. Buscar e Renderizar os Cards no Centro (com Botões de Ação)
async function carregarLivros() {
  try {
    const resposta = await fetch(`${API_URL}/livros`);
    livrosData = await resposta.json();
    renderBooks(livrosData);
  } catch (erro) {
    console.error('Erro ao buscar livros:', erro);
  }
}

function renderBooks(livros) {
  const container = document.getElementById('bookList');
  if (!container) return;
  container.innerHTML = '';

  if (!livros || livros.length === 0) {
    container.innerHTML = '<p style="color: #94a3b8; padding: 1rem;">Nenhum livro cadastrado.</p>';
    return;
  }

  livros.forEach((livro, index) => {
    // Mapeia o nome do Autor e Categoria a partir do ID
    const autor = autoresData.find(a => a.id === livro.autor_id)?.nome || `Autor #${livro.autor_id}`;
    const categoria = categoriasData.find(c => c.id === livro.categoria_id)?.nome || `Cat #${livro.categoria_id}`;

    container.innerHTML += `
      <div class="book-card" data-index="${index}" onclick="showDetail(${index})">
        <div class="book-cover"><i class="fa-solid fa-book"></i></div>
        <div class="book-info">
          <h3>${livro.titulo}</h3>
          <p>${autor}</p>
          <span class="badge">${categoria}</span>
        </div>
        <div class="book-actions" onclick="event.stopPropagation()">
          <button class="action-btn edit-btn" title="Editar" onclick="abrirModal(livrosData[${index}])">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn delete-btn" title="Excluir" onclick="deletarLivro(${livro.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
}

// 4. Exibir o Painel Lateral de Detalhes
function showDetail(index) {
  const livro = livrosData[index];
  if (!livro) return;

  const detailPanel = document.getElementById('detailPanel');
  const detailContent = document.getElementById('detailContent');

  document.querySelectorAll('.book-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.querySelector(`.book-card[data-index="${index}"]`);
  if (activeCard) activeCard.classList.add('active');

  const autorNome = autoresData.find(a => a.id === livro.autor_id)?.nome || `Autor #${livro.autor_id}`;
  const categoriaNome = categoriasData.find(c => c.id === livro.categoria_id)?.nome || `Categoria #${livro.categoria_id}`;

  detailContent.innerHTML = `
    <div class="detail-top">
      <div class="detail-cover"><i class="fa-solid fa-book"></i></div>
      <div class="detail-info">
        <h2>${livro.titulo}</h2>
        <p class="author">${autorNome}</p>
        <span class="badge">${categoriaNome}</span>
      </div>
    </div>
    <div class="detail-meta" style="margin-top: 1.5rem;">
      <div class="meta-item"><i class="fa-solid fa-barcode"></i> <strong>ISBN:</strong> ${livro.isbn || 'Não informado'}</div>
      <div class="meta-item"><i class="fa-solid fa-calendar"></i> <strong>Ano de publicação:</strong> ${livro.ano_publicacao || 'N/A'}</div>
      <div class="meta-item"><i class="fa-solid fa-building"></i> <strong>Editora:</strong> ${livro.editora || 'N/A'}</div>
    </div>
    <div class="detail-section" style="margin-top: 1.5rem;">
      <h4><i class="fa-solid fa-file-lines"></i> Sinopse</h4>
      <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.5;">${livro.sinopse || 'Sem sinopse cadastrada.'}</p>
    </div>
  `;

  detailPanel.classList.add('open');
}

function closeDetail() {
  const detailPanel = document.getElementById('detailPanel');
  if (detailPanel) detailPanel.classList.remove('open');
  document.querySelectorAll('.book-card').forEach(c => c.classList.remove('active'));
}

// 5. Salvar (Trata POST para novo ou PUT para edição)
async function salvarLivro(event) {
  event.preventDefault();

  const isbnVal = document.getElementById('isbn')?.value;
  const anoVal = document.getElementById('ano_publicacao')?.value;
  const editoraVal = document.getElementById('editora')?.value;
  const sinopseVal = document.getElementById('sinopse')?.value;

  const dadosLivro = {
    titulo: document.getElementById('titulo').value,
    autor_id: Number(document.getElementById('autor_id').value),
    categoria_id: Number(document.getElementById('categoria_id').value),
    isbn: isbnVal ? isbnVal : null,
    ano_publicacao: anoVal ? Number(anoVal) : null,
    editora: editoraVal ? editoraVal : null,
    sinopse: sinopseVal ? sinopseVal : null
  };

  const url = livroEmEdicaoId ? `${API_URL}/livros/${livroEmEdicaoId}` : `${API_URL}/livros`;
  const metodo = livroEmEdicaoId ? 'PUT' : 'POST';

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosLivro)
    });

    if (resposta.ok) {
      alert(livroEmEdicaoId ? 'Livro atualizado com sucesso!' : 'Livro cadastrado com sucesso!');
      fecharModal();
      await carregarLivros();
      closeDetail();
    } else {
      const erro = await resposta.json();
      alert(`Erro: ${erro.mensagem || 'Falha ao processar requisição'}`);
    }
  } catch (erro) {
    console.error('Erro na requisição:', erro);
  }
}

// 6. Deletar Livro
async function deletarLivro(id) {
  if (!confirm('Tem certeza de que deseja remover este livro?')) return;

  try {
    const resposta = await fetch(`${API_URL}/livros/${id}`, { method: 'DELETE' });
    if (resposta.ok) {
      closeDetail();
      await carregarLivros();
    } else {
      alert('Erro ao excluir livro.');
    }
  } catch (erro) {
    console.error('Erro ao excluir:', erro);
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await carregarOpcoesSelect();
  await carregarLivros();
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });