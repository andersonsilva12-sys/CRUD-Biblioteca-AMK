const API_URL = 'http://localhost:3000';
let livrosData = [];
let autoresData = [];
let categoriasData = [];
let livroEmEdicaoId = null; // Controla se estamos criando ou editando
let etapaAtual = 1; // Controla a etapa do modal (1 ou 2)

// 1. Carregar Autores e Categorias para os selects do Modal e Filtros
async function carregarOpcoesSelect() {
  try {
    const [resAutores, resCategorias] = await Promise.all([
      fetch(`${API_URL}/autores`),
      fetch(`${API_URL}/categorias`)
    ]);

    autoresData = await resAutores.json();
    categoriasData = await resCategorias.json();

    // Preenche selects do Modal
    const selectAutor = document.getElementById('autor_id');
    const selectCategoria = document.getElementById('categoria_id');

    if (selectAutor && selectCategoria) {
      selectAutor.innerHTML = '<option value="">Selecione um autor...</option>';
      selectCategoria.innerHTML = '<option value="">Selecione uma categoria...</option>';

      autoresData.forEach(a => selectAutor.innerHTML += `<option value="${a.id}">${a.nome}</option>`);
      categoriasData.forEach(c => selectCategoria.innerHTML += `<option value="${c.id}">${c.nome}</option>`);
    }

    // Preenche o Filtro por Gênero/Categoria na tela principal
    const genreFilter = document.getElementById('genreFilter');
    if (genreFilter) {
      genreFilter.innerHTML = '<option value="">Todos os gêneros</option>';
      categoriasData.forEach(c => {
        genreFilter.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
      });
    }

  } catch (erro) {
    console.error('Erro ao carregar opções dos selects:', erro);
  }
}

// 2. Filtro em Tempo Real (Busca por Texto + Filtro por Gênero)
function aplicarFiltros() {
  const topbarInput = document.querySelector('.topbar .search-bar input')?.value.toLowerCase().trim() || '';
  const filterInput = document.getElementById('filterInput')?.value.toLowerCase().trim() || '';
  const genreFilter = document.getElementById('genreFilter')?.value || '';

  // Consolida o termo de busca (seja da topbar ou do filtro da seção)
  const termoBusca = topbarInput || filterInput;

  const livrosFiltrados = livrosData.filter(livro => {
    const autorNome = (autoresData.find(a => a.id === livro.autor_id)?.nome || '').toLowerCase();
    const titulo = (livro.titulo || '').toLowerCase();
    const isbn = (livro.isbn || '').toLowerCase();

    // Verifica se bate com a pesquisa textual
    const bateuTexto = !termoBusca || 
      titulo.includes(termoBusca) || 
      autorNome.includes(termoBusca) || 
      isbn.includes(termoBusca);

    // Verifica se bate com a categoria/gênero selecionado
    const bateuCategoria = !genreFilter || String(livro.categoria_id) === String(genreFilter);

    return bateuTexto && bateuCategoria;
  });

  renderBooks(livrosFiltrados);
}

// Configura os ouvintes de evento (inputs e selects)
function inicializarEventosFiltro() {
  const topbarInput = document.querySelector('.topbar .search-bar input');
  const filterInput = document.getElementById('filterInput');
  const genreFilter = document.getElementById('genreFilter');

  if (topbarInput) {
    topbarInput.addEventListener('input', (e) => {
      // Sincroniza o valor com o outro input de busca se desejar
      if (filterInput) filterInput.value = e.target.value;
      aplicarFiltros();
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      if (topbarInput) topbarInput.value = e.target.value;
      aplicarFiltros();
    });
  }

  if (genreFilter) {
    genreFilter.addEventListener('change', aplicarFiltros);
  }
}

// 3. Navegação entre Etapas do Modal
function irParaEtapa(etapa) {
  if (etapa === 2) {
    const titulo = document.getElementById('titulo')?.value;
    const autor = document.getElementById('autor_id')?.value;
    const categoria = document.getElementById('categoria_id')?.value;

    if (!titulo || !autor || !categoria) {
      alert('Por favor, preencha os campos obrigatórios (Título, Autor e Categoria) antes de avançar.');
      return;
    }
  }

  etapaAtual = etapa;

  const etapa1El = document.getElementById('etapa-1');
  const etapa2El = document.getElementById('etapa-2');
  const badge1El = document.getElementById('step1-badge');
  const badge2El = document.getElementById('step2-badge');

  if (etapa1El) etapa1El.style.display = etapa === 1 ? 'block' : 'none';
  if (etapa2El) etapa2El.style.display = etapa === 2 ? 'block' : 'none';

  if (badge1El) badge1El.classList.toggle('active', etapa === 1);
  if (badge2El) badge2El.classList.toggle('active', etapa === 2);
}

// 4. Pré-visualização da Capa
function atualizarPreviewCapa(url) {
  const imgPreview = document.getElementById('imgPreview');
  const defaultIcon = document.getElementById('defaultIcon');

  if (imgPreview) {
    if (url && url.trim() !== '') {
      imgPreview.src = url;
      imgPreview.style.display = 'block';
      if (defaultIcon) defaultIcon.style.display = 'none';
    } else {
      imgPreview.style.display = 'none';
      if (defaultIcon) defaultIcon.style.display = 'block';
    }
  }
}

