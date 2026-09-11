create or replace function public.off_by_leaderboard(
  p_mode text,
  p_date date,
  p_limit integer default 10
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  if p_mode not in ('sprint','daily') then
    raise exception 'invalid mode';
  end if;
  p_limit := greatest(1, least(coalesce(p_limit,10), 25));

  with ranked as (
    select
      client_id, player_tag, score, created_at,
      row_number() over (
        partition by client_id
        order by
          case when p_mode='sprint' then score end asc nulls last,
          case when p_mode='daily' then score end desc nulls last,
          created_at asc
      ) as rn
    from public.off_by_attempts
    where mode=p_mode and challenge_date=p_date
  ),
  best as (
    select client_id, player_tag, score, created_at from ranked where rn=1
  ),
  leaders as (
    select * from best
    order by
      case when p_mode='sprint' then score end asc nulls last,
      case when p_mode='daily' then score end desc nulls last,
      created_at asc
    limit p_limit
  )
  select jsonb_build_object(
    'mode', p_mode,
    'date', p_date,
    'participants', (select count(*) from best),
    'leaders', coalesce(
      (select jsonb_agg(jsonb_build_object(
        'client_id', client_id,
        'player_tag', player_tag,
        'score', score
      ) order by
        case when p_mode='sprint' then score end asc nulls last,
        case when p_mode='daily' then score end desc nulls last,
        created_at asc
      ) from leaders),
      '[]'::jsonb
    )
  ) into result;

  return result;
end $$;

revoke execute on function public.off_by_leaderboard(text,date,integer) from public, anon, authenticated;
grant execute on function public.off_by_leaderboard(text,date,integer) to service_role;
