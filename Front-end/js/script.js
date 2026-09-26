  const livros = [
    { titulo: "Dom Casmurro", autor: "Machado de Assis", genero: "Romance", icone: "📕" },
    { titulo: "1984", autor: "George Orwell", genero: "Distopia", icone: "📘" },
    { titulo: "O Hobbit", autor: "J.R.R. Tolkien", genero: "Fantasia", icone: "📗" },
    { titulo: "Sapiens", autor: "Yuval Harari", genero: "História", icone: "📙" },
    { titulo: "Clean Code", autor: "Robert Martin", genero: "Tecnologia", icone: "📓" },
    { titulo: "A Revolução dos Bichos", autor: "George Orwell", genero: "Fábula", icone: "📔" }
  ];

  const grid = document.getElementById('grid');
  livros.forEach(livro => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="capa">${livro.icone}</div>
      <h3>${livro.titulo}</h3>
      <p>${livro.autor}</p>
      <span class="badge">${livro.genero}</span>
    `;
    card.addEventListener('click', () => {
      alert(`📖 ${livro.titulo}\nAutor: ${livro.autor}\nGênero: ${livro.genero}`);
    });
    grid.appendChild(card);
  });

  function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('expanded');
  }

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });