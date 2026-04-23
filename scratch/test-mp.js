// Removed dotenv
const { MercadoPagoConfig, Preference } = require('mercadopago');

async function testPayment() {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || '',
    });
    
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'pro-plus',
            title: 'Test Plan',
            quantity: 1,
            unit_price: 89900,
            currency_id: 'COP',
          },
        ],
        metadata: { plan_id: 'Pro-plus', nit: '123456789' }
      }
    });
    
    if (result.init_point) {
      console.log('✅ EXITO: Preferencia de Mercado Pago creada correctamente.');
      console.log('URL de Pago:', result.init_point);
    } else {
      console.log('❌ FALLO: No se generó init_point', result);
    }
  } catch (err) {
    console.error('❌ FALLO en la API de Mercado Pago:', err.message);
  }
}

testPayment();
