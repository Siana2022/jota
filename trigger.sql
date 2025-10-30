-- 1. Habilitar la extensión pg_net si no está habilitada
-- pg_net es necesaria para hacer solicitudes HTTP desde la base de datos a las Edge Functions.
create extension if not exists pg_net with schema extensions;


-- 2. Crear la función que manejará la lógica del trigger
create or replace function handle_lead_status_change()
returns trigger
language plpgsql
security definer -- La función se ejecuta con los permisos del usuario que la creó (importante para pg_net)
as $$
begin
  -- Comprobamos si el estado del lead ha cambiado a un valor significativo.
  -- OLD.estado es el valor antes de la actualización, NEW.estado es el valor nuevo.
  if OLD.estado is distinct from NEW.estado and (NEW.estado = 'Lead Cualificado' or NEW.estado = 'Cliente/Compra') then
    -- Si el estado cambió, invocamos la Edge Function 'send-conversion' de forma asíncrona.
    perform net.http_post(
      -- URL de la Edge Function
      url:='https://<URL_DE_TU_PROYECTO>.supabase.co/functions/v1/send-conversion',
      -- Cuerpo de la solicitud: pasamos todos los datos del lead actualizado
      body:=jsonb_build_object('record', row_to_json(NEW)),
      -- Cabeceras necesarias para la autenticación
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '<TU_SERVICE_ROLE_KEY>' -- Usamos la service_role key para seguridad
      )
    );
  end if;

  -- Es obligatorio devolver NEW en un trigger de tipo 'AFTER'
  return NEW;
end;
$$;


-- 3. Crear el Trigger en la tabla 'leads'
-- Primero, nos aseguramos de que no exista un trigger con el mismo nombre para evitar errores.
drop trigger if exists on_lead_status_change on leads;

-- Creamos el trigger que se activa DESPUÉS de cada actualización en una fila de la tabla 'leads'.
create trigger on_lead_status_change
after update on leads
for each row
execute function handle_lead_status_change();
