import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

const db = new Database('./database.sqlite', { verbose: console.log });

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'artist',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export const createUser = (email, password, role = 'artist') => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
  const info = stmt.run(email, hashedPassword, role);
  return info.lastInsertRowid;
};

export const getUserByEmail = (email) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
};

export const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export default db;
