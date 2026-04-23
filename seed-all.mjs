// seed-all.mjs — Siembra todos los datos iniciales de producción
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryriooxpouschksdwxxk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'TU_SERVICE_ROLE_KEY_AQUI',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function upsert(table, rows, conflict = 'id') {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict });
  if (error) throw new Error(`[${table}] ${error.message}`);
}

// ─── 1. Configuracion del restaurante ────────────────────────────────────────
console.log('\n📋 Sembrando configuracion_restaurante...');
const configRows = [
  { clave: 'restaurant_name',               valor: 'RestoPOS' },
  { clave: 'ticket_nombre_negocio',         valor: 'RestoPOS' },
  { clave: 'ticket_nit',                    valor: '' },
  { clave: 'ticket_direccion',              valor: '' },
  { clave: 'ticket_telefono',               valor: '' },
  { clave: 'ticket_mensaje_pie',            valor: '¡Gracias por su visita!' },
  { clave: 'ticket_ancho_papel',            valor: '80mm' },
  { clave: 'ticket_iva_porcentaje',         valor: '0' },
  { clave: 'ticket_mostrar_dian',           valor: 'false' },
  { clave: 'ticket_mostrar_logo',           valor: 'false' },
  { clave: 'ticket_logo_data_url',          valor: '' },
  { clave: 'ticket_auto_print_comanda_mesero', valor: 'true' },
  { clave: 'ticket_print_profile_name',     valor: 'POS / Cocina' },
];
await upsert('configuracion_restaurante', configRows, 'clave');
console.log(`  ✅ ${configRows.length} claves de configuración sembradas`);

// ─── 2. Inventario inicial ────────────────────────────────────────────────────
console.log('\n📦 Verificando inventario...');
const { count: invCount } = await supabase.from('inventario').select('*', { head: true, count: 'exact' });
if ((invCount || 0) > 0) {
  console.log(`  ℹ️  Inventario ya tiene ${invCount} ítems, omitiendo seed.`);
} else {
  const inventarioSeed = [
    { nombre: 'Carne de Res (Hamburguesa)', categoria: 'Carnes',     unidad: 'kg',      cantidad: 10, cantidad_minima: 3,  costo_unitario: 22000, proveedor: 'Carnes del Valle' },
    { nombre: 'Pollo (Pechuga)',            categoria: 'Carnes',     unidad: 'kg',      cantidad: 8,  cantidad_minima: 2,  costo_unitario: 15000, proveedor: 'Avícola Central' },
    { nombre: 'Chorizo',                    categoria: 'Carnes',     unidad: 'unidad',  cantidad: 50, cantidad_minima: 10, costo_unitario: 2500,  proveedor: 'Embutidos La Granja' },
    { nombre: 'Tocineta',                   categoria: 'Carnes',     unidad: 'paquete', cantidad: 5,  cantidad_minima: 2,  costo_unitario: 8500,  proveedor: 'Embutidos La Granja' },
    { nombre: 'Pan de Hamburguesa',         categoria: 'Panadería',  unidad: 'unidad',  cantidad: 80, cantidad_minima: 20, costo_unitario: 800,   proveedor: 'Panadería El Trigal' },
    { nombre: 'Pan de Perro Caliente',      categoria: 'Panadería',  unidad: 'unidad',  cantidad: 60, cantidad_minima: 15, costo_unitario: 600,   proveedor: 'Panadería El Trigal' },
    { nombre: 'Papa (kg)',                  categoria: 'Vegetales',  unidad: 'kg',      cantidad: 20, cantidad_minima: 5,  costo_unitario: 2200,  proveedor: 'Finca La Esperanza' },
    { nombre: 'Ketchup',                    categoria: 'Salsas',     unidad: 'litro',   cantidad: 4,  cantidad_minima: 1,  costo_unitario: 7000,  proveedor: 'Distribuidor Ancla' },
    { nombre: 'Mostaza',                    categoria: 'Salsas',     unidad: 'litro',   cantidad: 3,  cantidad_minima: 1,  costo_unitario: 6500,  proveedor: 'Distribuidor Ancla' },
    { nombre: 'Mayonesa',                   categoria: 'Salsas',     unidad: 'litro',   cantidad: 4,  cantidad_minima: 1,  costo_unitario: 9000,  proveedor: 'Distribuidor Ancla' },
    { nombre: 'Salsa BBQ',                  categoria: 'Salsas',     unidad: 'litro',   cantidad: 2,  cantidad_minima: 1,  costo_unitario: 11000, proveedor: 'Distribuidor Ancla' },
    { nombre: 'Queso Americano',            categoria: 'Lácteos',    unidad: 'paquete', cantidad: 6,  cantidad_minima: 2,  costo_unitario: 14000, proveedor: 'Lácteos del Oriente' },
    { nombre: 'Queso Mozzarella',           categoria: 'Lácteos',    unidad: 'kg',      cantidad: 4,  cantidad_minima: 1,  costo_unitario: 22000, proveedor: 'Lácteos del Oriente' },
    { nombre: 'Coca-Cola 250ml',            categoria: 'Bebidas',    unidad: 'unidad',  cantidad: 48, cantidad_minima: 12, costo_unitario: 1500,  proveedor: 'Coca-Cola Colombia' },
    { nombre: 'Agua 500ml',                 categoria: 'Bebidas',    unidad: 'unidad',  cantidad: 36, cantidad_minima: 10, costo_unitario: 800,   proveedor: 'Distribuidora Aguas' },
    { nombre: 'Jugo Natural (Litro)',       categoria: 'Bebidas',    unidad: 'litro',   cantidad: 5,  cantidad_minima: 2,  costo_unitario: 3000,  proveedor: 'Finca La Esperanza' },
    { nombre: 'Caja Hamburguesa',           categoria: 'Empaques',   unidad: 'unidad',  cantidad: 200,cantidad_minima: 50, costo_unitario: 350,   proveedor: 'Packaging Colombia' },
    { nombre: 'Vaso Desechable 16oz',       categoria: 'Empaques',   unidad: 'unidad',  cantidad: 150,cantidad_minima: 40, costo_unitario: 180,   proveedor: 'Packaging Colombia' },
    { nombre: 'Servilletas (paquete)',      categoria: 'Empaques',   unidad: 'paquete', cantidad: 20, cantidad_minima: 5,  costo_unitario: 2500,  proveedor: 'Distribuidora Ancla' },
  ];
  const { error } = await supabase.from('inventario').insert(inventarioSeed);
  if (error) throw new Error(`[inventario] ${error.message}`);
  console.log(`  ✅ ${inventarioSeed.length} ítems de inventario sembrados`);
}

