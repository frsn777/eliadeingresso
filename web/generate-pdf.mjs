import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function generatePresentationPDF() {
  console.log('Iniciando captura das telas do site...');
  
  const outputDir = path.resolve('../fotos_previa');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Criar pedido e ingresso de teste
  console.log('Gerando dados de exemplo para o ingresso...');
  const checkoutRes = await fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Mariana Souza',
      customerEmail: 'mariana.souza@email.com',
      attendees: ['Mariana Souza (Convidada de Honra)']
    })
  });
  const checkoutData = await checkoutRes.json();
  const sampleTicketId = checkoutData.tickets[0].id;

  // 2. Capturar Landing Page Desktop
  console.log('Capturando 1. Landing Page Desktop...');
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  const desktopImgPath = path.join(outputDir, '1_landing_page_computador.jpg');
  await page.screenshot({ path: desktopImgPath, fullPage: true, type: 'jpeg', quality: 90 });

  // 3. Capturar Landing Page Mobile
  console.log('Capturando 2. Landing Page Mobile...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  const mobileImgPath = path.join(outputDir, '2_landing_page_celular.jpg');
  await page.screenshot({ path: mobileImgPath, fullPage: true, type: 'jpeg', quality: 90 });

  // 4. Capturar Ingresso VIP
  console.log('Capturando 3. Ingresso VIP...');
  await page.setViewport({ width: 680, height: 950, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:3000/ingresso/${sampleTicketId}`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  const ticketImgPath = path.join(outputDir, '3_ingresso_digital_vip.jpg');
  await page.screenshot({ path: ticketImgPath, fullPage: true, type: 'jpeg', quality: 90 });

  // 5. Capturar Portaria Scanner
  console.log('Capturando 4. Scanner Portaria...');
  await page.setViewport({ width: 420, height: 800, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://localhost:3000/admin/scanner', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  const scannerImgPath = path.join(outputDir, '4_validador_portaria_celular.jpg');
  await page.screenshot({ path: scannerImgPath, fullPage: true, type: 'jpeg', quality: 90 });

  // Converte as imagens salvas para base64 limpas
  const desktopBase64 = `data:image/jpeg;base64,${fs.readFileSync(desktopImgPath).toString('base64')}`;
  const mobileBase64 = `data:image/jpeg;base64,${fs.readFileSync(mobileImgPath).toString('base64')}`;
  const ticketBase64 = `data:image/jpeg;base64,${fs.readFileSync(ticketImgPath).toString('base64')}`;
  const scannerBase64 = `data:image/jpeg;base64,${fs.readFileSync(scannerImgPath).toString('base64')}`;

  console.log('Montando documento de apresentação...');
  const presentationHtml = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>Apresentação do Site - Grupo Musical Eliade 15 Anos</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #07080c;
        color: #f3f4f6;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .page {
        padding: 40px;
        page-break-after: always;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justifyContent: flex-start;
      }
      
      .header {
        border-bottom: 2px solid #d4af37;
        padding-bottom: 12px;
        margin-bottom: 16px;
        display: flex;
        justifyContent: space-between;
        align-items: center;
      }
      
      .title {
        font-size: 22px;
        color: #f6e27a;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
      
      .badge {
        background: rgba(212, 175, 55, 0.2);
        border: 1px solid #d4af37;
        color: #f6e27a;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .description {
        font-size: 13px;
        color: #9ca3af;
        line-height: 1.5;
        margin-bottom: 16px;
      }

      .img-card {
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.8);
        background: #11131a;
      }
      
      .img-full {
        width: 100%;
        display: block;
      }

      .grid-two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        align-items: start;
      }

      .footer-note {
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px solid rgba(255,255,255,0.1);
        font-size: 11px;
        color: #6b7280;
        text-align: center;
      }
    </style>
  </head>
  <body>

    <!-- PÁGINA 1: CAPA & VISÃO GERAL -->
    <div class="page" style="justify-content: center; text-align: center; background: radial-gradient(circle at center, #181d2c 0%, #07080c 100%);">
      <div style="max-width: 600px; margin: 0 auto;">
        <div class="badge" style="display: inline-block; margin-bottom: 20px;">Prévia do Projeto &bull; Alinhamento com a Equipe</div>
        <h1 style="font-size: 34px; color: #f6e27a; margin-bottom: 14px; line-height: 1.2; font-weight: 900;">
          GRUPO MUSICAL ELIADE<br>
          <span style="font-size: 22px; color: #fff; font-weight: 400;">Celebração de 15 Anos</span>
        </h1>
        <p style="font-size: 15px; color: #9ca3af; line-height: 1.6; margin-bottom: 30px;">
          Apresentação visual da proposta do site oficial para venda de ingressos comemorativos, emissão de convites digitais com QR Code e aplicativo de portaria.
        </p>
        
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 20px; text-align: left;">
          <h3 style="color: #f6e27a; font-size: 14px; margin-bottom: 10px; text-transform: uppercase;">Conteúdo desta Apresentação:</h3>
          <ul style="color: #d1d5db; font-size: 13px; line-height: 1.8; padding-left: 18px;">
            <li><strong>Página 2:</strong> Visão Geral da Landing Page no Computador (Desktop)</li>
            <li><strong>Página 3:</strong> Visualização Responsiva no Celular (Mobile)</li>
            <li><strong>Página 4:</strong> Ingresso VIP com QR Code & Validador de Portaria</li>
          </ul>
        </div>
      </div>
      <div class="footer-note">Grupo Musical Eliade &copy; 2026 &bull; Material para alinhamento interno</div>
    </div>

    <!-- PÁGINA 2: LANDING PAGE DESKTOP -->
    <div class="page">
      <div class="header">
        <div class="title">1. Landing Page Principal (Desktop)</div>
        <div class="badge">Visualização Completa</div>
      </div>
      <p class="description">
        Layout de gala com tema em tons de azul marinho e bege, contagem regressiva em tempo real para o evento e formulário de compra via PIX para confraternização do grupo.
      </p>
      <div class="img-card">
        <img src="${desktopBase64}" class="img-full" alt="Landing Page Desktop">
      </div>
      <div class="footer-note">Página 2 de 4 &bull; Grupo Eliade 15 Anos</div>
    </div>

    <!-- PÁGINA 3: EXPERIÊNCIA MOBILE -->
    <div class="page">
      <div class="header">
        <div class="title">2. Experiência no Celular (Mobile)</div>
        <div class="badge">100% Responsivo</div>
      </div>
      <p class="description">
        Como o público verá o site no celular ao receber o link pelo WhatsApp ou redes sociais. Interface fluida com botões acessíveis e seletor rápido de participantes.
      </p>
      <div style="display: flex; justify-content: center;">
        <div class="img-card" style="max-width: 440px;">
          <img src="${mobileBase64}" class="img-full" alt="Landing Page Mobile">
        </div>
      </div>
      <div class="footer-note">Página 3 de 4 &bull; Grupo Eliade 15 Anos</div>
    </div>

    <!-- PÁGINA 4: INGRESSO DIGITAL & PORTARIA -->
    <div class="page">
      <div class="header">
        <div class="title">3. Ingresso VIP com QR Code & Portaria</div>
        <div class="badge">Controle de Entrada</div>
      </div>
      <p class="description">
        <strong>À esquerda:</strong> O ingresso nominal que cada convidado recebe após o PIX.<br>
        <strong>À direita:</strong> O aplicativo validador da portaria que a equipe usará no celular para ler os ingressos na entrada.
      </p>
      
      <div class="grid-two">
        <div>
          <div style="font-weight: 700; color: #f6e27a; margin-bottom: 8px; font-size: 13px;">🎫 Ingresso do Participante</div>
          <div class="img-card">
            <img src="${ticketBase64}" class="img-full" alt="Ingresso VIP">
          </div>
        </div>

        <div>
          <div style="font-weight: 700; color: #f6e27a; margin-bottom: 8px; font-size: 13px;">📱 Leitor da Portaria (Android)</div>
          <div class="img-card">
            <img src="${scannerBase64}" class="img-full" alt="Validador Portaria">
          </div>
        </div>
      </div>
      <div class="footer-note">Página 4 de 4 &bull; Grupo Eliade 15 Anos</div>
    </div>

  </body>
  </html>
  `;

  const htmlDocPath = path.resolve('../Apresentacao_Site_Grupo_Eliade.html');
  fs.writeFileSync(htmlDocPath, presentationHtml);

  console.log('Renderizando PDF a partir do HTML diagramado...');
  const renderPage = await browser.newPage();
  await renderPage.goto(`file://${htmlDocPath}`, { waitUntil: 'load' });

  const pdfPath = path.resolve('../Apresentacao_Site_Grupo_Eliade.pdf');
  await renderPage.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
  });

  await browser.close();
  console.log(`✅ PDF gerado com sucesso em: ${pdfPath}`);
}

generatePresentationPDF().catch(err => {
  console.error('Erro ao gerar PDF:', err);
  process.exit(1);
});
