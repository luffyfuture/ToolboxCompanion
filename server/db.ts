import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';

// Create SQLite database file in the project root
const sqlite = new Database('database.sqlite');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Auto-migrate on startup
try {
  // Create tables if they don't exist using SQLite syntax
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT NOT NULL,
      path TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS note_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER REFERENCES note_categories(id),
      user_id INTEGER REFERENCES users(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category_id INTEGER REFERENCES note_categories(id),
      user_id INTEGER REFERENCES users(id),
      tags TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
    CREATE INDEX IF NOT EXISTS idx_notes_content ON notes(content);
    CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id);
    CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_parent ON note_categories(parent_id);
  `);
  console.log('SQLite database initialized successfully');
} catch (error) {
  console.error('Error initializing SQLite database:', error);
}

export { sqlite };
