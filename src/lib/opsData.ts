import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

type OrderItemInput = {
  id: number;
  cantidad: number;
  precio: number;
  notas?: string;
};

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado para operaciones.');
  }

  return getSupabaseAdmin();
}

function one<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function asNumber(value: unknown) {
  if (typeof value === 'number') return value;
  return Number(value || 0);
}

export async function seedSupabaseOperationalData() {
  const supabase = requireSupabase();

  const { count: tablesCount, error: tablesCountError } = await supabase
    .from('mesas')
    .select('*', { count: 'exact', head: true });

  if (tablesCountError) throw new Error(tablesCountError.message);

  if (!tablesCount) {
    const mesas = Array.from({ length: 10 }, (_, index) => ({
      numero: index + 1,
      capacidad: (index + 1) % 2 === 0 ? 4 : 2,
      estado: 'disponible'
    }));

    const { error } = await supabase.from('mesas').insert(mesas);
    if (error) throw new Error(error.message);
  }

  const { count: categoriesCount, error: categoriesCountError } = await supabase
    .from('categorias')
    .select('*', { count: 'exact', head: true });

  if (categoriesCountError) throw new Error(categoriesCountError.message);

  if (!categoriesCount) {
    const { error } = await supabase.from('categorias').insert([
      { nombre: 'Bebidas' },
      { nombre: 'Platos Fuertes' }
    ]);

    if (error) throw new Error(error.message);
  }

  const { data: categories, error: categoriesError } = await supabase
    .from('categorias')
    .select('id, nombre');

  if (categoriesError) throw new Error(categoriesError.message);

  const byName = new Map((categories || []).map((category) => [category.nombre, category.id]));

  const { count: productsCount, error: productsCountError } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true });

  if (productsCountError) throw new Error(productsCountError.message);

  if (!productsCount) {
    const { error } = await supabase.from('productos').insert([
      { categoria_id: byName.get('Bebidas'), nombre: 'Coca Cola', precio: 3500, costo: 1500, disponible: 1 },
      { categoria_id: byName.get('Bebidas'), nombre: 'Limonada', precio: 4000, costo: 800, disponible: 1 },
      { categoria_id: byName.get('Platos Fuertes'), nombre: 'Bandeja Paisa', precio: 25000, costo: 12000, disponible: 1 },
      { categoria_id: byName.get('Platos Fuertes'), nombre: 'Ajiaco', precio: 22000, costo: 10000, disponible: 1 }
    ]);

    if (error) throw new Error(error.message);
  }
}

export async function getRestaurantSetting(key: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('configuracion_restaurante')
    .select('valor')
    .eq('clave', key)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.valor ?? null;
}

