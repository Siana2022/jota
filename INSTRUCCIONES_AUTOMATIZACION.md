# Instrucciones para la Automatización de Conversiones

Sigue estos pasos para implementar y probar el sistema de triggers que envía eventos de conversión.

### Paso 1: Desplegar la Nueva Edge Function

Primero, necesitas desplegar la nueva función `send-conversion` en tu proyecto de Supabase.

1.  **Asegúrate de haber iniciado sesión** en el Supabase CLI:
    ```bash
    npx supabase login
    ```
2.  **Vincula tu proyecto** si no lo has hecho ya (reemplaza `<PROJECT_REF>`):
    ```bash
    npx supabase link --project-ref <PROJECT_REF>
    ```
3.  **Despliega la función**:
    ```bash
    npx supabase functions deploy send-conversion --no-verify-jwt
    ```
    *Nota: Usamos `--no-verify-jwt` porque la autenticación se manejará con la `service_role_key` en la llamada desde la base de datos.*

### Paso 2: Ejecutar el Script SQL del Trigger

A continuación, necesitas aplicar la lógica de la base de datos (la función y el trigger).

1.  **Abre el archivo `trigger.sql`** en tu editor de código.

2.  **Reemplaza los placeholders**:
    *   Busca `<URL_DE_TU_PROYECTO>` y reemplázalo por la URL real de tu proyecto de Supabase (la encuentras en "Settings" -> "API").
    *   Busca `<TU_SERVICE_ROLE_KEY>` y reemplázala por tu clave `service_role` (la encuentras en "Settings" -> "API"). **¡Trata esta clave con mucho cuidado, es muy sensible!**

3.  **Ejecuta el script**:
    *   Ve al dashboard de tu proyecto en Supabase.
    *   Navega a "SQL Editor".
    *   Copia todo el contenido del archivo `trigger.sql` (ya con tus valores reales) y pégalo en el editor.
    *   Haz clic en "RUN".

Si todo va bien, no deberías ver ningún error.

### Paso 3: Probar el Flujo Completo

¡Ahora la parte divertida! Vamos a probar que todo el sistema funciona de extremo a extremo.

1.  **Asegúrate de tener un lead de prueba**:
    *   Si no tienes leads, puedes crear uno manualmente en el "Table Editor" -> tabla `leads`. Asegúrate de que tenga un `cliente_id` válido.
    *   Alternativamente, usa el endpoint de `lead-capture` para crear uno.

2.  **Inicia la aplicación de frontend**:
    *   Navega a la carpeta `frontend`.
    *   Asegúrate de que tu `.env.local` está configurado.
    *   Ejecuta `npm run dev`.

3.  **Cambia el estado de un lead**:
    *   Abre la aplicación en tu navegador (`http://localhost:3000`).
    *   Inicia sesión con un usuario que pertenezca al mismo cliente que tu lead de prueba.
    *   En el dashboard, busca el lead de prueba y usa el menú desplegable para cambiar su estado a **"Lead Cualificado"** o **"Cliente/Compra"**.

### Paso 4: Verificar el Resultado en los Logs

El cambio de estado debería haber activado el trigger y llamado a la Edge Function. Vamos a comprobarlo.

1.  **Ve al dashboard de Supabase**.
2.  En el menú de la izquierda, ve a "Edge Functions".
3.  Selecciona la función `send-conversion`.
4.  Haz clic en la pestaña "Logs" o "Invocations".

Deberías ver una nueva entrada de log que comienza con:
`Evento de conversión recibido para el lead: { ... }`
seguido de los datos completos del lead cuyo estado cambiaste.

**Si ves este mensaje en los logs, ¡felicidades! La automatización de conversiones está funcionando perfectamente.**
