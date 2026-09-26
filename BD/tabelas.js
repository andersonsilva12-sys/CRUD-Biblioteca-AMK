const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./BD/biblioteca.db', (err) => {
    if (err) {
        console.error('Erro ao Abrir o Banco de Dados: ', err.message)
    } else {
        console.log('Conectado ao Banco de Dados SQlite com sucesso: ', err.message)
    }
})

db.serialize(() => {

  db.run(
   `CREATE TABLE IF NOT EXISTS autores (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   nome TEXT NOT NULL,
   nacionalidade TEXT)
    )`),

  db.run(
    `CREATE TABLE IF NOT EXISTS livros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    isbn TEXT UNIQUE,
    ano_publicacao INTEGER,
    editora TEXT,
    quantidade INTEGER DEFAULT 0,
    sinopse TEXT,
    autor_id INTEGER,

    FOREIGN KEY (autor_id) REFERENCES autores(id)
  )`)
});

db.close((err) => {
    if (err) {
        console.error('Erro ao fechar o banco: ', err.message)
    } else {
        console.log('Conexão encerrada')
    }
})