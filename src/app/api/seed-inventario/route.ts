import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Create inventario table if it doesn't exist (live migration)
    db.exec(`
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
      )
    `);

    const count = (db.prepare('SELECT COUNT(*) as count FROM inventario').get() as any).count;
    if (count > 0) {
      return NextResponse.json({ message: `Already seeded: ${count} items`, count });
    }

    const insertInv = db.prepare('INSERT INTO inventario (nombre, categoria, unidad, cantidad, cantidad_minima, costo_unitario, proveedor) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const items = [
      ['Carne de Res (Hamburguesa)', 'Carnes', 'kg', 10, 3, 22000, 'Carnes del Valle'],
      ['Pollo (Pechuga)', 'Carnes', 'kg', 8, 2, 15000, 'Avícola Central'],
      ['Chorizo', 'Carnes', 'unidad', 50, 10, 2500, 'Embutidos La Granja'],
      ['Tocineta', 'Carnes', 'paquete', 5, 2, 8500, 'Embutidos La Granja'],
      ['Pan de Hamburguesa', 'Panadería', 'unidad', 80, 20, 800, 'Panadería El Trigal'],
      ['Pan de Perro Caliente', 'Panadería', 'unidad', 60, 15, 600, 'Panadería El Trigal'],
      ['Papa (kg)', 'Vegetales', 'kg', 20, 5, 2200, 'Finca La Esperanza'],
      ['Ketchup', 'Salsas', 'litro', 4, 1, 7000, 'Distribuidor Ancla'],
      ['Mostaza', 'Salsas', 'litro', 3, 1, 6500, 'Distribuidor Ancla'],
      ['Mayonesa', 'Salsas', 'litro', 4, 1, 9000, 'Distribuidor Ancla'],
      ['Salsa BBQ', 'Salsas', 'litro', 2, 1, 11000, 'Distribuidor Ancla'],
      ['Queso Americano', 'Lácteos', 'paquete', 6, 2, 14000, 'Lácteos del Oriente'],
      ['Queso Mozzarella', 'Lácteos', 'kg', 4, 1, 22000, 'Lácteos del Oriente'],
      ['Coca-Cola 250ml', 'Bebidas', 'unidad', 48, 12, 1500, 'Coca-Cola Colombia'],
      ['Agua 500ml', 'Bebidas', 'unidad', 36, 10, 800, 'Distribuidora Aguas'],
      ['Jugo Natural (Litro)', 'Bebidas', 'litro', 5, 2, 3000, 'Finca La Esperanza'],
      ['Caja Hamburguesa', 'Empaques', 'unidad', 200, 50, 350, 'Packaging Colombia'],
      ['Vaso Desechable 16oz', 'Empaques', 'unidad', 150, 40, 180, 'Packaging Colombia'],
      ['Servilletas (paquete)', 'Empaques', 'paquete', 20, 5, 2500, 'Distribuidora Ancla'],
    ];
    
    const seedMany = db.transaction(() => {
      for (const item of items) {
        insertInv.run(...item as any);
      }
    });
    seedMany();

    return NextResponse.json({ message: `Seeded ${items.length} inventory items`, count: items.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
