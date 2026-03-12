import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Live migration: add new tables and columns safely
    db.exec(`
      -- Discounts on invoices
      CREATE TABLE IF NOT EXISTS _migration_check (id INTEGER PRIMARY KEY);
    `);

    // Add descuento column to facturas if not exists
    try { db.exec(`ALTER TABLE facturas ADD COLUMN descuento REAL DEFAULT 0`); } catch {}
    try { db.exec(`ALTER TABLE facturas ADD COLUMN descuento_tipo TEXT DEFAULT 'porcentaje'`); } catch {}
    try { db.exec(`ALTER TABLE facturas ADD COLUMN nota_descuento TEXT`); } catch {}

    // Audit log table
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL,
        accion TEXT NOT NULL,
        entidad TEXT,
        detalle TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Reservas table
    db.exec(`
      CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        fecha DATE NOT NULL,
        hora TEXT NOT NULL,
        personas INTEGER DEFAULT 2,
        mesa_id INTEGER,
        estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
        notas TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mesa_id) REFERENCES mesas(id)
      );
    `);

    // Combos table
    db.exec(`
      CREATE TABLE IF NOT EXISTS combos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio_especial REAL,
        activo INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS combo_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        combo_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER DEFAULT 1,
        FOREIGN KEY (combo_id) REFERENCES combos(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      );
    `);

    // Seed one sample combo if empty
    const comboCount = (db.prepare('SELECT COUNT(*) as c FROM combos').get() as any).c;
    if (comboCount === 0) {
      const prods = db.prepare('SELECT id, nombre FROM productos LIMIT 3').all() as any[];
      if (prods.length >= 2) {
        const comboId = db.prepare('INSERT INTO combos (nombre, descripcion, precio_especial) VALUES (?, ?, ?)').run('Combo Clásico', 'Plato + Bebida', null).lastInsertRowid;
        db.prepare('INSERT INTO combo_items (combo_id, producto_id, cantidad) VALUES (?, ?, ?)').run(comboId, prods[0].id, 1);
        if (prods.length > 1) db.prepare('INSERT INTO combo_items (combo_id, producto_id, cantidad) VALUES (?, ?, ?)').run(comboId, prods[1].id, 1);
      }
    }

    return NextResponse.json({ success: true, message: 'Migration completed: audit_log, reservas, combos, facturas columns' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
