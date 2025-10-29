-- 1. Crear la tabla de Clientes (Empresas)
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_cliente TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE "clientes" IS 'Almacena la información de las empresas cliente del CRM.';

-- 2. Crear la tabla de Perfiles para extender la funcionalidad de auth.users de Supabase
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'cliente',
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE "profiles" IS 'Tabla de perfiles de usuario que extiende auth.users con datos específicos de la aplicación como el cliente_id y el rol.';

-- 3. Crear un tipo ENUM para los estados de los leads
CREATE TYPE estado_lead AS ENUM ('Lead', 'Lead Cualificado', 'Cliente/Compra');

-- 4. Crear la tabla de Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nombre TEXT,
    apellidos TEXT,
    email TEXT,
    telefono TEXT,
    ciudad TEXT,
    interes TEXT,
    -- Campos de seguimiento
    gclid TEXT,
    gbraid TEXT,
    fbclid TEXT,
    fbc TEXT,
    fbp TEXT,
    ga_cookie TEXT,
    gcl_aw TEXT,
    -- Información de la conversión
    fuente TEXT,
    landing_url TEXT,
    precio_con_iva NUMERIC(10, 2),
    id_transaccion TEXT,
    moneda_conversion VARCHAR(3),
    -- Estado del lead
    estado estado_lead DEFAULT 'Lead' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE "leads" IS 'Tabla principal que almacena todos los leads capturados.';
-- Crear un índice para búsquedas rápidas por cliente
CREATE INDEX idx_leads_cliente_id ON leads(cliente_id);


-- 5. Crear la tabla para las Configuraciones de APIs
CREATE TABLE configuraciones_api (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL UNIQUE REFERENCES clientes(id) ON DELETE CASCADE,
    -- Google Ads API
    google_ads_customer_id TEXT,
    google_ads_developer_token TEXT,
    google_ads_oauth_client_id TEXT,
    google_ads_oauth_client_secret TEXT,
    google_ads_oauth_refresh_token TEXT,
    -- GTM Endpoint
    gtm_server_url TEXT,
    gtm_server_preview_header TEXT,
    gtm_server_preview_header_enabled BOOLEAN DEFAULT false,
    gtm_additional_fields JSONB,
    -- Meta CAPI
    meta_capi_action_source TEXT,
    meta_capi_event_compra TEXT,
    meta_capi_event_lead TEXT,
    -- Mapeo de conversiones
    mapeo_conversiones JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE "configuraciones_api" IS 'Almacena las credenciales y configuraciones de las APIs para cada cliente. NOTA: Los tokens sensibles deberían ser encriptados.';

-- 6. Crear la tabla de Comentarios para los Leads
CREATE TABLE comentarios_lead (
    id BIGSERIAL PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comentario TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE "comentarios_lead" IS 'Permite a los usuarios añadir comentarios a los leads.';
-- Crear un índice para búsquedas rápidas por lead
CREATE INDEX idx_comentarios_lead_id ON comentarios_lead(lead_id);


-----------------------------------------------------------------
-- SEGURIDAD: Habilitar Row Level Security (RLS) y definir políticas
-----------------------------------------------------------------

-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_api ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_lead ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para obtener el cliente_id del usuario actual
CREATE OR REPLACE FUNCTION get_my_cliente_id()
RETURNS UUID AS $$
DECLARE
    cliente_id_val UUID;
BEGIN
    SELECT cliente_id INTO cliente_id_val FROM public.profiles WHERE id = auth.uid();
    RETURN cliente_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Políticas para la tabla `clientes`
-- Los usuarios solo pueden ver su propia información de cliente.
CREATE POLICY "Allow users to see their own client info"
ON clientes FOR SELECT
USING (id = get_my_cliente_id());

-- Políticas para la tabla `profiles`
-- Los usuarios pueden ver su propio perfil y los perfiles de su misma empresa.
CREATE POLICY "Allow users to see profiles from their own client"
ON profiles FOR SELECT
USING (cliente_id = get_my_cliente_id());

-- Políticas para la tabla `leads`
-- Los usuarios pueden gestionar (ver, insertar, actualizar, borrar) leads que pertenecen a su cliente.
CREATE POLICY "Allow full access to leads from their own client"
ON leads FOR ALL
USING (cliente_id = get_my_cliente_id())
WITH CHECK (cliente_id = get_my_cliente_id());

-- Políticas para la tabla `configuraciones_api`
-- Los usuarios pueden gestionar la configuración de su propio cliente.
CREATE POLICY "Allow full access to api_configs from their own client"
ON configuraciones_api FOR ALL
USING (cliente_id = get_my_cliente_id())
WITH CHECK (cliente_id = get_my_cliente_id());

-- Políticas para la tabla `comentarios_lead`
-- Los usuarios pueden gestionar comentarios de leads que pertenecen a su cliente.
CREATE POLICY "Allow full access to comments on leads from their own client"
ON comentarios_lead FOR ALL
USING (
    (
        SELECT l.cliente_id
        FROM leads l
        WHERE l.id = lead_id
    ) = get_my_cliente_id()
);