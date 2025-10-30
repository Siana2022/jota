// src/app/admin/clients/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CreateUserForm from './CreateUserForm'
import ApiConfigForm from './ApiConfigForm' // Importamos el nuevo formulario

type ClientDetailPageProps = {
  params: {
    id: string;
  };
};

type ProfileUser = {
  id: string;
  email: string | undefined;
  role: string;
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const supabase = createClient()
  const clientId = params.id

  // 1. Obtener los detalles del cliente
  const { data: cliente } = await supabase
    .from('clientes')
    .select('nombre_cliente')
    .eq('id', clientId)
    .single()

  if (!cliente) {
    notFound()
  }

  // 2. Obtener los usuarios asociados
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, role, users:auth_users(email)')
    .eq('cliente_id', clientId)

  const users: ProfileUser[] = profiles?.map(p => ({
    id: p.id,
    // @ts-ignore
    email: p.users?.email,
    role: p.role,
  })) || []

  // 3. Obtener la configuración de la API del cliente
  const { data: apiConfig } = await supabase
    .from('configuraciones_api')
    .select('*')
    .eq('cliente_id', clientId)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{cliente.nombre_cliente}</h2>
        <p className="text-sm text-gray-500">ID: {clientId}</p>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-700">Configuraciones de API</h3>
        </div>
        <div className="border-t border-gray-200 p-6">
           {/* Pasamos la configuración existente al formulario */}
          <ApiConfigForm clienteId={clientId} initialData={apiConfig} />
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-700">Gestión de Usuarios</h3>
        </div>
        <div className="border-t border-gray-200 p-6">
          <CreateUserForm clientId={clientId} />
          <div className="mt-6">
            <h4 className="mb-2 text-md font-semibold text-gray-600">Usuarios Existentes</h4>
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="py-2">
                  <span className="font-medium text-gray-800">{user.email}</span>
                  <span className="ml-2 rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600">{user.role}</span>
                </li>
              ))}
              {users.length === 0 && <p className="py-2 text-sm text-gray-500">No hay usuarios para este cliente.</p>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
