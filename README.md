# 💎 FinanZen - Aplicativo de Gestão Financeira Pessoal & Familiar (SaaS / PWA)

Aplicativo completo de controle financeiro pronto para comercialização (venda de acessos/assinaturas) com autenticação segura individual e instalação no celular (PWA).

---

## 🚀 Como Rodar o Projeto

1. Abra a pasta no terminal:
   ```bash
   cd "c:\Users\adam\Documents\FinancasApp"
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor local:
   ```bash
   npm run dev
   ```

O aplicativo abrirá no endereço local `http://localhost:5174`.

---

## 🔒 Como Conectar ao Supabase (Segurança e Isolamento Total)

Para que cada cliente que comprar tenha sua própria conta com isolamento total dos dados:

1. Acesse seu painel no [Supabase](https://supabase.com).
2. Crie um novo projeto (ex: `finanzen-app`).
3. No menu lateral, clique em **SQL Editor** -> **New Query**.
4. Copie todo o conteúdo do arquivo [`supabase_schema_saas.sql`](./supabase_schema_saas.sql) e clique em **Run**.
   - Esse script cria as tabelas de perfis, assinaturas, lançamentos e habilita o **RLS (Row Level Security)**, garantindo que ninguém veja os dados dos outros.
5. No Supabase, vá em **Project Settings** -> **API** e copie:
   - **Project URL**
   - **anon / public key**
6. Crie um arquivo `.env` na raiz desta pasta com o seguinte formato:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

*Nota: O app já vem com modo de demonstração ativado caso você queira testá-lo imediatamente antes de configurar o Supabase.*

---

## 💰 Como Vender o Acesso aos Clientes

Você pode vender esse aplicativo de duas formas:

1. **Acesso Vitalício (Pagamento Único via PIX / Kiwify / Hotmart):**
   - Exemplo: R$ 47,00 ou R$ 97,00.
   - O cliente compra, cria a conta no app e você altera o status dele para `lifetime` na tabela `profiles` do Supabase com um clique.

2. **Assinatura Mensal (Kiwify / Hotmart / Asaas):**
   - Exemplo: R$ 14,90 / mês.
   - O app já vem configurado com **7 dias de teste grátis (trial)** automáticos para todo novo usuário cadastrado!
   - Quando o período acaba, o app exibe o banner de liberação de acesso.

---

## 📱 Como os Clientes Instalam no Celular (PWA)

O aplicativo foi desenvolvido como **Progressive Web App (PWA)**:
- **No iPhone:** O cliente abre o link no Safari, clica no botão de compartilhamento e escolhe **"Adicionar à Tela de Início"**.
- **No Android:** Ao abrir no Chrome, clica em **"Instalar Aplicativo"** no botão do topo ou no menu do navegador.
- O app funciona em tela cheia como se tivesse sido baixado da App Store / Play Store!

---

## 🌐 Publicação na Internet (Vercel)

1. Suba o projeto para o GitHub.
2. Acesse [vercel.com](https://vercel.com) e importe o repositório.
3. Adicione as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Clique em **Deploy**! O link público estará pronto para você divulgar e vender.
