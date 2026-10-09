import { MercadoPagoConfig, Payment } from 'mercadopago';
import fs from 'fs';

// Load .env.local
if (fs.existsSync('.env.local')) {
  const envConfig = fs.readFileSync('.env.local', 'utf-8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  });
}

console.log('Testing Mercado Pago with Access Token:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Token loaded (Length: ' + process.env.MERCADOPAGO_ACCESS_TOKEN.length + ')' : 'NO TOKEN FOUND');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 10000
  }
});

async function runTest() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  try {
    console.log('1. Verificando dados da conta vinculada ao Token via /users/me...');
    const meRes = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const meData = await meRes.json();
    console.log('Status /users/me:', meRes.status);
    console.log('User ID:', meData.id);
    console.log('Nickname:', meData.nickname);
    console.log('Email:', meData.email);
    console.log('User Type:', meData.user_type);
    console.log('Tags:', meData.tags);
    console.log('Site ID:', meData.site_id);

    console.log('\n2. Testando criação de PIX com comprador diferente (test buyer)...');
    const body = {
      transaction_amount: 10.00,
      description: 'Ingresso Teste - Eliade 15 Anos',
      payment_method_id: 'pix',
      payer: {
        email: 'test_user_9988776655@testuser.com',
        first_name: 'Comprador',
        last_name: 'Teste'
      }
    };

    const payRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': 'test-' + Date.now()
      },
      body: JSON.stringify(body)
    });

    const payData = await payRes.json();
    console.log('Status /v1/payments:', payRes.status);
    console.log('Resposta Pagamento:', JSON.stringify(payData, null, 2));

  } catch (err) {
    console.error('Erro:', err);
  }
}

runTest();

runTest();
