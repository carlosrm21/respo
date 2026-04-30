import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

type Period = 'hoy' | 'semana' | 'mes' | 'año';

type ReservaInput = {
  nombre: string;
  telefono?: string;
  fecha: string;
  hora: string;
  personas: number;
  mesa_id?: number;
  notas?: string;
};

const INVENTARIO_SEED = [
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
  ['Servilletas (paquete)', 'Empaques', 'paquete', 20, 5, 2500, 'Distribuidora Ancla']
] as const;

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado para backoffice.');
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

function toDateOnly(dateLike: string) {
  return new Date(dateLike).toISOString().slice(0, 10);
}

function dateRangeForPeriod(period: Period) {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  if (period === 'hoy') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'semana') {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'mes') {
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  } else {
    start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
  }

  return {
    fromIso: start.toISOString(),
    toIso: end.toISOString()
  };
}

async function fetchFacturasInRange(period: Period) {
  const supabase = requireSupabase();
  const range = dateRangeForPeriod(period);

  const { data, error } = await supabase
    .from('facturas')
    .select('id, total, metodo_pago, fecha_emision, numero_dian, descuento, descuento_tipo, pedido_id')
    .gte('fecha_emision', range.fromIso)
    .lte('fecha_emision', range.toIso)
    .order('fecha_emision', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

async function fetchPedidosByIds(ids: number[]) {
  if (ids.length === 0) return [];

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('pedidos')
    .select('id, mesa_id, mesero_id, fecha_creacion, minutos_servicio')
    .in('id', ids);

  if (error) throw new Error(error.message);
  return data || [];
}

async function fetchDetallesByPedidoIds(ids: number[]) {
  if (ids.length === 0) return [];

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('detalles_pedido')
    .select('id, pedido_id, producto_id, cantidad, precio_unitario, productos(nombre, costo)')
    .in('pedido_id', ids);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getInventarioData() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('inventario')
    .select('*')
    .order('categoria', { ascending: true })
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function addInventarioData(payload: {
  nombre: string;
  categoria: string;
  unidad: string;
  cantidad: number;
  cantidad_minima: number;
  costo_unitario: number;
  proveedor?: string;
}) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('inventario')
    .insert({ ...payload, proveedor: payload.proveedor || null })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id;
}

export async function updateInventarioData(id: number, payload: Record<string, unknown>) {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('inventario')
    .update({ ...payload, fecha_actualizacion: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteInventarioData(id: number) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('inventario').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adjustInventarioCantidadData(id: number, delta: number) {
  const supabase = requireSupabase();
  const { data: current, error: currentError } = await supabase
    .from('inventario')
    .select('cantidad')
    .eq('id', id)
    .single();

  if (currentError) throw new Error(currentError.message);

  const newValue = Math.max(0, asNumber(current.cantidad) + delta);
  const { error } = await supabase
    .from('inventario')
    .update({ cantidad: newValue, fecha_actualizacion: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function seedInventarioData() {
  const supabase = requireSupabase();
  const { count, error: countError } = await supabase
    .from('inventario')
    .select('*', { count: 'exact', head: true });

  if (countError) throw new Error(countError.message);

  if ((count || 0) > 0) {
    return { alreadySeeded: true, count: count || 0, inserted: 0 };
  }

  const rows = INVENTARIO_SEED.map((item) => ({
    nombre: item[0],
    categoria: item[1],
    unidad: item[2],
    cantidad: item[3],
    cantidad_minima: item[4],
    costo_unitario: item[5],
    proveedor: item[6]
  }));

  const { error } = await supabase.from('inventario').insert(rows);
  if (error) throw new Error(error.message);

  return { alreadySeeded: false, count: rows.length, inserted: rows.length };
}

export async function getReservasData(fecha?: string) {
  const supabase = requireSupabase();
  let query = supabase
    .from('reservas')
    .select('*, mesas(numero)')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: true })
    .limit(100);

  if (fecha) {
    query = supabase
      .from('reservas')
      .select('*, mesas(numero)')
      .eq('fecha', fecha)
      .order('hora', { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    ...row,
    mesa_numero: one(row.mesas)?.numero || null
  }));
}

export async function addReservaData(input: ReservaInput) {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from('reservas')
    .insert({
      nombre: input.nombre,
      telefono: input.telefono || null,
      fecha: input.fecha,
      hora: input.hora,
      personas: input.personas,
      mesa_id: input.mesa_id || null,
      notas: input.notas || null,
      estado: 'pendiente'
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  if (input.mesa_id) {
    const { error: mesaError } = await supabase
      .from('mesas')
      .update({ estado: 'reservada' })
      .eq('id', input.mesa_id);

    if (mesaError) throw new Error(mesaError.message);
  }

  return data?.id;
}

export async function updateReservaEstadoData(id: number, estado: string) {
  const supabase = requireSupabase();

  const { data: reserva, error: reservaError } = await supabase
    .from('reservas')
    .select('mesa_id')
    .eq('id', id)
    .single();

  if (reservaError) throw new Error(reservaError.message);

  const { error } = await supabase.from('reservas').update({ estado }).eq('id', id);
  if (error) throw new Error(error.message);

  if ((estado === 'cancelada' || estado === 'completada') && reserva.mesa_id) {
    const { error: mesaError } = await supabase
      .from('mesas')
      .update({ estado: 'disponible' })
      .eq('id', reserva.mesa_id)
      .eq('estado', 'reservada');

    if (mesaError) throw new Error(mesaError.message);
  }
}

export async function deleteReservaData(id: number) {
  const supabase = requireSupabase();

  const { data: reserva, error: reservaError } = await supabase
    .from('reservas')
    .select('mesa_id')
    .eq('id', id)
    .maybeSingle();

  if (reservaError) throw new Error(reservaError.message);

  const { error } = await supabase.from('reservas').delete().eq('id', id);
  if (error) throw new Error(error.message);

  if (reserva?.mesa_id) {
    const { error: mesaError } = await supabase
      .from('mesas')
      .update({ estado: 'disponible' })
      .eq('id', reserva.mesa_id)
      .eq('estado', 'reservada');

    if (mesaError) throw new Error(mesaError.message);
  }
}

export async function getMesasBasicData() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('mesas')
    .select('id, numero, capacidad, estado')
    .order('numero', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getTurnosData(fecha?: string) {
  const supabase = requireSupabase();
  let query = supabase
    .from('turnos')
    .select('*, meseros(nombre)')
    .order('fecha', { ascending: false })
    .order('hora_entrada', { ascending: true })
    .limit(100);

  if (fecha) {
    query = supabase
      .from('turnos')
      .select('*, meseros(nombre)')
      .eq('fecha', fecha)
      .order('hora_entrada', { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    ...row,
    mesero_nombre: one(row.meseros)?.nombre || 'Mesero'
  }));
}

export async function iniciarTurnoData(meseroId: number, notas?: string) {
  const supabase = requireSupabase();
  const fechaHoy = new Date().toISOString().slice(0, 10);
  const horaAhora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const { data: existing, error: existingError } = await supabase
    .from('turnos')
    .select('id')
    .eq('mesero_id', meseroId)
    .eq('fecha', fechaHoy)
    .eq('estado', 'activo')
    .limit(1)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing) throw new Error('Ya tiene un turno activo hoy');

  const { data, error } = await supabase
    .from('turnos')
    .insert({
      mesero_id: meseroId,
      fecha: fechaHoy,
      hora_entrada: horaAhora,
      notas: notas || null,
      estado: 'activo'
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data?.id;
}

export async function terminarTurnoData(turnoId: number) {
  const supabase = requireSupabase();
  const horaAhora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const { error } = await supabase
    .from('turnos')
    .update({ hora_salida: horaAhora, estado: 'terminado' })
    .eq('id', turnoId);

  if (error) throw new Error(error.message);
}

export async function getTurnoResumenData() {
  const supabase = requireSupabase();
  const hoy = new Date().toISOString().slice(0, 10);

  const { data: turnos, error: turnosError } = await supabase
    .from('turnos')
    .select('id, estado, fecha')
    .eq('fecha', hoy);

  if (turnosError) throw new Error(turnosError.message);

  const { data: meseros, error: meserosError } = await supabase
    .from('meseros')
    .select('id, nombre')
    .eq('activo', 1)
    .order('nombre', { ascending: true });

  if (meserosError) throw new Error(meserosError.message);

  const activos = (turnos || []).filter((row) => row.estado === 'activo').length;
  const terminados = (turnos || []).filter((row) => row.estado === 'terminado').length;

  return {
    activos,
    terminados,
    meseros: meseros || []
  };
}

export async function getHistorialFacturasData(filters?: {
  fechaDesde?: string;
  fechaHasta?: string;
  meseroId?: number;
  metodo?: string;
}) {
  const supabase = requireSupabase();

  let facturasQuery = supabase
    .from('facturas')
    .select('id, total, metodo_pago, fecha_emision, numero_dian, descuento, descuento_tipo, pedido_id')
    .order('fecha_emision', { ascending: false })
    .limit(200);

  if (filters?.fechaDesde) {
    facturasQuery = facturasQuery.gte('fecha_emision', `${filters.fechaDesde}T00:00:00.000Z`);
  }
  if (filters?.fechaHasta) {
    facturasQuery = facturasQuery.lte('fecha_emision', `${filters.fechaHasta}T23:59:59.999Z`);
  }
  if (filters?.metodo) {
    facturasQuery = facturasQuery.eq('metodo_pago', filters.metodo);
  }

  const { data: facturas, error: facturasError } = await facturasQuery;
  if (facturasError) throw new Error(facturasError.message);

  const pedidoIds = Array.from(new Set((facturas || []).map((f) => f.pedido_id).filter(Boolean))) as number[];
  const pedidos = await fetchPedidosByIds(pedidoIds);
  const pedidosMap = new Map(pedidos.map((pedido) => [pedido.id, pedido]));

  const mesasIds = Array.from(new Set(pedidos.map((p) => p.mesa_id).filter(Boolean))) as number[];
  const meserosIds = Array.from(new Set(pedidos.map((p) => p.mesero_id).filter(Boolean))) as number[];

  const { data: mesas, error: mesasError } = mesasIds.length
    ? await supabase.from('mesas').select('id, numero').in('id', mesasIds)
    : { data: [], error: null as any };
  if (mesasError) throw new Error(mesasError.message);

  const { data: meseros, error: meserosError } = meserosIds.length
    ? await supabase.from('meseros').select('id, nombre').in('id', meserosIds)
    : { data: [], error: null as any };
  if (meserosError) throw new Error(meserosError.message);

  const mesasMap = new Map((mesas || []).map((mesa) => [mesa.id, mesa.numero]));
  const meserosMap = new Map((meseros || []).map((mesero) => [mesero.id, mesero.nombre]));

  const detalles = await fetchDetallesByPedidoIds(pedidoIds);
  const detallesPorPedido = new Map<number, string[]>();

  for (const detalle of detalles as any[]) {
    const items = detallesPorPedido.get(detalle.pedido_id) || [];
    items.push(`${one(detalle.productos)?.nombre || 'Producto'} x${detalle.cantidad}`);
    detallesPorPedido.set(detalle.pedido_id, items);
  }

  const result = (facturas || []).filter((factura) => {
    if (!filters?.meseroId) return true;
    const pedido = pedidosMap.get(factura.pedido_id);
    return pedido?.mesero_id === filters.meseroId;
  }).map((factura) => {
    const pedido = pedidosMap.get(factura.pedido_id);
    return {
      id: factura.id,
      total: asNumber(factura.total),
      metodo_pago: factura.metodo_pago,
      fecha_emision: factura.fecha_emision,
      numero_dian: factura.numero_dian,
      descuento: asNumber(factura.descuento),
      descuento_tipo: factura.descuento_tipo,
      mesa_numero: pedido?.mesa_id ? mesasMap.get(pedido.mesa_id) : null,
      mesero_nombre: pedido?.mesero_id ? meserosMap.get(pedido.mesero_id) : null,
      items: (detallesPorPedido.get(factura.pedido_id) || []).join(' | ')
    };
  });

  return result;
}

export async function getResumenHistorialData() {
  const hoyRows = await fetchFacturasInRange('hoy');
  const semanaRows = await fetchFacturasInRange('semana');
  const mesRows = await fetchFacturasInRange('mes');

  const resumen = (rows: any[]) => ({
    total: rows.reduce((sum, row) => sum + asNumber(row.total), 0),
    facturas: rows.length
  });

  return {
    hoy: resumen(hoyRows),
    semana: resumen(semanaRows),
    mes: resumen(mesRows)
  };
}

export async function getMeserosForFilterData() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('meseros')
    .select('id, nombre')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getResumenPeriodoData(period: Period) {
  const facturas = await fetchFacturasInRange(period);
  const totalVentas = facturas.reduce((sum, row) => sum + asNumber(row.total), 0);
  const totalFacturas = facturas.length;
  const ticketPromedio = totalFacturas > 0 ? totalVentas / totalFacturas : 0;

  const pedidoIds = Array.from(new Set(facturas.map((f) => f.pedido_id).filter(Boolean))) as number[];
  const pedidos = await fetchPedidosByIds(pedidoIds);
  const mesasAtendidas = new Set(pedidos.map((pedido) => pedido.mesa_id).filter(Boolean)).size;

  return {
    total_ventas: totalVentas,
    total_facturas: totalFacturas,
    ticket_promedio: ticketPromedio,
    mesas_atendidas: mesasAtendidas
  };
}

export async function getVentasDiariasData() {
  const supabase = requireSupabase();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('facturas')
    .select('id, total, fecha_emision')
    .gte('fecha_emision', from.toISOString())
    .order('fecha_emision', { ascending: true });

  if (error) throw new Error(error.message);

  const grouped = new Map<string, { total: number; facturas: number }>();
  for (const row of data || []) {
    const dia = toDateOnly(row.fecha_emision);
    const current = grouped.get(dia) || { total: 0, facturas: 0 };
    current.total += asNumber(row.total);
    current.facturas += 1;
    grouped.set(dia, current);
  }

  return Array.from(grouped.entries()).map(([dia, values]) => ({
    dia,
    total: values.total,
    facturas: values.facturas
  }));
}

export async function getVentasMeseroPeriodoData(period: Period) {
  const supabase = requireSupabase();
  const [meseros, facturas] = await Promise.all([
    supabase.from('meseros').select('id, nombre, activo').order('nombre', { ascending: true }),
    fetchFacturasInRange(period)
  ]);

  if (meseros.error) throw new Error(meseros.error.message);

  const pedidoIds = Array.from(new Set(facturas.map((f) => f.pedido_id).filter(Boolean))) as number[];
  const pedidos = await fetchPedidosByIds(pedidoIds);
  const pedidosMap = new Map(pedidos.map((pedido) => [pedido.id, pedido]));

  const aggregate = new Map<number, {
    total_ventas: number;
    pedidos: Set<number>;
    tickets: number[];
    dias: Set<string>;
  }>();

  for (const factura of facturas) {
    const pedido = pedidosMap.get(factura.pedido_id);
    if (!pedido?.mesero_id) continue;

    const current = aggregate.get(pedido.mesero_id) || {
      total_ventas: 0,
      pedidos: new Set<number>(),
      tickets: [],
      dias: new Set<string>()
    };

    current.total_ventas += asNumber(factura.total);
    current.pedidos.add(pedido.id);
    current.tickets.push(asNumber(factura.total));
    if (pedido.fecha_creacion) current.dias.add(toDateOnly(pedido.fecha_creacion));

    aggregate.set(pedido.mesero_id, current);
  }

  return (meseros.data || []).map((mesero) => {
    const values = aggregate.get(mesero.id);
    const totalVentas = values?.total_ventas || 0;
    const tickets = values?.tickets || [];

    return {
      id: mesero.id,
      nombre: mesero.nombre,
      activo: mesero.activo,
      total_ventas: totalVentas,
      num_pedidos: values?.pedidos.size || 0,
      ticket_promedio: tickets.length ? tickets.reduce((sum, value) => sum + value, 0) / tickets.length : 0,
      dias_trabajados: values?.dias.size || 0
    };
  }).sort((a, b) => b.total_ventas - a.total_ventas);
}

export async function getAlertasMeserosData() {
  const supabase = requireSupabase();
  const { data: meseros, error: meserosError } = await supabase
    .from('meseros')
    .select('id, nombre')
    .eq('activo', 1)
    .order('nombre', { ascending: true });

  if (meserosError) throw new Error(meserosError.message);

  const [hoyFacturas, semanaFacturas] = await Promise.all([
    fetchFacturasInRange('hoy'),
    fetchFacturasInRange('semana')
  ]);

  const hoyPedidos = await fetchPedidosByIds(Array.from(new Set(hoyFacturas.map((f) => f.pedido_id).filter(Boolean))) as number[]);
  const semanaPedidos = await fetchPedidosByIds(Array.from(new Set(semanaFacturas.map((f) => f.pedido_id).filter(Boolean))) as number[]);

  const hoySet = new Set(hoyPedidos.map((pedido) => pedido.mesero_id).filter(Boolean));
  const semanaSet = new Set(semanaPedidos.map((pedido) => pedido.mesero_id).filter(Boolean));

  const sinVentasHoy = (meseros || []).filter((mesero) => !hoySet.has(mesero.id));
  const sinVentasSemana = (meseros || []).filter((mesero) => !semanaSet.has(mesero.id));

  return { sinVentasHoy, sinVentasSemana };
}

export async function getTopProductosPeriodoData(period: Period) {
  const facturas = await fetchFacturasInRange(period);
  const pedidoIds = Array.from(new Set(facturas.map((f) => f.pedido_id).filter(Boolean))) as number[];
  const detalles = await fetchDetallesByPedidoIds(pedidoIds);

  const aggregate = new Map<number, {
    nombre: string;
    cantidad_vendida: number;
    ingresos: number;
    margen: number;
    utilidad: number;
  }>();

  for (const detail of detalles as any[]) {
    const product = one(detail.productos);
    const productId = detail.producto_id;
    const qty = asNumber(detail.cantidad);
    const ingreso = qty * asNumber(detail.precio_unitario);
    const costo = qty * asNumber(product?.costo);
    const utilidad = ingreso - costo;

    const current = aggregate.get(productId) || {
      nombre: product?.nombre || 'Producto',
      cantidad_vendida: 0,
      ingresos: 0,
      margen: 0,
      utilidad: 0
    };

    current.cantidad_vendida += qty;
    current.ingresos += ingreso;
    current.margen += utilidad;
    current.utilidad += utilidad;

    aggregate.set(productId, current);
  }

  return Array.from(aggregate.values())
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 8);
}

export async function getPLReportData(periodo: Period) {
  const ingresosRows = await fetchFacturasInRange(periodo);
  const ingresos = ingresosRows.reduce((sum, row) => sum + asNumber(row.total), 0);
  const facturas = ingresosRows.length;

  const pedidoIds = Array.from(new Set(ingresosRows.map((f) => f.pedido_id).filter(Boolean))) as number[];
  const pedidos = await fetchPedidosByIds(pedidoIds);
  const detalles = await fetchDetallesByPedidoIds(pedidoIds);

  const costos = (detalles as any[]).reduce((sum, detail) => {
    const costoProducto = asNumber(one(detail.productos)?.costo);
    return sum + asNumber(detail.cantidad) * costoProducto;
  }, 0);

  const topMap = new Map<number, {
    nombre: string;
    qty: number;
    ingresos: number;
    costos: number;
    utilidad: number;
  }>();

  for (const detail of detalles as any[]) {
    const productId = detail.producto_id;
    const product = one(detail.productos);
    const qty = asNumber(detail.cantidad);
    const ingreso = qty * asNumber(detail.precio_unitario);
    const costo = qty * asNumber(product?.costo);

    const current = topMap.get(productId) || {
      nombre: product?.nombre || 'Producto',
      qty: 0,
      ingresos: 0,
      costos: 0,
      utilidad: 0
    };

    current.qty += qty;
    current.ingresos += ingreso;
    current.costos += costo;
    current.utilidad += ingreso - costo;

    topMap.set(productId, current);
  }

  const topProductos = Array.from(topMap.values())
    .sort((a, b) => b.utilidad - a.utilidad)
    .slice(0, 5);

  const avgServicioRows = pedidos
    .map((pedido) => asNumber(pedido.minutos_servicio))
    .filter((value) => value > 0);

  const avgServicio = avgServicioRows.length
    ? avgServicioRows.reduce((sum, value) => sum + value, 0) / avgServicioRows.length
    : null;

  const previousPeriodRows = await fetchFacturasInRange(
    periodo === 'hoy' ? 'hoy' : periodo === 'semana' ? 'semana' : periodo === 'mes' ? 'mes' : 'año'
  );

  let ingresosAnterior = 0;
  if (periodo === 'hoy') {
    const supabase = requireSupabase();
    const now = new Date();
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    const from = new Date(y); from.setHours(0, 0, 0, 0);
    const to = new Date(y); to.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('facturas')
      .select('total, fecha_emision')
      .gte('fecha_emision', from.toISOString())
      .lte('fecha_emision', to.toISOString());

    if (error) throw new Error(error.message);
    ingresosAnterior = (data || []).reduce((sum, row) => sum + asNumber(row.total), 0);
  } else {
    ingresosAnterior = previousPeriodRows.reduce((sum, row) => sum + asNumber(row.total), 0);
  }

  const margenBruto = ingresos - costos;
  const margenPct = ingresos > 0 ? (margenBruto / ingresos) * 100 : 0;
  const cambio = ingresosAnterior > 0 ? ((ingresos - ingresosAnterior) / ingresosAnterior) * 100 : null;

  return {
    ingresos,
    facturas,
    costos,
    margenBruto,
    margenPct,
    cambio,
    ingresosAnterior,
    topProductos,
    avgServicioMinutos: avgServicio
  };
}

export async function getComparativaSemanalData() {
  const supabase = requireSupabase();
  const from = new Date();
  from.setDate(from.getDate() - 13);
  from.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('facturas')
    .select('total, fecha_emision')
    .gte('fecha_emision', from.toISOString())
    .order('fecha_emision', { ascending: true });

  if (error) throw new Error(error.message);

  const grouped = new Map<string, { total: number; facturas: number }>();
  for (const row of data || []) {
    const dia = toDateOnly(row.fecha_emision);
    const current = grouped.get(dia) || { total: 0, facturas: 0 };
    current.total += asNumber(row.total);
    current.facturas += 1;
    grouped.set(dia, current);
  }

  return Array.from(grouped.entries()).map(([dia, values]) => ({
    dia,
    total: values.total,
    facturas: values.facturas
  }));
}

export async function addAuditLogData(usuario: string, accion: string, entidad?: string, detalle?: string) {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('audit_log')
    .insert({
      usuario,
      accion,
      entidad: entidad || null,
      detalle: detalle || null
    });

  if (error) throw new Error(error.message);
}

export async function getAuditLogData(limit = 100) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createDeliveryOrderData(payload: {
  restaurante_id: string;
  plataforma: string;
  external_id: string | null;
  cliente_nombre: string;
  cliente_direccion: string;
  items_json: string;
  total: number;
  notas: string | null;
}) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('pedidos_delivery').insert(payload);
  if (error) throw new Error(error.message);
}

export async function listDeliveryOrdersData(restaurante_id: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('pedidos_delivery')
    .select('*')
    .eq('restaurante_id', restaurante_id)
    .order('fecha_creacion', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateDeliveryOrderEstadoData(id: number, estado: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('pedidos_delivery').update({ estado }).eq('id', id);
  if (error) throw new Error(error.message);
}
