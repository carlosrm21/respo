import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { activatePaidLicense } from '@/lib/license';
import { upsertRestaurantSettings } from '@/lib/opsData';
import { isSupabaseConfigured } from '@/lib/supabaseAdmin';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase no configurado.' }, { status: 500 });
    }

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
            await upsertRestaurantSettings({
              restaurant_name: metadata.restaurant_name ? String(metadata.restaurant_name) : '',
              nit: metadata.nit ? String(metadata.nit) : '',
              contact_email: metadata.contact_email ? String(metadata.contact_email) : '',
              contact_phone: metadata.contact_phone ? String(metadata.contact_phone) : ''
            });
            console.log('Información del restaurante almacenada desde MercadoPago.');
          }

          await activatePaidLicense(String(id));

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
