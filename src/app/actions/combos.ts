'use server';
import db from '@/lib/db';

export async function getCombos() {
  try {
    const combos = (await db.execute('SELECT * FROM combos WHERE activo = 1')).rows as any[];
    const items = (await db.execute(`
      SELECT ci.combo_id, ci.cantidad, p.id as producto_id, p.nombre, p.precio, p.categoria_id
      FROM combo_items ci JOIN productos p ON ci.producto_id = p.id
    `)).rows as any[];
    return { success: true, data: combos.map(c => ({ ...c, items: items.filter(i => i.combo_id === c.id) })) };
  } catch (e: any) { return { success: false, data: [] }; }
}

export async function addCombo(nombre: string, descripcion: string, items: { producto_id: number; cantidad: number }[], precio_especial?: number) {
  try {
    const comboId = Number((await db.execute({ sql: 'INSERT INTO combos (nombre, descripcion, precio_especial) VALUES (?, ?, ?)', args: [nombre, descripcion, precio_especial || null] })).lastInsertRowid);
    for (const i of items) {
      await db.execute({ sql: 'INSERT INTO combo_items (combo_id, producto_id, cantidad) VALUES (?, ?, ?)', args: [comboId, i.producto_id, i.cantidad] });
    }
    return { success: true, id: comboId };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteCombo(id: number) {
  try {
    await db.execute({ sql: 'DELETE FROM combo_items WHERE combo_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM combos WHERE id = ?', args: [id] });
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}
