import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

type ExecuteInput = string | { sql: string; args?: unknown[] };
type ExecuteResult = {
  rows: any[];
  rowsAffected?: number;
  lastInsertRowid?: number | bigint;
};

type AppDatabase = Database.Database & {
  execute: (input: ExecuteInput) => Promise<ExecuteResult>;
  executeMultiple: (sql: string) => Promise<void>;
};

const executeSql = (database: Database.Database, input: ExecuteInput): ExecuteResult => {
  const sql = typeof input === 'string' ? input : input.sql;
  const args = typeof input === 'string' ? [] : (input.args ?? []);
  const statement = database.prepare(sql);
  const normalizedSql = sql.trim().toUpperCase();

  if (normalizedSql.startsWith('SELECT') || normalizedSql.startsWith('PRAGMA') || normalizedSql.startsWith('WITH')) {
    return { rows: statement.all(...args) as any[] };
  }

  const runResult = statement.run(...args);
  return {
    rows: [],
    rowsAffected: runResult.changes,
    lastInsertRowid: runResult.lastInsertRowid
  };
};

// Initialize the database connection
const initDb = () => {
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'restaurante.db');
    const db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Preserve data across restarts — only create tables if they don't exist

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS mesas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero INTEGER NOT NULL UNIQUE,
        capacidad INTEGER DEFAULT 4,
        estado TEXT DEFAULT 'disponible' CHECK(estado IN ('disponible', 'ocupada', 'reservada'))
      );

      CREATE TABLE IF NOT EXISTS meseros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        pin TEXT,
        activo INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        costo REAL DEFAULT 0,
        disponible INTEGER DEFAULT 1,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id)
      );

      CREATE TABLE IF NOT EXISTS caja (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
        monto_apertura REAL NOT NULL,
        mesero_id_apertura INTEGER,
        fecha_cierre DATETIME,
        monto_cierre REAL,
        ventas_esperadas REAL DEFAULT 0,
        estado TEXT DEFAULT 'abierta' CHECK(estado IN ('abierta', 'cerrada')),
        FOREIGN KEY (mesero_id_apertura) REFERENCES meseros (id)
      );

      CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mesa_id INTEGER,
        mesero_id INTEGER,
        estado TEXT DEFAULT 'abierto' CHECK(estado IN ('abierto', 'pagado', 'cancelado')),
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mesa_id) REFERENCES mesas (id),
        FOREIGN KEY (mesero_id) REFERENCES meseros (id)
      );

      CREATE TABLE IF NOT EXISTS detalles_pedido (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER,
        producto_id INTEGER,
        cantidad INTEGER NOT NULL DEFAULT 1,
        precio_unitario REAL NOT NULL,
        notas TEXT,
        estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'cocinando', 'servido')),
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id),
        FOREIGN KEY (producto_id) REFERENCES productos (id)
      );

      CREATE TABLE IF NOT EXISTS facturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER UNIQUE,
        numero_dian TEXT,
        total REAL NOT NULL,
        metodo_pago TEXT,
        xml_dian TEXT,
        estado_dian TEXT DEFAULT 'no_enviado',
        fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
      );

      CREATE TABLE IF NOT EXISTS inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        categoria TEXT NOT NULL,
        unidad TEXT NOT NULL,
        cantidad REAL DEFAULT 0,
        cantidad_minima REAL DEFAULT 0,
        costo_unitario REAL DEFAULT 0,
        proveedor TEXT,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Initialize with some default data if empty
    const mesaCount = db.prepare('SELECT COUNT(*) as count FROM mesas').get() as { count: number };
    if (mesaCount.count === 0) {
        const insertMesa = db.prepare('INSERT INTO mesas (numero, capacidad) VALUES (?, ?)');
        for (let i = 1; i <= 10; i++) {
            insertMesa.run(i, i % 2 === 0 ? 4 : 2);
        }

        const insertMesero = db.prepare('INSERT INTO meseros (nombre) VALUES (?)');
        insertMesero.run('Carlos');
        insertMesero.run('Maria');

        const insertCat = db.prepare('INSERT INTO categorias (nombre) VALUES (?)');
        const bId = insertCat.run('Bebidas').lastInsertRowid;
        const pId = insertCat.run('Platos Fuertes').lastInsertRowid;

        const insertProd = db.prepare('INSERT INTO productos (categoria_id, nombre, precio, costo) VALUES (?, ?, ?, ?)');
        insertProd.run(bId, 'Coca Cola', 3500, 1500);
        insertProd.run(bId, 'Limonada', 4000, 800);
        insertProd.run(pId, 'Bandeja Paisa', 25000, 12000);
        insertProd.run(pId, 'Ajiaco', 22000, 10000);

    }

    // Always seed inventory if empty (handles existing DBs that pre-date the inventario table)
    const invCount2 = db.prepare('SELECT COUNT(*) as count FROM inventario').get() as { count: number };
    if (invCount2.count === 0) {
        const insertInv = db.prepare('INSERT INTO inventario (nombre, categoria, unidad, cantidad, cantidad_minima, costo_unitario, proveedor) VALUES (?, ?, ?, ?, ?, ?, ?)');
        insertInv.run('Carne de Res (Hamburguesa)', 'Carnes', 'kg', 10, 3, 22000, 'Carnes del Valle');
        insertInv.run('Pollo (Pechuga)', 'Carnes', 'kg', 8, 2, 15000, 'Avícola Central');
        insertInv.run('Chorizo', 'Carnes', 'unidad', 50, 10, 2500, 'Embutidos La Granja');
        insertInv.run('Tocineta', 'Carnes', 'paquete', 5, 2, 8500, 'Embutidos La Granja');
        insertInv.run('Pan de Hamburguesa', 'Panadería', 'unidad', 80, 20, 800, 'Panadería El Trigal');
        insertInv.run('Pan de Perro Caliente', 'Panadería', 'unidad', 60, 15, 600, 'Panadería El Trigal');
        insertInv.run('Papa (kg)', 'Vegetales', 'kg', 20, 5, 2200, 'Finca La Esperanza');
        insertInv.run('Ketchup', 'Salsas', 'litro', 4, 1, 7000, 'Distribuidor Ancla');
        insertInv.run('Mostaza', 'Salsas', 'litro', 3, 1, 6500, 'Distribuidor Ancla');
        insertInv.run('Mayonesa', 'Salsas', 'litro', 4, 1, 9000, 'Distribuidor Ancla');
        insertInv.run('Salsa BBQ', 'Salsas', 'litro', 2, 1, 11000, 'Distribuidor Ancla');
        insertInv.run('Queso Americano', 'Lácteos', 'paquete', 6, 2, 14000, 'Lácteos del Oriente');
        insertInv.run('Queso Mozzarella', 'Lácteos', 'kg', 4, 1, 22000, 'Lácteos del Oriente');
        insertInv.run('Coca-Cola 250ml', 'Bebidas', 'unidad', 48, 12, 1500, 'Coca-Cola Colombia');
        insertInv.run('Agua 500ml', 'Bebidas', 'unidad', 36, 10, 800, 'Distribuidora Aguas');
        insertInv.run('Jugo Natural (Litro)', 'Bebidas', 'litro', 5, 2, 3000, 'Finca La Esperanza');
        insertInv.run('Caja Hamburguesa', 'Empaques', 'unidad', 200, 50, 350, 'Packaging Colombia');
        insertInv.run('Vaso Desechable 16oz', 'Empaques', 'unidad', 150, 40, 180, 'Packaging Colombia');
        insertInv.run('Servilletas (paquete)', 'Empaques', 'paquete', 20, 5, 2500, 'Distribuidora Ancla');
    }


    return db;
};

// Singleton pattern for Next.js (so we don't open multiple connections during hot-reloads)
let db: AppDatabase;

if (process.env.NODE_ENV === 'production') {
  const initializedDb = initDb();
  (initializedDb as AppDatabase).execute = async (input: ExecuteInput) => executeSql(initializedDb, input);
  (initializedDb as AppDatabase).executeMultiple = async (sql: string) => {
    initializedDb.exec(sql);
  };
  db = initializedDb as AppDatabase;
} else {
    if (!(global as any).sqliteDb) {
    const initializedDb = initDb();
    (initializedDb as AppDatabase).execute = async (input: ExecuteInput) => executeSql(initializedDb, input);
    (initializedDb as AppDatabase).executeMultiple = async (sql: string) => {
      initializedDb.exec(sql);
    };
    (global as any).sqliteDb = initializedDb;
    }
  db = (global as any).sqliteDb as AppDatabase;
}

export default db;
