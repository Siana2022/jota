// supabase/functions/send-conversion/index.ts

import { corsHeaders } from '../_shared/cors.ts'

console.log("Función 'send-conversion' iniciada.");

Deno.serve(async (req) => {
  // Manejo de la solicitud pre-vuelo CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record: leadData } = await req.json();

    if (!leadData) {
      return new Response(JSON.stringify({ error: 'No se recibieron datos del lead.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Lógica Principal de la Función ---
    // Por ahora, solo imprimimos en los logs para confirmar que el trigger funciona.
    console.log('Evento de conversión recibido para el lead:', JSON.stringify(leadData, null, 2));

    // --- Próximos pasos (a implementar en el futuro) ---
    // 1. Obtener las credenciales de API del cliente desde la tabla `configuraciones_api`
    //    usando el `leadData.cliente_id`.
    // 2. Construir el payload para GTM Server-Side y/o Meta CAPI.
    // 3. Enviar la solicitud HTTP a los endpoints correspondientes.
    // 4. Manejar la respuesta de las APIs.

    return new Response(JSON.stringify({ message: 'Evento de conversión procesado', received_lead: leadData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error procesando el evento de conversión:', error.message);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
