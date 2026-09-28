const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'biblioteca.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Conectado ao Banco de Dados SQLite com sucesso.');
  }
});

db.serialize(() => {
  // Ativa o suporte a Foreign Keys
  db.run('PRAGMA foreign_keys = ON;');

  // 1. Tabela Autores
  db.run(`
    CREATE TABLE IF NOT EXISTS autores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      nacionalidade TEXT
    )
  `);

  // 2. Tabela Categorias
  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    )
  `);

  // 3. Tabela Livros
  db.run(`
    CREATE TABLE IF NOT EXISTS livros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      isbn TEXT UNIQUE,
      ano_publicacao INTEGER,
      editora TEXT,
      quantidade INTEGER NOT NULL DEFAULT 0,
      sinopse TEXT,
      imagem TEXT,
      autor_id INTEGER NOT NULL,
      categoria_id INTEGER NOT NULL,
      FOREIGN KEY (autor_id) REFERENCES autores(id),
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )
  `);

  // Garante a presença da coluna imagem em bancos já existentes
  db.run(`ALTER TABLE livros ADD COLUMN imagem TEXT`, () => {});

  // =========================================================
  // --- POVOAMENTO SEGURO (Mapeando nomes aos IDs reais) ---
  // =========================================================

  // 1. Inserir Categorias
  const categorias = [
    'Fantasia', 'Ficção Científica', 'Romance', 'Aventura', 'Terror', 
    'Suspense', 'Drama', 'Realismo Mágico', 'Distopia', 'Poesia', 'Filosofia', 'História'
  ];
  const stmtCat = db.prepare(`INSERT OR IGNORE INTO categorias (nome) VALUES (?)`);
  categorias.forEach(c => stmtCat.run(c));
  stmtCat.finalize();

  // 2. Inserir Autores
  const autores = [
    ['Machado de Assis', 'Brasileira'],
    ['Clarice Lispector', 'Brasileira'],
    ['George Orwell', 'Britânica'],
    ['J. R. R. Tolkien', 'Britânica'],
    ['Lewis Carroll', 'Britânica'],
    ['Mary Shelley', 'Britânica'],
    ['Agatha Christie', 'Britânica'],
    ['Edgar Allan Poe', 'Norte-americana'],
    ['Fiódor Dostoiévski', 'Russa']
  ];
  const stmtAutor = db.prepare(`INSERT OR IGNORE INTO autores (nome, nacionalidade) VALUES (?, ?)`);
  autores.forEach(([nome, nac]) => stmtAutor.run(nome, nac));
  stmtAutor.finalize();

  // 3. Inserir Livros buscando os IDs Reais pelo Nome do Autor e da Categoria
  const livrosExemplo = [
    {
      titulo: 'Dom Casmurro',
      isbn: '978-8535902713',
      ano_publicacao: 1899,
      editora: 'Livraria Garnet',
      quantidade: 5,
      sinopse: 'A célebre história de Bento Santiago, o Bentinho, e sua dúvida cruel e obsessiva sobre a fidelidade de Capitu.',
      imagem: 'https://m.media-amazon.com/images/I/81S88moxT-L._AC_UF1000,1000_QL80_.jpg',
      autorNome: 'Machado de Assis',
      catNome: 'Romance'
    },
    {
      titulo: '1984',
      isbn: '978-8535914849',
      ano_publicacao: 1949,
      editora: 'Secker & Warburg',
      quantidade: 8,
      sinopse: 'Winston Smith vive sob o olhar vigilante do Grande Irmão em uma sociedade totalmente sob o controle de um estado totalitário.',
      imagem: 'https://m.media-amazon.com/images/I/819js3EQwbL._AC_UF1000,1000_QL80_.jpg',
      autorNome: 'George Orwell',
      catNome: 'Distopia'
    },
    {
      titulo: 'O Hobbit',
      isbn: '978-8595084742',
      ano_publicacao: 1937,
      editora: 'George Allen & Unwin',
      quantidade: 4,
      sinopse: 'Bilbo Bolseiro é um hobbit pacato que é envolvido em uma jornada épica pelo mago Gandalf para recuperar o tesouro dos anões.',
      imagem: 'https://m.media-amazon.com/images/I/91M9xP33A2L._AC_UF1000,1000_QL80_.jpg',
      autorNome: 'J. R. R. Tolkien',
      catNome: 'Fantasia'
    },
    {
      titulo: 'Alice no País das Maravilhas',
      isbn: '978-8537801826',
      ano_publicacao: 1865,
      editora: 'Macmillan',
      quantidade: 6,
      sinopse: 'Alice cai em uma toca de coelho e vai parar em um mundo fantástico povoado por criaturas peculiares.',
      imagem: 'https://m.media-amazon.com/images/I/818M8sAn1tL._AC_UF1000,1000_QL80_.jpg',
      autorNome: 'Lewis Carroll',
      catNome: 'Fantasia'
    }
  ];

  const queryInsertLivro = `
    INSERT OR IGNORE INTO livros (titulo, isbn, ano_publicacao, editora, quantidade, sinopse, imagem, autor_id, categoria_id)
    VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      (SELECT id FROM autores WHERE nome = ?),
      (SELECT id FROM categorias WHERE nome = ?)
    )
  `;

  const stmtLivro = db.prepare(queryInsertLivro);
  livrosExemplo.forEach(l => {
    stmtLivro.run(l.titulo, l.isbn, l.ano_publicacao, l.editora, l.quantidade, l.sinopse, l.imagem, l.autorNome, l.catNome);
  });
  stmtLivro.finalize();

  console.log('Banco de dados povoado com sucesso e Foreign Keys resolvidas!');
});

module.exports = db;