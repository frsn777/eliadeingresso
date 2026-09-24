# Planejamento: Landing Page de Ingressos para Aniversário de 15 Anos

Este documento detalha a criação de um site moderno e premium para a venda de ingressos de R$ 10 para a celebração de 15 anos do seu grupo musical. O site contará com uma landing page atrativa, sistema de checkout PIX, envio de ingressos com QR Code e uma tela de validação para controle de entrada no evento.

---

## 1. Respostas às suas Dúvidas

### A. Pagamento via PIX: Como fazer?
Temos duas opções principais de implementação:
1. **PIX Automatizado (Recomendado)**: Integração com um gateway de pagamento gratuito (como o **Mercado Pago** ou **Asaas**). 
   - *Como funciona:* O comprador escolhe a quantidade de ingressos, preenche os dados (Nome, Email, Telefone) e clica em "Pagar". O site gera dinamicamente um QR Code Pix único e o código "Copia e Cola" com validade de alguns minutos. Assim que o pagamento é feito, o gateway avisa nosso site (via Webhook) que o pagamento foi aprovado, e o site envia automaticamente os ingressos por e-mail com QR Codes exclusivos.
   - *Custo:* Sem mensalidade. Apenas uma pequena taxa por transação aprovada (geralmente entre 0.99% e 1.99% do valor, ou seja, cerca de R$ 0,10 a R$ 0,20 por ingresso vendido).
2. **PIX Manual (Sem Taxas)**: Exibição de uma chave PIX estática (seu CPF, e-mail ou celular).
   - *Como funciona:* O cliente preenche os dados, faz a transferência pelo banco dele e faz o upload do comprovante de pagamento no site. O site salva o pedido como "Pendente". Você (ou um administrador) acessa um painel ou recebe por e-mail/WhatsApp, confere se o dinheiro caiu e clica em "Aprovar", disparando o ingresso.
   - *Custo:* R$ 0,00 de taxas. Porém, exige trabalho manual de conferência.

**Recomendação:** A automação via Mercado Pago ou Asaas vale muito a pena pelo baixo valor da taxa (menos de R$ 0,20 por ingresso) e pela comodidade de não precisar conferir extratos manualmente no dia do evento.

---

### B. Implicações Jurídicas e Impostos
Para um evento de pequeno porte/comemoração de aniversário (ex: 100 a 500 ingressos de R$ 10, totalizando R$ 1.000 a R$ 5.000 de arrecadação):
- **Pessoa Física (CPF)**: Receber transferências PIX na sua conta física é legal. Para a Receita Federal, rendimentos recebidos de outras pessoas físicas são isentos de Imposto de Renda se o total mensal ficar abaixo da faixa de isenção da tabela progressiva (atualmente R$ 2.824,00). 
- Se a arrecadação total do evento passar desse limite e for toda recebida em um único mês por uma única pessoa, tecnicamente deveria ser declarada no Carnê-Leão. No entanto, se o grupo for dividir os custos e as receitas entre os membros, o valor individual por pessoa será muito menor.
- **Pessoa Jurídica (CNPJ / MEI)**: Se algum integrante tiver um MEI (Microempreendedor Individual) com atividade de eventos ou produção musical, é o ideal. O dinheiro entra na conta do MEI e o imposto já está pago na taxa mensal fixa do MEI (DAS).

Se o valor total estimado arrecadado for menor que R$ 2.800,00, você pode receber no seu CPF sem preocupações com impostos adicionais. Se for maior, dividir o recebimento entre os membros do grupo ou usar o MEI de alguém é uma excelente alternativa.

---

### C. Preciso pagar por um domínio?
**Não é obrigatório.** 
- Você pode registrar um domínio personalizado (ex: `www.aniversariogrupo.com.br`) no Registro.br por R$ 40,00 por ano se quiser um visual mais profissional.
- Mas se preferir custo zero, podemos hospedar o site gratuitamente na plataforma **Vercel** ou **Netlify**, e o endereço será algo como `https://aniversario-grupo.vercel.app` (totalmente funcional, seguro com HTTPS e gratuito).

