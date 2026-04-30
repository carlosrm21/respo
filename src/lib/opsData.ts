import { cookies } from 'next/headers';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

export async function requireTenant() {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get('tenant_id')?.value;
  if (!tenantId) {
    throw new Error('TENANT_MISSING');
  }
  return tenantId;
}

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
  // Ignorado para Multi-Tenant, el seed real ocurrira de otra manera.
}

export async function getRestaurantSetting(key: string) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('configuracion_restaurante')
    .select('valor')
    .eq('restaurante_id', tenantId)
    .eq('clave', key)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.valor ?? null;
}

export async function upsertRestaurantSettings(entries: Record<string, string>) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const rows = Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([clave, valor]) => ({ restaurante_id: tenantId, clave, valor: String(valor) }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('configuracion_restaurante')
    .upsert(rows, { onConflict: 'restaurante_id, clave' });

  if (error) throw new Error(error.message);
}

export async function getLatestLicenseRow() {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('licencia_estado')
    .select('*')
    .eq('restaurante_id', tenantId)
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
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('licencia_estado')
    .insert({ restaurante_id: tenantId, ...payload })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getMesasData() {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('restaurante_id', tenantId)
    .order('numero', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateMesaData(id: number, payload: Record<string, unknown>) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { error } = await supabase.from('mesas').update(payload).eq('restaurante_id', tenantId).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getCategoriasData() {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('restaurante_id', tenantId)
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getProductosData(options?: { onlyAvailable?: boolean }) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  let query = supabase
    .from('productos')
    .select('id, nombre, precio, costo, descripcion, disponible, categoria_id, categorias(nombre)')
    .eq('restaurante_id', tenantId)
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
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('productos')
    .insert({ restaurante_id: tenantId, ...payload, disponible: 1 })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id;
}

export async function updateProductoData(id: number, payload: Record<string, unknown>) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { error } = await supabase.from('productos').update(payload).eq('restaurante_id', tenantId).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProductoData(id: number) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { error } = await supabase.from('productos').delete().eq('restaurante_id', tenantId).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addCategoriaData(nombre: string) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('categorias').insert({ restaurante_id: tenantId, nombre }).select('id').single();
  if (error) throw new Error(error.message);
  return data?.id;
}

export async function createPedidoData(mesaId: number, meseroId: number | null, items: OrderItemInput[]) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();

  const { data: mesa, error: mesaError } = await supabase
    .from('mesas')
    .select('id, numero')
    .eq('restaurante_id', tenantId)
    .eq('id', mesaId)
    .single();

  if (mesaError) throw new Error(mesaError.message);

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({ restaurante_id: tenantId, mesa_id: mesaId, mesero_id: meseroId, estado: 'abierto' })
    .select('id')
    .single();

  if (pedidoError) throw new Error(pedidoError.message);

  const detalleRows = items.map((item) => ({
    restaurante_id: tenantId,
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
    .eq('restaurante_id', tenantId)
    .eq('id', mesaId);

  if (mesaUpdateError) throw new Error(mesaUpdateError.message);

  return { pedidoId: pedido.id, mesaNumero: mesa.numero };
}

export async function getOpenPedidoForMesaData(mesaId: number) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('id, mesa_id, estado')
    .eq('restaurante_id', tenantId)
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
    .eq('restaurante_id', tenantId)
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
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('id, mesa_id, mesas(numero)')
    .eq('restaurante_id', tenantId)
    .eq('id', pedidoId)
    .single();

  if (pedidoError) throw new Error(pedidoError.message);

  const { data: detalles, error: detallesError } = await supabase
    .from('detalles_pedido')
    .select('id, pedido_id, producto_id, cantidad, precio_unitario, notas, estado, productos(nombre)')
    .eq('restaurante_id', tenantId)
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
  const tenantId = await requireTenant();
  const supabase = requireSupabase();

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('mesa_id')
    .eq('restaurante_id', tenantId)
    .eq('id', pedidoId)
    .single();

  if (pedidoError) throw new Error(pedidoError.message);

  const { error: facturaError } = await supabase.from('facturas').insert({
    restaurante_id: tenantId,
    pedido_id: pedidoId,
    numero_dian: numeroDian,
    total,
    metodo_pago: metodoPago,
    estado_dian: 'enviado',
    cufe
  });

  if (facturaError) throw new Error(facturaError.message);

  const { error: pedidoUpdateError } = await supabase.from('pedidos').update({ estado: 'pagado' }).eq('restaurante_id', tenantId).eq('id', pedidoId);
  if (pedidoUpdateError) throw new Error(pedidoUpdateError.message);

  if (pedido.mesa_id) {
    const { error: mesaUpdateError } = await supabase
      .from('mesas')
      .update({ estado: 'disponible', fecha_ocupacion: null })
      .eq('restaurante_id', tenantId)
      .eq('id', pedido.mesa_id);
    if (mesaUpdateError) throw new Error(mesaUpdateError.message);
  }
}

export async function getKDSPedidosData() {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('id, fecha_creacion, mesa_id, mesero_id, mesas(numero), meseros(nombre)')
    .eq('restaurante_id', tenantId)
    .eq('estado', 'abierto')
    .order('fecha_creacion', { ascending: true });

  if (pedidosError) throw new Error(pedidosError.message);

  const pedidoIds = (pedidos || []).map((pedido) => pedido.id);
  if (pedidoIds.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from('detalles_pedido')
    .select('id, pedido_id, cantidad, notas, estado, productos(nombre)')
    .eq('restaurante_id', tenantId)
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
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { error } = await supabase.from('detalles_pedido').update({ estado }).eq('restaurante_id', tenantId).eq('id', detalleId);
  if (error) throw new Error(error.message);
}

export async function getMeseroOrdenStatusData(meseroId: number) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('id, fecha_creacion, mesa_id, mesas(numero)')
    .eq('restaurante_id', tenantId)
    .eq('mesero_id', meseroId)
    .eq('estado', 'abierto')
    .order('fecha_creacion', { ascending: true });

  if (pedidosError) throw new Error(pedidosError.message);

  const pedidoIds = (pedidos || []).map((pedido) => pedido.id);
  if (pedidoIds.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from('detalles_pedido')
    .select('id, pedido_id, cantidad, estado, notas, productos(nombre)')
    .eq('restaurante_id', tenantId)
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
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('caja')
    .select('*')
    .eq('restaurante_id', tenantId)
    .eq('estado', 'abierta')
    .order('fecha_apertura', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function abrirCajaData(monto: number, meseroId: number | null) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('caja')
    .insert({ restaurante_id: tenantId, monto_apertura: monto, mesero_id_apertura: meseroId, estado: 'abierta' })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id;
}

export async function cerrarCajaData(id: number, montoReal: number) {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data: caja, error: cajaError } = await supabase
    .from('caja')
    .select('fecha_apertura')
    .eq('restaurante_id', tenantId)
    .eq('id', id)
    .single();

  if (cajaError) throw new Error(cajaError.message);

  const { data: facturas, error: facturasError } = await supabase
    .from('facturas')
    .select('total, fecha_emision')
    .eq('restaurante_id', tenantId)
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
    .eq('restaurante_id', tenantId)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getPublicMenuData(mesaId: number) {
  const supabase = requireSupabase();
  
  const { data: mesa, error: mesaError } = await supabase
    .from('mesas')
    .select('*, restaurantes(nombre)')
    .eq('id', mesaId)
    .maybeSingle();

  if (mesaError) throw new Error(mesaError.message);
  if (!mesa) return null;

  const tenantId = mesa.restaurante_id;

  const { data: productosData } = await supabase
    .from('productos')
    .select('id, nombre, precio, descripcion, categoria_id, categorias(nombre)')
    .eq('restaurante_id', tenantId)
    .eq('disponible', 1)
    .order('nombre', { ascending: true });

  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .eq('restaurante_id', tenantId)
    .order('nombre', { ascending: true });

  const productos = (productosData || []).map((product: any) => ({
    ...product,
    precio: asNumber(product.precio),
    categoria_nombre: one(product.categorias)?.nombre || null
  }));

  return { 
    mesa: { ...mesa, restaurante_nombre: one(mesa.restaurantes)?.nombre || 'Restaurante' }, 
    productos, 
    categorias: categorias || []
  };
}

export async function getCombosData() {
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data: combos, error: combosError } = await supabase
    .from('combos')
    .select('*')
    .eq('restaurante_id', tenantId)
    .eq('activo', 1)
    .order('id', { ascending: true });

  if (combosError) throw new Error(combosError.message);

  const comboIds = (combos || []).map((combo) => combo.id);
  if (comboIds.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from('combo_items')
    .select('combo_id, cantidad, producto_id, productos(id, nombre, precio, categoria_id)')
    .eq('restaurante_id', tenantId)
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
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { data: combo, error: comboError } = await supabase
    .from('combos')
    .insert({ restaurante_id: tenantId, nombre, descripcion, precio_especial: precioEspecial || null, activo: 1 })
    .select('id')
    .single();

  if (comboError) throw new Error(comboError.message);

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('combo_items').insert(
      items.map((item) => ({
        restaurante_id: tenantId,
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
  const tenantId = await requireTenant();
  const supabase = requireSupabase();
  const { error: itemsError } = await supabase.from('combo_items').delete().eq('restaurante_id', tenantId).eq('combo_id', id);
  if (itemsError) throw new Error(itemsError.message);

  const { error } = await supabase.from('combos').delete().eq('restaurante_id', tenantId).eq('id', id);
  if (error) throw new Error(error.message);
}