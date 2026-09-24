# 🎵 Grupo Musical Eliade - Sistema de Ingressos & Celebração de 15 Anos

Sistema completo e moderno para venda e emissão de ingressos comemorativos com pagamento via PIX automatizado/manual, geração de ingressos digitais com QR Code único e aplicativo validador de portaria.

---

## 📁 Organização do Projeto

```text
d:/PROJETOS/Eliade/
├── .gitignore              # Proteção global de credenciais e arquivos de build
├── README.md               # Documentação principal do projeto
├── planejamento.md         # Plano arquitetural e de negócios
└── web/                    # Aplicação Next.js (Frontend + Backend API Routes)
    ├── .env.example        # Modelo documentado de variáveis de ambiente
    ├── .env.local          # Configurações locais de desenvolvimento
    ├── .gitignore          # Proteção local da aplicação
    ├── jsconfig.json       # Aliases de importação (@/*)
    ├── package.json        # Dependências do projeto
    ├── public/
    │   └── images/         # Banners e fotografias em alta resolução
    └── src/
        ├── app/
        │   ├── layout.js   # Layout raiz e metadados SEO
        │   ├── page.js     # Landing Page principal com contagem regressiva
        │   ├── globals.css # Design System em Vanilla CSS (tema Gala / Ouro)
        │   ├── api/
        │   │   ├── checkout/route.js    # Criação de pedidos e payload PIX
        │   │   ├── orders/[id]/route.js # Consulta e confirmação de pagamento
        │   │   ├── tickets/[id]/route.js # Consulta de ingresso individual
        │   │   └── tickets/scan/route.js # Validação de portaria com QR Code
        │   ├── ingresso/[id]/page.js    # Página de visualização do ingresso VIP
        │   └── admin/scanner/page.js    # Leitor de QR Code para equipe de portaria
        ├── components/
        │   ├── Header.js           # Barra de navegação
        │   ├── Countdown.js        # Contagem regressiva ao vivo
        │   ├── EventDetails.js     # Detalhes do evento e brindes
        │   ├── TicketSelection.js  # Seletor dinâmico de ingressos por participante
        │   ├── CheckoutModal.js    # Modal de pagamento PIX e liberação
        │   └── Footer.js           # Rodapé institucional
        ├── lib/
        │   ├── pix.js      # Gerador oficial de código PIX EMV (BR Code)
        │   ├── supabase.js # Conexão com banco de dados PostgreSQL
        │   └── storage.js  # Camada de persistência unificada (Supabase + Fallback)
        └── sql/
            └── schema.sql  # Script de criação de tabelas e políticas RLS
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Instalar Dependências
Entre na pasta `web`:
```bash
cd web
npm install
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no navegador: **[http://localhost:3000](http://localhost:3000)**.

---

## 🔒 Segurança e Boas Práticas (Git Ready)

- ✅ **Proteção de Credenciais**: Todos os arquivos `.env` e `.env*.local` estão ignorados pelo `.gitignore`. Nunca suba chaves secretas para o repositório.
- ✅ **JavaScript Puro**: Frontend e Backend construídos inteiramente em JavaScript moderno (ESModules) com Next.js App Router.
- ✅ **Modo Fallback & Offline**: O sistema funciona imediatamente em ambiente local com simulação de pagamento mesmo antes de configurar chaves do Supabase.

---

## 🎫 Rotas da Aplicação

* **`/`** - Landing Page principal com história dos 15 anos, atrações, brindes e checkout PIX.
* **`/ingresso/[id]`** - Exibição do ingresso oficial com QR Code para o participante salvar ou imprimir.
* **`/admin/scanner`** - Painel da portaria para escanear os QR Codes dos convidados na entrada do evento (Senha padrão: `eliade15anos`).
