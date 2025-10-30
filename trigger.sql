-- Este script asume que has habilitado la extensión 'supabase_vault' y 'pg_net'.
-- Puedes hacerlo desde el Dashboard de Supabase -> Database -> Extensions.

-- 1. Crear la función que manejará la lógica del trigger
create or replace function handle_lead_status_change()
returns trigger
language plpgsql
security definer -- La función se ejecuta con los permisos del usuario que la creó
as $$
declare
  project_url text;
  service_role_key text;
  -- Declaramos una variable para los headers con un tipo específico
  headers jsonb;
begin
  -- Obtenemos los secretos de forma segura desde Supabase Vault
  select decrypted_secret into project_url from vault.decrypted_secrets where name = 'supabase_url';
  select decrypted_secret into service_role_key from vault.decrypted_secrets where name = 'supabase_service_role_key';

  -- Si no se encuentran los secretos, lanzamos un error claro en los logs de la base de datos.
  if project_url is null or service_role_key is null then
    raise warning 'No se encontraron los secretos "supabase_url" o "supabase_service_role_key" en Vault.';
    return NEW;
  end if;

  -- Comprobamos si el estado del lead ha cambiado a un valor significativo.
  if OLD.estado is distinct from NEW.estado and (NEW.estado = 'Lead Cualificado' or NEW.estado = 'Cliente/Compra') then

    -- Construimos los headers
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    );

    -- Invocamos la Edge Function de forma asíncrona.
    perform net.http_post(
      -- La URL se construye dinámicamente con el secreto
      url:= project_url || '/functions/v1/send-conversion',
      -- El cuerpo de la solicitud
      body:=jsonb_build_object('record', row_to_json(NEW)),
      -- Las cabeceras
      headers:=headers
    );
  end if;

  return NEW;
end;
$$;


-- 2. Crear el Trigger en la tabla 'leads'
-- (Esto no cambia, pero lo mantenemos para que el script sea completo)
drop trigger if exists on_lead_status_change on leads;

create trigger on_lead_status_change
after update on leads
for each row
execute function handle_lead_status_change();
