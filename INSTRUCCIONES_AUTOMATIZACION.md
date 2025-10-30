# Instrucciones para la Automatización de Conversiones

Sigue estos pasos para implementar y probar el sistema de triggers que envía eventos de conversión.

### Paso 1: Desplegar la Edge Function

Primero, necesitas desplegar la función `send-conversion` (o volver a desplegarla si ya existía) con el nuevo código.

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

### Paso 2: Ejecutar el Script SQL del Trigger

Si no lo has hecho en la fase anterior, necesitas aplicar la lógica de la base de datos.

1.  **Abre el archivo `trigger.sql`**.
2.  **Reemplaza los placeholders**:
    *   Reemplaza `<URL_DE_TU_PROYECTO>` por tu URL real de Supabase.
    *   Reemplaza `<TU_SERVICE_ROLE_KEY>` por tu clave `service_role`.
3.  **Ejecuta el script** en el "SQL Editor" de tu dashboard de Supabase.

---

### Paso 3: Configurar un Endpoint de Prueba (¡NUEVO!)

Para verificar que la función envía los datos correctamente, usaremos un servicio gratuito que nos permite inspeccionar solicitudes HTTP.

1.  **Ve a [https://webhook.site/](https://webhook.site/)** en tu navegador.
2.  El sitio te dará automáticamente una **URL única**. Cópiala. Esta será tu URL de GTM Server-side para las pruebas.
3.  **Mantén esta pestaña del navegador abierta**.

### Paso 4: Configurar el Endpoint en Supabase

Ahora, le diremos a nuestro CRM que envíe las conversiones a la URL de prueba.

1.  **Ve al dashboard de Supabase** -> "Table Editor".
2.  Selecciona la tabla `configuraciones_api`.
3.  **Busca la fila del cliente** con el que vas a hacer la prueba. Si no existe una fila para ese cliente, crea una y asegúrate de rellenar el `cliente_id`.
4.  En la columna `gtm_server_url`, **pega la URL única que te dio Webhook.site**.
5.  Guarda los cambios.

### Paso 5: Probar el Flujo Completo

Ahora vamos a probar todo el sistema.

1.  **Inicia la aplicación de frontend** (`npm run dev` en la carpeta `frontend`).
2.  **Inicia sesión** con un usuario que pertenezca al cliente que configuraste en el paso 4.
3.  En el dashboard, **cambia el estado de un lead** a "Lead Cualificado" o "Cliente/Compra".

### Paso 6: Verificar el Resultado en Webhook.site

Vuelve a la pestaña del navegador donde tienes abierto Webhook.site.

-   **¡Deberías ver una nueva solicitud (POST) aparecer en la lista de la izquierda!**
-   Haz clic en ella.
-   En el panel de la derecha, bajo "Raw Content", verás el JSON que nuestra Edge Function ha enviado. Debería contener el `event_name` y todos los datos del `lead_data`.

**Si ves esta solicitud en Webhook.site, significa que el ciclo completo de automatización funciona a la perfección. ¡Felicidades!**
