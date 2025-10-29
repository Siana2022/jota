# Instrucciones para Desplegar y Probar la Edge Function

Sigue estos pasos para poner en producción tu endpoint de captura de leads.

### Requisitos Previos

1.  **Tener el Supabase CLI instalado**: Si no lo tienes, puedes instalarlo con npm:
    ```bash
    npm install supabase --save-dev
    ```
2.  **Haber iniciado sesión en el CLI**:
    ```bash
    npx supabase login
    ```

### Paso 1: Vincular tu Proyecto Local con Supabase

Primero, necesitas conectar tu repositorio local con tu proyecto en la nube de Supabase.

1.  Ve al [dashboard de tu proyecto en Supabase](https://supabase.com/dashboard).
2.  Entra en la configuración del proyecto (icono de engranaje).
3.  En la sección "General", copia el **Project Ref**.
4.  Ejecuta el siguiente comando en tu terminal, reemplazando `<PROJECT_REF>`:
    ```bash
    npx supabase link --project-ref <PROJECT_REF>
    ```

### Paso 2: Configurar las Claves Secretas

La función necesita la `SERVICE_ROLE_KEY` para poder escribir en la base de datos saltándose las políticas de RLS. Esta clave es muy sensible y debe ser tratada como un secreto.

1.  En el dashboard de Supabase, ve a "Project Settings" -> "API".
2.  Busca la clave `service_role` (debajo de "Project API keys") y cópiala. **Nunca la compartas ni la expongas en tu código frontend.**
3.  Ejecuta el siguiente comando para guardar esta clave de forma segura en Supabase:
    ```bash
    npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<TU_SERVICE_ROLE_KEY_AQUI>
    ```
    *Nota: La `SUPABASE_URL` se inyecta automáticamente, por lo que no necesitas configurarla.*

### Paso 3: Desplegar la Función

Ahora, despliega la función a la nube de Supabase.

```bash
npx supabase functions deploy lead-capture --no-verify-jwt
```
*Usamos `--no-verify-jwt` porque la autenticación la haremos a través del `cliente_id` en el cuerpo de la solicitud, y no con un token de usuario. Esto es común para webhooks públicos.*

### Paso 4: Probar el Endpoint

Una vez desplegada, la función estará disponible en una URL pública. ¡Vamos a probarla!

1.  **Consigue un `cliente_id` válido**:
    *   Ve al dashboard de Supabase -> "Table Editor".
    *   Selecciona la tabla `clientes`.
    *   Si no tienes ningún cliente, crea uno.
    *   Copia el valor de la columna `id` de uno de tus clientes.

2.  **Consigue tu `anon key`**:
    *   En el dashboard de Supabase -> "Project Settings" -> "API".
    *   Copia la clave `anon` (debajo de "Project API keys").

3.  **Ejecuta la prueba con `curl`**:
    *   Abre una terminal y reemplaza los siguientes valores en el comando:
        *   `<URL_DE_TU_PROYECTO>`: La URL de tu proyecto de Supabase (la encuentras en "Settings" -> "API").
        *   `<TU_ANON_KEY>`: La `anon key` que acabas de copiar.
        *   `<ID_DEL_CLIENTE_REAL>`: El `id` del cliente que copiaste de la tabla.

    ```bash
    curl -X POST \
      'https://<URL_DE_TU_PROYECTO>.supabase.co/functions/v1/lead-capture' \
      --header 'apikey: <TU_ANON_KEY>' \
      --header 'Content-Type: application/json' \
      --data '{
        "cliente_id": "<ID_DEL_CLIENTE_REAL>",
        "nombre": "Lead de Prueba",
        "apellidos": "Desde Curl",
        "email": "test@ejemplo.com",
        "telefono": "123456789",
        "gclid": "test_gclid_123",
        "fuente": "Prueba Directa API"
      }'
    ```

### Verificación Final

*   Si la prueba es exitosa, recibirás una respuesta `HTTP 201 Created` con un mensaje de éxito.
*   Ve a la tabla `leads` en el "Table Editor" de Supabase. Deberías ver el nuevo "Lead de Prueba" que acabas de enviar.

¡Si ves el lead en tu tabla, significa que tu endpoint está funcionando perfectamente!