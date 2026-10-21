# Gerenciador Financeiro

Aplicação web para controle financeiro pessoal e de freelancers. A primeira entrega cobre o esquema PostgreSQL para Supabase, com autenticação, isolamento por usuário (RLS), cartões, categorias, transações, compras parceladas e orçamentos.

## Stack definida

- Frontend: Next.js + TypeScript + Tailwind CSS
- Dados e autenticação: Supabase (PostgreSQL + Supabase Auth)
- Hospedagem: Vercel + Supabase

## Primeiro passo: banco de dados

1. Crie um projeto no [Supabase](https://supabase.com/dashboard).
2. Abra o **SQL Editor** e execute, nesta ordem, `supabase/migrations/20260909000000_initial_schema.sql` e `supabase_setup.sql`.
3. Em **Authentication > Providers**, habilite Email.
4. Cadastre um usuário de teste; o gatilho criará seu perfil automaticamente.

O schema usa `auth.users` do Supabase em vez de uma tabela de senhas própria. Isto mantém o hash, recuperação de senha e sessões sob responsabilidade do serviço de autenticação. Compras após o fechamento entram automaticamente na competência da fatura seguinte; cada parcela é gravada como uma transação.

## Próxima entrega

Criar a aplicação Next.js com as telas de autenticação, dashboard e CRUD de categorias, cartões e transações, conectada ao Supabase.
