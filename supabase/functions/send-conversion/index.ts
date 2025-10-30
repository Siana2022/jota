// supabase/functions/send-conversion/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Función 'send-conversion' iniciada.");

interface LeadData {
  id: string;
  cliente_id: string;
  estado: 'Lead' | 'Lead Cualificado' | 'Cliente/Compra';
  // ... otros campos del lead
}

interface ApiConfig {
  gtm_server_url?: string;
  gtm_server_preview_header?: string;
  gtm_server_preview_header_enabled?: boolean;
  // ... otros campos de configuración
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record: leadData }: { record: LeadData } = await req.json();

    if (!leadData || !leadData.cliente_id) {
      return new Response(JSON.stringify({ error: 'Datos del lead o cliente_id faltantes.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Procesando evento para lead ${leadData.id} del cliente ${leadData.cliente_id}`);

    // Creamos un cliente de Supabase con permisos de servicio para leer la configuración de la API.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Obtener la configuración de la API para el cliente
    const { data: apiConfig, error: configError } = await supabaseAdmin
      .from('configuraciones_api')
      .select('*')
      .eq('cliente_id', leadData.cliente_id)
      .single();

    if (configError || !apiConfig) {
      throw new Error(`No se encontró configuración de API para el cliente ${leadData.cliente_id}. Error: ${configError?.message}`);
    }

    // 2. Comprobar si hay una URL de GTM configurada
    if (!apiConfig.gtm_server_url) {
      console.log(`No hay gtm_server_url configurada para el cliente ${leadData.cliente_id}. No se enviará ninguna conversión.`);
      return new Response(JSON.stringify({ message: 'No hay endpoint configurado.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Construir el payload y las cabeceras
    const payload = {
      event_name: `conversion_${leadData.estado.toLowerCase().replace(/ /g, '_')}`, // ej: conversion_lead_cualificado
      lead_data: leadData,
    };

    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (apiConfig.gtm_server_preview_header_enabled && apiConfig.gtm_server_preview_header) {
      headers.set('X-Gtm-Server-Preview', apiConfig.gtm_server_preview_header);
    }

    // 4. Enviar la solicitud HTTP al endpoint de GTM Server-side
    console.log(`Enviando conversión a: ${apiConfig.gtm_server_url}`);
    const response = await fetch(apiConfig.gtm_server_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`La solicitud al endpoint falló con estado ${response.status}: ${await response.text()}`);
    }

    console.log(`Conversión enviada exitosamente para el lead ${leadData.id}.`);

    return new Response(JSON.stringify({ message: 'Conversión enviada con éxito' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error procesando el evento de conversión:', error.message);
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});