---

### D. Compra de múltiplos ingressos e Garantia de Acesso (Controle de Entrada)
Para garantir que somente quem comprou o ingresso entre, e permitir que uma pessoa compre para a família inteira:
1. **Carrinho / Quantidade**: O usuário seleciona a quantidade de ingressos (ex: 3 ingressos).
2. **Dados dos Participantes**: O sistema pedirá o Nome Completo de cada participante (ex: Ingresso 1: João Silva, Ingresso 2: Maria Silva, Ingresso 3: Pedro Silva).
3. **Geração de QR Codes Únicos**: No banco de dados, criaremos 3 registros diferentes. Cada registro terá um código identificador único (UUID).
4. **Envio dos Ingressos**: O comprador receberá um e-mail com os 3 ingressos em PDF/Imagem. Cada um terá o nome da pessoa e um QR Code específico correspondente ao seu identificador único.
5. **Validação na Portaria (Aplicativo de Scanner)**:
   - Criaremos uma página administrativa protegida por senha no próprio site (ex: `/admin/scanner`).
   - O pessoal da portaria abre essa página no celular. Ela usa a câmera do celular para ler o QR Code do ingresso impresso ou na tela do celular do participante.
   - O sistema consulta o banco de dados em tempo real:
     - **Se o ingresso for válido e não tiver sido usado:** O sistema mostra uma tela verde com o nome do participante ("Entrada Liberada: João Silva") e marca o ingresso como "UTILIZADO" no banco de dados.
     - **Se tentarem usar o mesmo QR Code novamente:** O sistema mostra uma tela vermelha ("ERRO: Ingresso já utilizado em 25/08/2026 às 19:30").
     - **Se o código for falso:** Tela vermelha ("ERRO: Ingresso inválido!").

---

## 2. Visão Geral da Arquitetura do Site

Propomos criar uma aplicação web moderna usando **Next.js (React)** e **Supabase** (banco de dados PostgreSQL gratuito e seguro).

---

## 3. Plano de Ação Passo a Passo

### Passo 1: Inicialização do Projeto e Design System
- Criar a estrutura do Next.js.
- Configurar variáveis de ambiente (`.env.local`).
- Definir o **Design System em CSS Vanilla** (cores premium: preto fosco, cinza escuro, dourado/bronze festivo, tipografia elegante como *Playfair Display* e *Inter*).

### Passo 2: Banco de Dados (Supabase)
- Configurar o banco de dados gratuito no Supabase.
- Criar tabela `orders` (Pedidos) e `tickets` (Ingressos individuais com UUID, nome do participante, status "pendente/pago", e status "utilizado" true/false).

### Passo 3: Criação da Landing Page (Interface do Usuário)
- **Header**: Logo do grupo e contagem regressiva para o show.
- **Sobre o Evento**: Detalhes da comemoração de 15 anos (data, local, horário, história do grupo).
- **Atrações/Repertório**: Fotos e amostra do que terá no evento.
- **Formulário de Compra**:
  - Seleção de quantidade.
  - Campos dinâmicos de nome/email para cada participante.
  - Botão de compra com micro-animação.

### Passo 4: Checkout e Integração com PIX
- Criar API route no Next.js para processar a intenção de compra.
- Gerar o pagamento PIX.
- Exibir modal de checkout com o QR Code e botão de "Copiar Código Pix".

### Passo 5: Geração de Ingressos, E-mail e QR Codes
- Implementar biblioteca de geração de QR Code (`qrcode`).
- Criar API route de Webhook que escuta o pagamento.
- Configurar envio de e-mail automático com os ingressos anexados/desenhados em HTML elegante.

### Passo 6: Scanner da Portaria (`/admin/scanner`)
- Criar página de administração protegida por senha simples.
- Integrar leitor de câmera (`html5-qrcode`) para ler os ingressos na entrada.
- Conectar a uma API route `/api/tickets/scan` que valida o ingresso e altera seu estado no Supabase para "utilizado".
