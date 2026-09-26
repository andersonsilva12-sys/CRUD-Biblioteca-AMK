const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Garante o caminho correto do arquivo .db independente de onde o processo seja iniciado
const dbPath = path.resolve(__dirname, 'biblioteca.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Conectado ao Banco de Dados SQLite com sucesso.');
  }
});

db.serialize(() => {
  // Ativa o suporte a Foreign Keys no SQLite
  db.run('PRAGMA foreign_keys = ON;');

  // 1. Tabela Autores
  db.run(`
    CREATE TABLE IF NOT EXISTS autores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
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
      autor_id INTEGER NOT NULL,
      categoria_id INTEGER NOT NULL,
      FOREIGN KEY (autor_id) REFERENCES autores(id),
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )
  `);
});

module.exports = db;