// supabase/functions/create-user/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, clientId } = await req.json()

    if (!email || !password || !clientId) {
      return new Response(JSON.stringify({ error: 'Faltan email, password o clientId.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Crear un cliente de Supabase para verificar el rol del llamador
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acceso denegado. Se requiere rol de administrador.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Si el llamador es un admin, proceder con la creación del usuario usando el cliente de admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Crear el usuario en el sistema de autenticación
    const { data: newUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Lo confirmamos directamente ya que es una acción de admin
    })

    if (createUserError) {
      throw createUserError
    }

    const newUserId = newUserData.user.id

    // 2. Crear el perfil asociado en la tabla `profiles`
    const { error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        cliente_id: clientId,
        role: 'cliente', // Por defecto, los usuarios creados son de rol 'cliente'
      })

    if (createProfileError) {
      // Si falla la creación del perfil, intentamos borrar el usuario para no dejar datos inconsistentes
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      throw createProfileError
    }

    return new Response(JSON.stringify({ message: 'Usuario creado con éxito' }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creando usuario:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
