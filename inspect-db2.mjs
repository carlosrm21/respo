import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';

const db = new Database('./data/restaurante.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
let output = '';

output += 'TABLAS: ' + tables.map(t => t.name).join(', ') + '\n\n';

for (const t of tables) {
  if (t.name === 'sqlite_sequence') continue;
  try {
    const info = db.prepare(`PRAGMA table_info("${t.name}")`).all();
    const cols = info.map(c => `${c.name}(${c.type})`).join(', ');
    output += `TABLA ${t.name}: ${cols}\n`;
    
    const count = db.prepare(`SELECT COUNT(*) as n FROM "${t.name}"`).get();
    output += `  Registros: ${count.n}\n`;
    
    const rows = db.prepare(`SELECT * FROM "${t.name}" LIMIT 2`).all();
    if (rows.length > 0) {
      output += `  Ejemplo: ${JSON.stringify(rows[0])}\n`;
    }
    output += '\n';
  } catch(e) {
    output += `  Error: ${e.message}\n`;
  }
}

db.close();
writeFileSync('./db-schema.txt', output, 'utf8');
console.log('Guardado en db-schema.txt');
