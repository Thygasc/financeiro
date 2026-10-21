-- Gerenciador Financeiro: esquema inicial para Supabase/PostgreSQL.
-- A identidade do usuário é fornecida por auth.users; não armazene senhas nesta base.

create extension if not exists pgcrypto;

create type public.tipo_transacao as enum ('RECEITA', 'DESPESA');
create type public.status_transacao as enum ('PAGO', 'PENDENTE');

create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome varchar(100) not null,
  criado_em timestamptz not null default now()
);

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  nome varchar(50) not null,
  tipo public.tipo_transacao not null,
  cor char(7),
  criado_em timestamptz not null default now(),
  constraint categorias_cor_hex check (cor is null or cor ~ '^#[0-9A-Fa-f]{6}$'),
  constraint categorias_nome_unico unique (usuario_id, nome, tipo)
);

create table public.cartoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  nome varchar(50) not null,
  limite numeric(12, 2) not null check (limite >= 0),
  dia_fechamento smallint not null check (dia_fechamento between 1 and 31),
  dia_vencimento smallint not null check (dia_vencimento between 1 and 31),
  criado_em timestamptz not null default now(),
  constraint cartoes_nome_unico unique (usuario_id, nome)
);

create table public.compras_parceladas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  cartao_id uuid not null references public.cartoes(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete set null,
  descricao varchar(255) not null check (length(trim(descricao)) > 0),
  valor_total numeric(12, 2) not null check (valor_total > 0),
  total_parcelas smallint not null check (total_parcelas between 2 and 360),
  data_compra date not null,
  criado_em timestamptz not null default now()
);

create table public.transacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete set null,
  cartao_id uuid references public.cartoes(id) on delete set null,
  compra_parcelada_id uuid references public.compras_parceladas(id) on delete cascade,
  valor numeric(12, 2) not null check (valor > 0),
  tipo public.tipo_transacao not null,
  descricao varchar(255) not null check (length(trim(descricao)) > 0),
  data date not null,
  status public.status_transacao not null default 'PENDENTE',
  numero_parcela smallint check (numero_parcela is null or numero_parcela > 0),
  criado_em timestamptz not null default now(),
  constraint transacao_parcela_coerente check (
    (compra_parcelada_id is null and numero_parcela is null)
    or (compra_parcelada_id is not null and numero_parcela is not null and tipo = 'DESPESA')
  ),
  constraint transacao_parcela_unica unique (compra_parcelada_id, numero_parcela)
);

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  valor_limite numeric(12, 2) not null check (valor_limite >= 0),
  mes smallint not null check (mes between 1 and 12),
  ano smallint not null check (ano between 2000 and 9999),
  criado_em timestamptz not null default now(),
  constraint orcamento_unico unique (usuario_id, categoria_id, mes, ano)
);

create index transacoes_usuario_data_idx on public.transacoes (usuario_id, data desc);
create index transacoes_usuario_categoria_data_idx on public.transacoes (usuario_id, categoria_id, data desc);
create index compras_parceladas_usuario_idx on public.compras_parceladas (usuario_id);
create index orcamentos_usuario_periodo_idx on public.orcamentos (usuario_id, ano, mes);

-- Cria o perfil imediatamente após um cadastro pelo Supabase Auth.
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute procedure public.criar_perfil();

-- Gera as parcelas, distribuindo os centavos restantes nas primeiras parcelas.
create or replace function public.gerar_parcelas()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  indice integer;
  valor_centavos bigint := round(new.valor_total * 100);
  valor_base_centavos bigint := valor_centavos / new.total_parcelas;
  resto_centavos bigint := valor_centavos % new.total_parcelas;
begin
  for indice in 1..new.total_parcelas loop
    insert into public.transacoes (
      usuario_id, categoria_id, cartao_id, compra_parcelada_id, valor, tipo,
      descricao, data, numero_parcela
    ) values (
      new.usuario_id, new.categoria_id, new.cartao_id, new.id,
      (valor_base_centavos + case when indice <= resto_centavos then 1 else 0 end) / 100.0,
      'DESPESA', new.descricao || ' (' || indice || '/' || new.total_parcelas || ')',
      (date_trunc('month', new.data_compra)::date + ((indice - 1) || ' months')::interval)::date,
      indice
    );
  end loop;
  return new;
end;
$$;

create trigger ao_criar_compra_parcelada
  after insert on public.compras_parceladas
  for each row execute procedure public.gerar_parcelas();

alter table public.perfis enable row level security;
alter table public.categorias enable row level security;
alter table public.cartoes enable row level security;
alter table public.compras_parceladas enable row level security;
alter table public.transacoes enable row level security;
alter table public.orcamentos enable row level security;

create policy "Usuário acessa o próprio perfil" on public.perfis
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "Usuário acessa as próprias categorias" on public.categorias
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy "Usuário acessa os próprios cartões" on public.cartoes
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy "Usuário acessa as próprias compras" on public.compras_parceladas
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy "Usuário acessa as próprias transações" on public.transacoes
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy "Usuário acessa os próprios orçamentos" on public.orcamentos
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
