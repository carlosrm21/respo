'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializa MercadoPago con el token de acceso
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function createPaymentPreference() {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error('El token de MercadoPago no está configurado en las variables de entorno.');
  }

  try {
    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'plan_anual',
            title: 'Suscripción Plan Anual RestoPOS',
            quantity: 1,
            unit_price: 850000,
            currency_id: 'COP',
            description: 'Acceso a todas las características del sistema RestoPOS por 1 año',
          },
        ],
        back_urls: {
          success: `${baseUrl}/pos?payment=success`,
          failure: `${baseUrl}/#pricing?payment=failure`,
          pending: `${baseUrl}/#pricing?payment=pending`,
        },
        auto_return: 'approved',
        statement_descriptor: 'RESTOPOS',
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
