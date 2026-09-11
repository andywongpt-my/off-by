revoke all on table public.off_by_attempts from service_role;
grant select, insert on table public.off_by_attempts to service_role;

revoke all on sequence public.off_by_attempts_id_seq from service_role;
grant usage, select on sequence public.off_by_attempts_id_seq to service_role;