// 5. Controle de Abertura/Fechamento do Modal
async function abrirModal(livro = null) {
  await carregarOpcoesSelect();
  const modal = document.getElementById('modalLivro');
  const tituloModal = document.getElementById('modalTitulo') || modal.querySelector('h2');

  irParaEtapa(1);

  if (livro) {
    livroEmEdicaoId = livro.id;
    if (tituloModal) tituloModal.textContent = 'Editar Livro';

    document.getElementById('titulo').value = livro.titulo || '';
    document.getElementById('autor_id').value = livro.autor_id || '';
    document.getElementById('categoria_id').value = livro.categoria_id || '';

    if (document.getElementById('isbn')) document.getElementById('isbn').value = livro.isbn || '';
    if (document.getElementById('ano_publicacao')) document.getElementById('ano_publicacao').value = livro.ano_publicacao || '';
    if (document.getElementById('editora')) document.getElementById('editora').value = livro.editora || '';
    if (document.getElementById('sinopse')) document.getElementById('sinopse').value = livro.sinopse || '';

    if (document.getElementById('imagem')) {
      document.getElementById('imagem').value = livro.imagem || '';
      atualizarPreviewCapa(livro.imagem || '');
    }
  } else {
    livroEmEdicaoId = null;
    if (tituloModal) tituloModal.textContent = 'Cadastrar Novo Livro';
    document.getElementById('formLivro').reset();
    atualizarPreviewCapa('');
  }

  if (modal) modal.style.display = 'flex';
}

function fecharModal() {
  const modal = document.getElementById('modalLivro');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('formLivro').reset();
    livroEmEdicaoId = null;
    irParaEtapa(1);
  }
}

// 6. Buscar e Renderizar os Cards
async function carregarLivros() {
  try {
    const resposta = await fetch(`${API_URL}/livros`);
    livrosData = await resposta.json();
    aplicarFiltros(); // Renderiza os livros respeitando filtros atuais
  } catch (erro) {
    console.error('Erro ao buscar livros:', erro);
  }
}

function renderBooks(livros) {
  const container = document.getElementById('bookList');
  if (!container) return;
  container.innerHTML = '';

  if (!livros || livros.length === 0) {
    container.innerHTML = '<p style="color: #94a3b8; padding: 1rem;">Nenhum livro encontrado.</p>';
    return;
  }

  livros.forEach((livro) => {
    const autor = autoresData.find(a => a.id === livro.autor_id)?.nome || `Autor #${livro.autor_id}`;
    const categoria = categoriasData.find(c => c.id === livro.categoria_id)?.nome || `Cat #${livro.categoria_id}`;

    const capaHTML = livro.imagem
      ? `<img src="${livro.imagem}" alt="Capa" style="width:100%; height:100%; object-fit:cover; border-radius:4px;" onerror="this.outerHTML='<i class=\\'fa-solid fa-book\\'></i>'">`
      : `<i class="fa-solid fa-book"></i>`;

    container.innerHTML += `
      <div class="book-card" onclick="showDetailPorId(${livro.id})">
        <div class="book-cover">${capaHTML}</div>
        <div class="book-info">
          <h3>${livro.titulo}</h3>
          <p>${autor}</p>
          <span class="badge">${categoria}</span>
        </div>
        <div class="book-actions" onclick="event.stopPropagation()">
          <button class="action-btn edit-btn" title="Editar" onclick='abrirModal(${JSON.stringify(livro).replace(/'/g, "&apos;")})'>
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

// 7. Painel Lateral de Detalhes
function showDetailPorId(id) {
  const livro = livrosData.find(l => l.id === id);
  if (!livro) return;

  const detailPanel = document.getElementById('detailPanel');
  const detailContent = document.getElementById('detailContent');

  const autorNome = autoresData.find(a => a.id === livro.autor_id)?.nome || `Autor #${livro.autor_id}`;
  const categoriaNome = categoriasData.find(c => c.id === livro.categoria_id)?.nome || `Categoria #${livro.categoria_id}`;

  const capaDetalhes = livro.imagem
    ? `<img src="${livro.imagem}" alt="Capa" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" onerror="this.outerHTML='<i class=\\'fa-solid fa-book\\'></i>'">`
    : `<i class="fa-solid fa-book"></i>`;

  detailContent.innerHTML = `
    <div class="detail-top">
      <div class="detail-cover">${capaDetalhes}</div>
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

// 8. Salvar Livro (POST / PUT)
async function salvarLivro(event) {
  event.preventDefault();

  const isbnVal = document.getElementById('isbn')?.value;
  const anoVal = document.getElementById('ano_publicacao')?.value;
  const editoraVal = document.getElementById('editora')?.value;
  const sinopseVal = document.getElementById('sinopse')?.value;
  const imagemVal = document.getElementById('imagem')?.value;

  const dadosLivro = {
    titulo: document.getElementById('titulo').value,
    autor_id: Number(document.getElementById('autor_id').value),
    categoria_id: Number(document.getElementById('categoria_id').value),
    isbn: isbnVal ? isbnVal : null,
    ano_publicacao: anoVal ? Number(anoVal) : null,
    editora: editoraVal ? editoraVal : null,
    sinopse: sinopseVal ? sinopseVal : null,
    imagem: imagemVal ? imagemVal : null
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

// 9. Deletar Livro
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
  inicializarEventosFiltro();
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });