'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializa MercadoPago con el token de acceso
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function createPaymentPreference(
  planId: 'Pro' | 'Pro-plus' | 'Enterprise' = 'Pro-plus',
  formData?: { restaurantName: string; nit: string; email: string; phone: string }
) {
  if (!process.env.MP_ACCESS_TOKEN) {
    console.error('El token de MercadoPago no está configurado en las variables de entorno.');
    return {
      success: false,
      error: 'El token de MercadoPago no está configurado en las variables de entorno.',
    };
  }

  // Configuración de precios según el plan
  const plans = {
    'Pro': { price: 49900, title: 'Suscripción Plan Pro RestoPOS' },
    'Pro-plus': { price: 89900, title: 'Suscripción Plan Pro-plus RestoPOS' },
    'Enterprise': { price: 149900, title: 'Suscripción Plan Enterprise RestoPOS' },
  };

  const selectedPlan = plans[planId] || plans['Pro-plus'];

  try {
    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const result = await preference.create({
      body: {
        items: [
          {
            id: planId.toLowerCase(),
            title: selectedPlan.title,
            quantity: 1,
            unit_price: selectedPlan.price,
            currency_id: 'COP',
            description: `Acceso mensual al ${selectedPlan.title}`,
          },
        ],
        back_urls: {
          success: `${baseUrl}/pos?payment=success`,
          failure: `${baseUrl}/#pricing?payment=failure`,
          pending: `${baseUrl}/#pricing?payment=pending`,
        },
        auto_return: 'approved',
        statement_descriptor: 'RESTOPOS',
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        metadata: {
          plan_id: planId,
          ...(formData ? {
            restaurant_name: formData.restaurantName,
            nit: formData.nit,
            contact_email: formData.email,
            contact_phone: formData.phone
          } : {})
        },
      },
    });

    return {
      success: true,
      initPoint: result.init_point,
    };
  } catch (error) {
    console.error('Error al crear preferencia de MercadoPago:', error);
    return {
      success: false,
      error: 'Hubo un error al generar el enlace de pago',
    };
  }
}
