const livros = [
  { titulo: "Dom Casmurro", autor: "Machado de Assis", genero: "Romance", icone: "📕",
    isbn: "978-85-359-0271-3", ano: "1899", editora: "Penguin Companhia",
    sinopse: "O clássico de Machado de Assis narra a história de Bentinho, que, ao revisitar o passado, conta sua versão dos fatos sobre o relacionamento com Capitu, levantando dúvidas e reflexões sobre o ciúme, a memória e a verdade.",
    tags: ["Romance", "Clássico", "Literatura Brasileira"] }
];
// Elementos do DOM
const bookList = document.getElementById('bookList');
const detailPanel = document.getElementById('detailPanel');
const detailContent = document.getElementById('detailContent');
const filterInput = document.getElementById('filterInput');
const genreFilter = document.getElementById('genreFilter');

// Função para renderizar a lista de livros
function renderBooks(lista = livros) {
  bookList.innerHTML = '';
  lista.forEach(livro => {
    const index = livros.indexOf(livro);
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.index = index;
    card.innerHTML = `
      <div class="book-cover">${livro.icone}</div>
      <div class="book-info">
        <h3>${livro.titulo}</h3>
        <p>${livro.autor}</p>
        <span class="badge">${livro.genero}</span>
      </div>
      <div class="book-actions">
        <i class="fa-solid fa-pen" onclick="event.stopPropagation();"></i>
        <i class="fa-solid fa-trash" onclick="event.stopPropagation();"></i>
      </div>`;
    card.addEventListener('click', () => showDetail(index));
    bookList.appendChild(card);
  });
}

// Função para exibir detalhes do livro selecionado
function showDetail(index) {
  const livro = livros[index];
  document.querySelectorAll('.book-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.book-card[data-index="${index}"]`).classList.add('active');
  detailContent.innerHTML = `
    <div class="detail-top">
      <div class="detail-cover">${livro.icone}</div>
      <div class="detail-info">
        <h2>${livro.titulo}</h2>
        <p class="author">${livro.autor}</p>
        <span class="badge">${livro.genero}</span>
      </div>
    </div>
    <div class="detail-meta">
      <div class="meta-item"><i class="fa-solid fa-book"></i><strong>ISBN:</strong> ${livro.isbn}</div>
      <div class="meta-item"><i class="fa-solid fa-calendar"></i><strong>Ano de publicação:</strong> ${livro.ano}</div>
      <div class="meta-item"><i class="fa-solid fa-user"></i><strong>Editora:</strong> ${livro.editora}</div>
    </div>
    <div class="detail-section">
      <h4><i class="fa-solid fa-file-lines"></i> Sinopse</h4>
      <p>${livro.sinopse}</p>
    </div>
    <div class="detail-section">
      <h4><i class="fa-solid fa-tag"></i> Tags</h4>
      <div class="tags">${livro.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
    <div class="detail-actions">
      <button class="btn-edit"><i class="fa-solid fa-pen"></i> Editar</button>
      <button class="btn-delete"><i class="fa-solid fa-trash"></i> Remover</button>
    </div>`;

  detailPanel.classList.add('open');
}

// Função para fechar o painel de detalhes
function closeDetail() {
  detailPanel.classList.remove('open');
  document.querySelectorAll('.book-card').forEach(c => c.classList.remove('active'));
}
// Preencher filtro de gênero
const generos = [...new Set(livros.map(l => l.genero))];
generos.forEach(g => {
  const opt = document.createElement('option');
  opt.value = g;
  opt.textContent = g;
  genreFilter.appendChild(opt);
});
// Função para aplicar filtros de busca e gênero
function applyFilters() {
  const texto = filterInput.value.toLowerCase().trim();
  const genero = genreFilter.value;
  renderBooks(livros.filter(l =>
    (l.titulo.toLowerCase().includes(texto) ||
     l.autor.toLowerCase().includes(texto) ||
     l.isbn.toLowerCase().includes(texto)) &&
    (!genero || l.genero === genero)
  ));
}

// Eventos de input para filtros
filterInput.addEventListener('input', applyFilters);
genreFilter.addEventListener('change', applyFilters);

// menu de navegação
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    if (this.closest('.menu')) {
      document.querySelectorAll('.menu .menu-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    }
  });
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

renderBooks();