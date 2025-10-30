# Instrucciones para la Automatización de Conversiones

Sigue estos pasos para implementar y probar el sistema de triggers que envía eventos de conversión.

### Paso 1: Configurar los Secretos en Supabase Vault (¡NUEVO y MÁS SEGURO!)

En lugar de pegar tus claves secretas en el código, las guardaremos de forma segura en Supabase Vault.

1.  **Habilita las Extensiones Necesarias**:
    *   Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard) -> Database -> Extensions.
    *   Busca y habilita `supabase_vault` y `pg_net` si aún no lo están.

2.  **Guarda tus Claves como Secretos**:
    *   Navega a "SQL Editor".
    *   Ejecuta las siguientes dos sentencias SQL, **reemplazando los valores de ejemplo** con tu URL de proyecto y tu `service_role_key` (que encuentras en "Settings" -> "API"):
    ```sql
    -- Guarda tu URL de Supabase
    insert into vault.secrets (name, secret)
    values ('supabase_url', 'URL_DE_TU_PROYECTO_SUPABASE');

    -- Guarda tu clave de servicio (¡MUY SECRETA!)
    insert into vault.secrets (name, secret)
    values ('supabase_service_role_key', 'TU_SERVICE_ROLE_KEY');
    ```

### Paso 2: Desplegar la(s) Edge Function(s)

Despliega todas las funciones necesarias para que el sistema funcione.

1.  Asegúrate de haber iniciado sesión en el Supabase CLI (`npx supabase login`).
2.  Asegúrate de haber vinculado tu proyecto (`npx supabase link --project-ref <PROJECT_REF>`).
3.  Despliega las funciones:
    ```bash
    npx supabase functions deploy send-conversion --no-verify-jwt
    npx supabase functions deploy create-user
    ```

### Paso 3: Ejecutar el Script SQL del Trigger

Ahora que los secretos están en el Vault, puedes ejecutar el script del trigger directamente, sin necesidad de editarlo.

1.  Ve al "SQL Editor" de tu dashboard de Supabase.
2.  Copia todo el contenido del archivo `trigger.sql` y pégalo en el editor.
3.  Haz clic en "RUN".

### Paso 4: Configurar un Endpoint de Prueba y Probar

Este proceso no cambia. Sigue los pasos de la guía anterior para:
1.  **Crear una URL de prueba** en [https://webhook.site/](https://webhook.site/).
2.  **Pegar esa URL** en la columna `gtm_server_url` de la tabla `configuraciones_api` para un cliente de prueba.
3.  **Iniciar la aplicación de frontend**, iniciar sesión y **cambiar el estado de un lead**.
4.  **Verificar la solicitud** que llega a Webhook.site.

Si la solicitud llega, ¡el sistema está funcionando con un nivel de seguridad y profesionalismo mucho mayor!
