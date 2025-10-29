// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Si no hay usuario, redirigir a la página de login
    return redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenido al Dashboard
        </h1>
        <p className="mt-4 text-gray-600">
          Has iniciado sesión como: <span className="font-semibold text-indigo-600">{user.email}</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Tu ID de usuario es: <code className="rounded bg-gray-100 p-1 text-xs">{user.id}</code>
        </p>
        <div className="mt-8">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
