// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import LeadsTable from '@/components/LeadsTable' // Importamos la tabla

export type Lead = {
  id: string;
  created_at: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  estado: 'Lead' | 'Lead Cualificado' | 'Cliente/Compra';
};


export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('cliente_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.cliente_id) {
    return (
      <div className="text-center p-8">
        No se pudo encontrar el perfil del cliente. Contacte a soporte.
        <LogoutButton />
      </div>
    )
  }

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, created_at, nombre, email, telefono, estado') // Seleccionamos solo los campos necesarios
    .eq('cliente_id', profile.cliente_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error)
  }

  const leadsData: Lead[] = leads || [];

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      <header className="flex items-center justify-between bg-white p-4 shadow-md">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panel de Leads</h1>
          <p className="text-sm text-gray-600">
            Bienvenido, <span className="font-semibold">{user.email}</span>
          </p>
        </div>
        <LogoutButton />
      </header>

      <main className="flex-1 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">
          Tus Leads Recientes
        </h2>

        {/* Reemplazamos el JSON con nuestra tabla de leads */}
        <div className="rounded-lg bg-white p-4 shadow">
          <LeadsTable leads={leadsData} />
        </div>
      </main>
    </div>
  )
}