// ─── 3. Licencia ──────────────────────────────────────────────────────────────
console.log('\n🔑 Verificando licencia...');
const { count: licCount } = await supabase.from('licencia_estado').select('*', { head: true, count: 'exact' });
if ((licCount || 0) === 0) {
  await supabase.from('licencia_estado').insert({
    estado: 'trial', plan: 'trial-7-days', trial_days: 7,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
  console.log('  ✅ Licencia trial de 7 días creada');
} else {
  console.log('  ℹ️  Licencia ya existe, omitiendo.');
}

// ─── 4. Verificación final ────────────────────────────────────────────────────
console.log('\n🔍 Verificación final del sistema...');
const checks = [
  { table: 'mesas',                    min: 1,  label: 'mesas' },
  { table: 'meseros',                  min: 1,  label: 'usuarios (meseros/admin)' },
  { table: 'categorias',               min: 1,  label: 'categorías de menú' },
  { table: 'productos',                min: 1,  label: 'productos' },
  { table: 'inventario',               min: 1,  label: 'ítems de inventario' },
  { table: 'configuracion_restaurante',min: 1,  label: 'claves de configuración' },
  { table: 'licencia_estado',          min: 1,  label: 'licencia' },
];

let allOk = true;
for (const chk of checks) {
  const { count, error } = await supabase.from(chk.table).select('*', { head: true, count: 'exact' });
  if (error || (count ?? 0) < chk.min) {
    console.log(`  ❌ ${chk.label}: ${error?.message || `solo ${count} filas`}`);
    allOk = false;
  } else {
    console.log(`  ✅ ${chk.label}: ${count} filas`);
  }
}

if (allOk) {
  console.log('\n🎉 ¡Base de datos lista para producción!\n');
} else {
  console.log('\n⚠️  Algunas verificaciones fallaron — revisa los errores arriba.\n');
}
