-- Execute após a migração inicial caso não use a Supabase CLI.
-- Corrige a competência das parcelas conforme a data de fechamento do cartão.

create or replace function public.gerar_parcelas()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  indice integer;
  dia_fechamento smallint;
  competencia_inicial date;
  valor_centavos bigint := round(new.valor_total * 100);
  valor_base_centavos bigint := valor_centavos / new.total_parcelas;
  resto_centavos bigint := valor_centavos % new.total_parcelas;
begin
  select dia_fechamento into dia_fechamento
  from public.cartoes where id = new.cartao_id and usuario_id = new.usuario_id;
  if dia_fechamento is null then raise exception 'Cartão inválido para o usuário informado'; end if;
  competencia_inicial := date_trunc('month', new.data_compra)::date;
  if extract(day from new.data_compra) > dia_fechamento then
    competencia_inicial := (competencia_inicial + interval '1 month')::date;
  end if;
  for indice in 1..new.total_parcelas loop
    insert into public.transacoes (usuario_id, categoria_id, cartao_id, compra_parcelada_id, valor, tipo, descricao, data, numero_parcela)
    values (
      new.usuario_id, new.categoria_id, new.cartao_id, new.id,
      (valor_base_centavos + case when indice <= resto_centavos then 1 else 0 end) / 100.0,
      'DESPESA', new.descricao || ' (' || indice || '/' || new.total_parcelas || ')',
      (competencia_inicial + ((indice - 1) || ' months')::interval)::date, indice
    );
  end loop;
  return new;
end;
$$;
