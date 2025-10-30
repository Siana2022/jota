// src/app/admin/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PropsWithChildren } from 'react'

export default async function AdminLayout({ children }: PropsWithChildren) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Si no hay usuario, redirigir a login
  if (!user) {
    return redirect('/login')
  }

  // 2. Obtener el perfil y el rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 3. Si el rol no es 'admin', redirigir al dashboard de cliente
  if (profile?.role !== 'admin') {
    return redirect('/dashboard')
  }

  // 4. Si es admin, mostrar el contenido de la página
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-gray-800 p-4 text-white shadow-md">
        <h1 className="text-xl font-bold">Panel de Administración</h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
