import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import db from '@/lib/db';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(request: Request) {
  try {
    // MercadoPago puede enviar el ID por query params o por el body en formato JSON
    const url = new URL(request.url);
    
    let id = url.searchParams.get('data.id') || url.searchParams.get('id');
    let type = url.searchParams.get('type') || url.searchParams.get('topic');

    // Intentar leer del body si no vienen en la URL
    if (!id) {
      try {
        const body = await request.json();
        if (body?.data?.id) id = body.data.id;
        if (body?.type) type = body.type;
        if (body?.topic) type = body.topic;
      } catch (e) {
        // El body no era JSON válido o estaba vacío
      }
    }

    if ((type === 'payment' || type === 'payment.created' || type === 'payment.updated') && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      if (paymentData.status === 'approved') {
        console.log(`Pago ${id} aprobado. Activando licencia anual para el sistema RestoPOS...`);
        
        try {
          // Leer la metadata almacenada en el intento de pago
          const metadata = paymentData.metadata;
          
          if (metadata) {
            await db.execute(`
              CREATE TABLE IF NOT EXISTS configuracion_restaurante (
                clave TEXT PRIMARY KEY,
                valor TEXT
              )
            `);
            
            const queries = [];
            if (metadata.restaurant_name) queries.push({ sql: `INSERT OR REPLACE INTO configuracion_restaurante (clave, valor) VALUES ('restaurant_name', ?)`, args: [String(metadata.restaurant_name)] });
            if (metadata.nit) queries.push({ sql: `INSERT OR REPLACE INTO configuracion_restaurante (clave, valor) VALUES ('nit', ?)`, args: [String(metadata.nit)] });
            if (metadata.contact_email) queries.push({ sql: `INSERT OR REPLACE INTO configuracion_restaurante (clave, valor) VALUES ('contact_email', ?)`, args: [String(metadata.contact_email)] });
            if (metadata.contact_phone) queries.push({ sql: `INSERT OR REPLACE INTO configuracion_restaurante (clave, valor) VALUES ('contact_phone', ?)`, args: [String(metadata.contact_phone)] });

            for (const q of queries) {
              await db.execute(q);
            }
            console.log('Información del restaurante almacenada desde MercadoPago.');
          }

          // Crear tabla de licencia si no existe
          await db.execute(`
            CREATE TABLE IF NOT EXISTS sistema_licencia (
              id INTEGER PRIMARY KEY,
              estado TEXT,
              expiracion TEXT,
              payment_id TEXT,
              fecha_activacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          // Registrar la licencia verificada y activada por 1 año
          await db.execute({
            sql: `INSERT INTO sistema_licencia (estado, expiracion, payment_id) VALUES (?, date('now', '+1 year'), ?)`,
            args: ['activa', String(id)]
          });

          console.log('Licencia almacenada en la base de datos automáticamente por el Webhook.');
        } catch (dbError) {
          console.error('Error al actualizar el estado de la DB:', dbError);
        }
      }
    }

    // Siempre responder con 200 OK rápidamente a MercadoPago
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook de MercadoPago:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
