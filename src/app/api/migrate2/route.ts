import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Extend the migration to add product images, turnos, and more
export async function GET() {
  try {
    // Product images
    try { db.exec(`ALTER TABLE productos ADD COLUMN imagen_url TEXT`); } catch {}

    // Service time tracking on pedidos
    try { db.exec(`ALTER TABLE pedidos ADD COLUMN fecha_servido DATETIME`); } catch {}
    try { db.exec(`ALTER TABLE pedidos ADD COLUMN minutos_servicio INTEGER`); } catch {}

    // Turnos (shift management)
    db.exec(`
      CREATE TABLE IF NOT EXISTS turnos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mesero_id INTEGER NOT NULL,
        fecha DATE NOT NULL,
        hora_entrada TEXT NOT NULL,
        hora_salida TEXT,
        notas TEXT,
        estado TEXT DEFAULT 'activo' CHECK(estado IN ('activo', 'terminado')),
        FOREIGN KEY (mesero_id) REFERENCES meseros(id)
      );
    `);

    // Delivery orders (Rappi/iFood webhook)
    db.exec(`
      CREATE TABLE IF NOT EXISTS pedidos_delivery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plataforma TEXT NOT NULL,
        external_id TEXT,
        cliente_nombre TEXT,
        cliente_direccion TEXT,
        items_json TEXT NOT NULL,
        total REAL NOT NULL,
        estado TEXT DEFAULT 'recibido' CHECK(estado IN ('recibido', 'cocinando', 'en_camino', 'entregado', 'cancelado')),
        notas TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return NextResponse.json({
      success: true,
      message: 'Migration 2 completed: product images, turnos, delivery orders, minutos_servicio'
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
