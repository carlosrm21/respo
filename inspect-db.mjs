import Database from 'better-sqlite3';

const db = new Database('./data/restaurante.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('TABLAS:', JSON.stringify(tables, null, 2));

for (const t of tables) {
  try {
    const info = db.prepare(`PRAGMA table_info(${t.name})`).all();
    console.log(`\nESQUEMA ${t.name}:`, JSON.stringify(info, null, 2));
    const rows = db.prepare(`SELECT * FROM ${t.name} LIMIT 3`).all();
    console.log(`DATOS ${t.name}:`, JSON.stringify(rows, null, 2));
  } catch(e) {
    console.log(`Error en tabla ${t.name}:`, e.message);
  }
}

db.close();
