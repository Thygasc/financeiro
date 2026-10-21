# 📋 Guia Completo: Iniciar Projeto no Vercel e Supabase

## ✅ Pré-requisitos

Antes de começar, você precisa ter:
- Conta no [GitHub](https://github.com)
- Conta no [Supabase](https://supabase.com/dashboard)
- Conta no [Vercel](https://vercel.com)
- Node.js v18+ instalado localmente ([download](https://nodejs.org))
- Git instalado e configurado

---

## 🔧 PARTE 1: Configurar Supabase (Banco de Dados)

### Passo 1.1: Criar Projeto no Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"** (ou **"Novo Projeto"**)
3. Preencha:
   - **Database Password:** Crie uma senha forte (salve em local seguro!)
   - **Region:** Escolha a mais próxima (ex: `sa-east-1` para São Paulo)
   - **Project Name:** Ex: `projeto-financeiro`
4. Clique em **"Create new project"**
5. Aguarde a criação (pode levar alguns minutos)

### Passo 1.2: Coletar Credenciais do Supabase

Após criar o projeto, vá para:
1. **Settings** → **API** (no menu lateral)
2. Copie e salve em um arquivo seguro:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** (key)
   - **service_role** (key) - Guarde este com segurança!

### Passo 1.3: Executar Schema do Banco de Dados

1. No Supabase, vá para **SQL Editor** (no menu lateral)
2. Clique em **"New Query"**
3. Copie e cole o conteúdo do arquivo: `supabase/migrations/20260909000000_initial_schema.sql`
4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Repita o processo com o conteúdo de `supabase_setup.sql`

**Resultado esperado:** Sem erros na execução.

### Passo 1.4: Habilitar Autenticação por Email

1. No Supabase, vá para **Authentication** → **Providers** (no menu lateral)
2. Localize **Email**
3. Certifique-se que está **habilitado** (ícone azul)
4. Configure o template de e-mail se necessário

### Passo 1.5: Criar Usuário de Teste (Opcional)

1. No Supabase, vá para **Authentication** → **Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha:
   - **Email:** ex: `teste@example.com`
   - **Password:** Crie uma senha
4. Clique em **"Create user"**

O trigger automático criará o perfil do usuário.

---

## 🚀 PARTE 2: Configurar Projeto Local e Variáveis de Ambiente

### Passo 2.1: Criar Arquivo `.env.local`

Na raiz da pasta `app/`, crie um arquivo chamado `.env.local`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
SUPABASE_SECRET_KEY=eyJxxx...
SUPABASE_JWKS_URL=https://xxxxx.supabase.co/auth/v1/jwks
```

**Substitua os valores com as informações que o Supabase forneceu:**
- `SUPABASE_URL`: Project URL (ou `SUPABASE_URL` que você recebeu)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `SUPABASE_PUBLISHABLE_KEY` que você recebeu
- `SUPABASE_SECRET_KEY`: `SUPABASE_SECRET_KEY` que você recebeu
- `SUPABASE_JWKS_URL`: `SUPABASE_JWKS_URL` que você recebeu

### Passo 2.2: Instalar Dependências Localmente

No terminal, navegue até a pasta `app/` e execute:

```bash
cd app
npm install
```

### Passo 2.3: Testar Localmente

Ainda na pasta `app/`, execute:

```bash
npm run dev
```

Acesse: **http://localhost:3000**

Você deve ver a página inicial do Next.js. Se funcionar ✅, prossiga para o próximo passo.

**Para parar o servidor:** Pressione `Ctrl+C` no terminal.

---

## 📦 PARTE 3: Deploy no Vercel

### Passo 3.1: Preparar Repositório no GitHub

1. Abra o terminal na pasta raiz do projeto
2. Confirme que já é um repositório Git:
   ```bash
   git status
   ```
   Se receber erro, execute:
   ```bash
   git init
   git add .
   git commit -m "Inicial: setup Supabase e Next.js"
   ```

3. Crie um repositório no GitHub:
   - Acesse [GitHub New Repository](https://github.com/new)
   - Nome: `projeto-financeiro`
   - **NÃO inicialize com README, .gitignore ou licença** (use os existentes)
   - Clique em **"Create repository"**

4. Conecte seu repositório local ao GitHub:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/projeto-financeiro.git
   git branch -M main
   git push -u origin main
   ```

### Passo 3.2: Conectar Vercel ao GitHub

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Clique em **"Import Git Repository"**
4. Procure e selecione o repositório `projeto-financeiro`
5. Clique em **"Import"**

### Passo 3.3: Configurar Variáveis de Ambiente no Vercel

Na tela de configuração do projeto:

1. Vá para **Environment Variables**
2. Adicione as mesmas variáveis do `.env.local`:
   - `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_JWKS_URL`

3. Certifique-se de que estão marcadas para os ambientes corretos (**Production**, **Preview**, **Development**)

### Passo 3.4: Deploy

1. Clique em **"Deploy"**
2. Aguarde a conclusão (cerca de 2-3 minutos)
3. Você receberá uma URL como: `https://projeto-financeiro.vercel.app`

**Resultado:** Sua aplicação está ao vivo! 🎉

---

## 🧪 PARTE 4: Testar a Aplicação

### Teste 1: Acesso ao Deploy
1. Acesse a URL do Vercel fornecida
2. Verifique se carrega sem erros

### Teste 2: Conexão com Banco de Dados
1. Se implementou tela de autenticação, tente:
   - Fazer login com o usuário de teste criado em 1.5
   - Confirme que aparece dashboard ou tela de dados

### Teste 3: Consultar Dados Diretamente (Supabase)
1. No Supabase, vá para **SQL Editor**
2. Execute uma query para verificar dados:
   ```sql
   SELECT * FROM public.usuarios LIMIT 10;
   ```

---

## 📝 Checklist Completo

- [ ] Projeto Supabase criado com sucesso
- [ ] Schema do banco de dados executado (sem erros)
- [ ] Autenticação por Email habilitada no Supabase
- [ ] Arquivo `.env.local` criado com credenciais corretas
- [ ] Dependências instaladas (`npm install`)
- [ ] Aplicação roda localmente (`npm run dev`)
- [ ] Repositório enviado para GitHub
- [ ] Projeto conectado ao Vercel
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy concluído com sucesso
- [ ] URL do Vercel acessível e funcionando
- [ ] Banco de dados respondendo corretamente

---

## 🆘 Troubleshooting

### Erro: "Cannot connect to database"
- ✅ Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretos
- ✅ Confirme que o Supabase project está online

### Erro: "Environment variables not found"
- ✅ Verifique se as variáveis foram adicionadas no Vercel → Project Settings → Environment Variables
- ✅ Redeploy: Vá para Deployments → clique nos 3 pontinhos → "Redeploy"

### Build falha no Vercel
- ✅ Verifique logs: Vercel → Deployments → clique no deploy → "Build & Output logs"
- ✅ Teste localmente com `npm run build` antes de fazer push

### Usuário de teste não consegue fazer login
- ✅ Verifique se o usuário foi criado no Supabase (Authentication → Users)
- ✅ Confirme que Email Authentication está habilitado
- ✅ Verifique se a senha está correta

---

## 📚 Documentos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação do Projeto](./documentacao_controle_financeiro.md)

---

## 🎯 Próximos Passos Após Deploy

Após confirmar que tudo está funcionando:

1. **Conectar Frontend ao Supabase:** Criar cliente Supabase no Next.js
2. **Implementar Autenticação:** Login e registro com Supabase Auth
3. **Criar CRUD de Categorias/Cartões:** Interfaces e endpoints
4. **Montar Dashboard:** Gráficos e resumos financeiros
5. **Testar Transações:** Criar, atualizar e listar lançamentos

---

**Data de criação:** 2025-10-20  
**Versão:** 1.0
