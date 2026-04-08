export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // SECURITY CHECK: Only allow if a secret key matches or in development
    const authHeader = req.headers.get('x-setup-key');
    const setupKey = process.env.DB_SETUP_KEY || 'movilcom_secret_2026';
    
    if (authHeader !== setupKey && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'No autorizado para configurar la base de datos en producción.' }, { status: 401 });
    }

    await db.executeMultiple(`
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
          rol TEXT DEFAULT 'waiter',
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
          descuento REAL DEFAULT 0,
          descuento_tipo TEXT DEFAULT 'porcentaje',
          nota_descuento TEXT,
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
        CREATE TABLE IF NOT EXISTS configuracion (
          clave TEXT PRIMARY KEY,
          valor TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario TEXT NOT NULL,
          accion TEXT NOT NULL,
          entidad TEXT,
          detalle TEXT,
          fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        );
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

    const hasLicencia = (await db.execute("SELECT count(*) as count FROM configuracion WHERE clave = 'vencimiento_licencia'")).rows[0] as unknown as {count: number};
    if (hasLicencia.count === 0) {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      await db.execute({ sql: "INSERT INTO configuracion (clave, valor) VALUES (?, ?)", args: ['vencimiento_licencia', futureDate.toISOString()] });
    }

    const admins = (await db.execute("SELECT count(*) as count FROM meseros WHERE rol = 'admin'")).rows[0] as unknown as {count: number};
    if (admins.count === 0) await db.execute({ sql: "INSERT INTO meseros (nombre, rol, pin) VALUES (?, ?, ?)", args: ['Acceso Administrador', 'admin', '1234'] });

    const kitchens = (await db.execute("SELECT count(*) as count FROM meseros WHERE rol = 'kitchen'")).rows[0] as unknown as {count: number};
    if (kitchens.count === 0) await db.execute({ sql: "INSERT INTO meseros (nombre, rol, pin) VALUES (?, ?, ?)", args: ['Terminal Cocina', 'kitchen', '5678'] });

    const waiters = (await db.execute("SELECT count(*) as count FROM meseros WHERE rol = 'waiter' AND pin IS NOT NULL")).rows[0] as unknown as {count: number};
    if (waiters.count === 0) await db.execute({ sql: "INSERT INTO meseros (nombre, rol, pin) VALUES (?, ?, ?)", args: ['Terminal Mesero', 'waiter', '0000'] });

    const mesaCount = (await db.execute("SELECT COUNT(*) as count FROM mesas")).rows[0] as unknown as {count: number};
    if (mesaCount.count === 0) {
      for (let i = 1; i <= 10; i++) {
        await db.execute({ sql: "INSERT INTO mesas (numero, capacidad) VALUES (?, ?)", args: [i, i % 2 === 0 ? 4 : 2] });
      }
    }

    return NextResponse.json({ success: true, message: 'Base de Datos inicializada con seguridad habilitada.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