export async function upsertRestaurantSettings(entries: Record<string, string>) {
  const supabase = requireSupabase();
  const rows = Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([clave, valor]) => ({ clave, valor: String(valor) }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('configuracion_restaurante')
    .upsert(rows, { onConflict: 'clave' });

  if (error) throw new Error(error.message);
}

export async function getLatestLicenseRow() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('licencia_estado')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function insertLicenseRow(payload: {
  estado: 'trial' | 'paid';
  plan: string;
  started_at: string;
  expires_at: string;
  trial_days: number;
  payment_id?: string | null;
}) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('licencia_estado')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getMesasData() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .order('numero', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateMesaData(id: number, payload: Record<string, unknown>) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('mesas').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getCategoriasData() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getProductosData(options?: { onlyAvailable?: boolean }) {
  const supabase = requireSupabase();
  let query = supabase
    .from('productos')
    .select('id, nombre, precio, costo, descripcion, disponible, categoria_id, categorias(nombre)')
    .order('nombre', { ascending: true });

  if (options?.onlyAvailable) {
    query = query.eq('disponible', 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map((product: any) => ({
    ...product,
    precio: asNumber(product.precio),
    costo: asNumber(product.costo),
    categoria_nombre: one(product.categorias)?.nombre || null
  }));
}

export async function addProductoData(payload: {
  nombre: string;
  categoria_id: number;
  precio: number;
  costo: number;
  descripcion?: string;
}) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('productos')
    .insert({ ...payload, disponible: 1 })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id;
}

export async function updateProductoData(id: number, payload: Record<string, unknown>) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('productos').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProductoData(id: number) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addCategoriaData(nombre: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('categorias').insert({ nombre }).select('id').single();
  if (error) throw new Error(error.message);
  return data?.id;
}

export async function createPedidoData(mesaId: number, meseroId: number | null, items: OrderItemInput[]) {
  const supabase = requireSupabase();

  const { data: mesa, error: mesaError } = await supabase
    .from('mesas')
    .select('id, numero')
    .eq('id', mesaId)
    .single();

  if (mesaError) throw new Error(mesaError.message);

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({ mesa_id: mesaId, mesero_id: meseroId, estado: 'abierto' })
    .select('id')
    .single();

  if (pedidoError) throw new Error(pedidoError.message);

  const detalleRows = items.map((item) => ({
    pedido_id: pedido.id,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    notas: item.notas || null,
    estado: 'pendiente'
  }));

  const { error: detailError } = await supabase.from('detalles_pedido').insert(detalleRows);
  if (detailError) throw new Error(detailError.message);

  const { error: mesaUpdateError } = await supabase
    .from('mesas')
    .update({ estado: 'ocupada', fecha_ocupacion: new Date().toISOString() })
    .eq('id', mesaId);

  if (mesaUpdateError) throw new Error(mesaUpdateError.message);

  return { pedidoId: pedido.id, mesaNumero: mesa.numero };
}

export async function getOpenPedidoForMesaData(mesaId: number) {
  const supabase = requireSupabase();
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('id, mesa_id, estado')
    .eq('mesa_id', mesaId)
    .eq('estado', 'abierto')
    .order('fecha_creacion', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pedidoError) throw new Error(pedidoError.message);
  if (!pedido) return null;

  const { data: detalles, error: detallesError } = await supabase
    .from('detalles_pedido')
    .select('id, pedido_id, producto_id, cantidad, precio_unitario, notas, estado, productos(nombre)')
    .eq('pedido_id', pedido.id)
    .order('id', { ascending: true });

  if (detallesError) throw new Error(detallesError.message);

  const mappedDetails = (detalles || []).map((detail: any) => ({
    ...detail,
    nombre: one(detail.productos)?.nombre || 'Producto',
    precio_unitario: asNumber(detail.precio_unitario)
  }));

  return {
    pedidoId: pedido.id,
    detalles: mappedDetails,
    subtotal: mappedDetails.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0)
  };
}

export async function getPedidoFacturaData(pedidoId: number) {
  const supabase = requireSupabase();
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('id, mesa_id, mesas(numero)')
    .eq('id', pedidoId)
    .single();

  if (pedidoError) throw new Error(pedidoError.message);

  const { data: detalles, error: detallesError } = await supabase
    .from('detalles_pedido')
    .select('id, pedido_id, producto_id, cantidad, precio_unitario, notas, estado, productos(nombre)')
    .eq('pedido_id', pedidoId)
    .order('id', { ascending: true });

  if (detallesError) throw new Error(detallesError.message);

  return {
    pedido: {
      ...pedido,
      mesa_numero: one((pedido as any).mesas)?.numero ?? null
    },
    detalles: (detalles || []).map((detail: any) => ({
      ...detail,
      nombre: one(detail.productos)?.nombre || 'Producto',
      precio_unitario: asNumber(detail.precio_unitario)
    }))
  };
}

export async function createFacturaAndClosePedidoData(pedidoId: number, total: number, metodoPago: string, numeroDian: string, cufe: string) {
  const supabase = requireSupabase();

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('mesa_id')
    .eq('id', pedidoId)
    .single();

  if (pedidoError) throw new Error(pedidoError.message);

  const { error: facturaError } = await supabase.from('facturas').insert({
    pedido_id: pedidoId,
    numero_dian: numeroDian,
    total,
    metodo_pago: metodoPago,
    estado_dian: 'enviado',
    cufe
  });

  if (facturaError) throw new Error(facturaError.message);

  const { error: pedidoUpdateError } = await supabase.from('pedidos').update({ estado: 'pagado' }).eq('id', pedidoId);
  if (pedidoUpdateError) throw new Error(pedidoUpdateError.message);

  if (pedido.mesa_id) {
    const { error: mesaUpdateError } = await supabase
      .from('mesas')
      .update({ estado: 'disponible', fecha_ocupacion: null })
      .eq('id', pedido.mesa_id);
    if (mesaUpdateError) throw new Error(mesaUpdateError.message);
  }
}

export async function getKDSPedidosData() {
  const supabase = requireSupabase();
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('id, fecha_creacion, mesa_id, mesero_id, mesas(numero), meseros(nombre)')
    .eq('estado', 'abierto')
    .order('fecha_creacion', { ascending: true });

  if (pedidosError) throw new Error(pedidosError.message);

  const pedidoIds = (pedidos || []).map((pedido) => pedido.id);
  if (pedidoIds.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from('detalles_pedido')
    .select('id, pedido_id, cantidad, notas, estado, productos(nombre)')
    .in('pedido_id', pedidoIds)
    .order('id', { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  return (pedidos || []).map((pedido: any) => ({
    id: pedido.id,
    fecha_creacion: pedido.fecha_creacion,
    mesa_numero: one(pedido.mesas)?.numero,
    mesero_nombre: one(pedido.meseros)?.nombre,
    items: (items || [])
      .filter((item: any) => item.pedido_id === pedido.id)
      .map((item: any) => ({
        ...item,
        nombre: one(item.productos)?.nombre || 'Producto'
      })),
    minutos: Math.floor((Date.now() - new Date(pedido.fecha_creacion).getTime()) / 60000)
  }));
}

export async function updateDetalleEstadoData(detalleId: number, estado: 'pendiente' | 'cocinando' | 'servido') {
  const supabase = requireSupabase();
  const { error } = await supabase.from('detalles_pedido').update({ estado }).eq('id', detalleId);
  if (error) throw new Error(error.message);
}

export async function getMeseroOrdenStatusData(meseroId: number) {
  const supabase = requireSupabase();
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('id, fecha_creacion, mesa_id, mesas(numero)')
    .eq('mesero_id', meseroId)
    .eq('estado', 'abierto')
    .order('fecha_creacion', { ascending: true });

  if (pedidosError) throw new Error(pedidosError.message);

  const pedidoIds = (pedidos || []).map((pedido) => pedido.id);
  if (pedidoIds.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from('detalles_pedido')
    .select('id, pedido_id, cantidad, estado, notas, productos(nombre)')
    .in('pedido_id', pedidoIds)
    .order('id', { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  return (pedidos || []).flatMap((pedido: any) =>
    (items || [])
      .filter((item: any) => item.pedido_id === pedido.id)
      .map((item: any) => ({
        pedido_id: pedido.id,
        mesa_numero: one(pedido.mesas)?.numero,
        fecha_creacion: pedido.fecha_creacion,
        detalle_id: item.id,
        cantidad: item.cantidad,
        item_estado: item.estado,
        notas: item.notas,
        producto_nombre: one(item.productos)?.nombre || 'Producto'
      }))
  );
}

export async function getCajaEstadoData() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('caja')
    .select('*')
    .eq('estado', 'abierta')
    .order('fecha_apertura', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function abrirCajaData(monto: number, meseroId: number | null) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('caja')
    .insert({ monto_apertura: monto, mesero_id_apertura: meseroId, estado: 'abierta' })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id;
}

export async function cerrarCajaData(id: number, montoReal: number) {
  const supabase = requireSupabase();
  const { data: caja, error: cajaError } = await supabase
    .from('caja')
    .select('fecha_apertura')
    .eq('id', id)
    .single();

  if (cajaError) throw new Error(cajaError.message);

  const { data: facturas, error: facturasError } = await supabase
    .from('facturas')
    .select('total, fecha_emision')
    .gte('fecha_emision', caja.fecha_apertura);

  if (facturasError) throw new Error(facturasError.message);

  const totalEsperado = (facturas || []).reduce((sum, factura: any) => sum + asNumber(factura.total), 0);
  const { error } = await supabase
    .from('caja')
    .update({
      fecha_cierre: new Date().toISOString(),
      monto_cierre: montoReal,
      ventas_esperadas: totalEsperado,
      estado: 'cerrada'
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getPublicMenuData(mesaId: number) {
  const supabase = requireSupabase();
  const { data: mesa, error: mesaError } = await supabase
    .from('mesas')
    .select('*')
    .eq('id', mesaId)
    .maybeSingle();

  if (mesaError) throw new Error(mesaError.message);
  if (!mesa) return null;

  const productos = await getProductosData({ onlyAvailable: true });
  const categorias = await getCategoriasData();

  return { mesa, productos, categorias };
}

export async function getCombosData() {
  const supabase = requireSupabase();
  const { data: combos, error: combosError } = await supabase
    .from('combos')
    .select('*')
    .eq('activo', 1)
    .order('id', { ascending: true });

  if (combosError) throw new Error(combosError.message);

  const comboIds = (combos || []).map((combo) => combo.id);
  if (comboIds.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from('combo_items')
    .select('combo_id, cantidad, producto_id, productos(id, nombre, precio, categoria_id)')
    .in('combo_id', comboIds);

  if (itemsError) throw new Error(itemsError.message);

  return (combos || []).map((combo) => ({
    ...combo,
    precio_especial: asNumber((combo as any).precio_especial),
    items: (items || [])
      .filter((item: any) => item.combo_id === combo.id)
      .map((item: any) => ({
        combo_id: item.combo_id,
        cantidad: item.cantidad,
        producto_id: item.producto_id,
        nombre: one(item.productos)?.nombre || 'Producto',
        precio: asNumber(one(item.productos)?.precio),
        categoria_id: one(item.productos)?.categoria_id || null
      }))
  }));
}

export async function addComboData(nombre: string, descripcion: string, items: { producto_id: number; cantidad: number }[], precioEspecial?: number) {
  const supabase = requireSupabase();
  const { data: combo, error: comboError } = await supabase
    .from('combos')
    .insert({ nombre, descripcion, precio_especial: precioEspecial || null, activo: 1 })
    .select('id')
    .single();

  if (comboError) throw new Error(comboError.message);

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('combo_items').insert(
      items.map((item) => ({
        combo_id: combo.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad
      }))
    );

    if (itemsError) throw new Error(itemsError.message);
  }

  return combo.id;
}

export async function deleteComboData(id: number) {
  const supabase = requireSupabase();
  const { error: itemsError } = await supabase.from('combo_items').delete().eq('combo_id', id);
  if (itemsError) throw new Error(itemsError.message);

  const { error } = await supabase.from('combos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}