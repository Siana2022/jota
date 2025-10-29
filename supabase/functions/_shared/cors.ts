// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // O especifica tus dominios: 'https://tu-sitio.com, https://otro-sitio.com'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};