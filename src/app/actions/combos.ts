'use server';
import db from '@/lib/db';

export async function getCombos() {
  try {
    const combos = db.prepare('SELECT * FROM combos WHERE activo = 1').all() as any[];
    const items = db.prepare(`
      SELECT ci.combo_id, ci.cantidad, p.id as producto_id, p.nombre, p.precio, p.categoria_id
      FROM combo_items ci JOIN productos p ON ci.producto_id = p.id
    `).all() as any[];
    return { success: true, data: combos.map(c => ({ ...c, items: items.filter(i => i.combo_id === c.id) })) };
  } catch (e: any) { return { success: false, data: [] }; }
}

export async function addCombo(nombre: string, descripcion: string, items: { producto_id: number; cantidad: number }[], precio_especial?: number) {
  try {
    const comboId = db.prepare('INSERT INTO combos (nombre, descripcion, precio_especial) VALUES (?, ?, ?)').run(nombre, descripcion, precio_especial || null).lastInsertRowid;
    const ins = db.prepare('INSERT INTO combo_items (combo_id, producto_id, cantidad) VALUES (?, ?, ?)');
    db.transaction(() => { items.forEach(i => ins.run(comboId, i.producto_id, i.cantidad)); })();
    return { success: true, id: comboId };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteCombo(id: number) {
  try {
    db.prepare('DELETE FROM combo_items WHERE combo_id = ?').run(id);
    db.prepare('DELETE FROM combos WHERE id = ?').run(id);
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}
