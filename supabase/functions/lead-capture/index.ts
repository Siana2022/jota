// supabase/functions/lead-capture/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Definimos el tipo de datos que esperamos para un Lead
interface Lead {
  cliente_id: string; // Campo obligatorio
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  interes?: string;
  gclid?: string;
  gbraid?: string;
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  ga_cookie?: string;
  gcl_aw?: string;
  fuente?: string;
  landing_url?: string;
  precio_con_iva?: number;
  id_transaccion?: string;
  moneda_conversion?: string;
}

Deno.serve(async (req) => {
  // Manejo de la solicitud pre-vuelo CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Extraer los datos del cuerpo de la solicitud
    const leadData: Lead = await req.json();

    // 2. Validación CRÍTICA: Asegurarse de que el cliente_id está presente
    if (!leadData.cliente_id) {
      return new Response(JSON.stringify({ error: 'El campo cliente_id es obligatorio.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Crear el cliente de Supabase
    // Usamos el rol 'service_role' para saltarnos RLS, ya que esta es una operación de confianza del backend.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Insertar los datos en la tabla 'leads'
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData]) // insert espera un array
      .select()
      .single(); // Para devolver el registro insertado

    if (error) {
      console.error('Error de Supabase:', error);
      throw error;
    }

    // 5. Devolver una respuesta de éxito
    return new Response(JSON.stringify({ message: 'Lead creado con éxito', lead: data }), {
      status: 201, // 201 Created
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    // 6. Manejar errores inesperados
    console.error('Error inesperado:', err.message);
    return new Response(JSON.stringify({ error: 'Error interno del servidor.', details: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});