// src/app/admin/clients/page.tsx
import { createClient } from '@/lib/supabase/server'
import AddClientForm from './AddClientForm'
import Link from 'next/link' // Importamos el componente Link

// Definimos el tipo para mayor seguridad
type Cliente = {
  id: string;
  nombre_cliente: string;
  created_at: string;
};

// Componente de Servidor para mostrar la página
export default async function ClientsPage() {
  const supabase = createClient()

  // 1. Obtenemos todos los clientes de la base de datos
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre_cliente', { ascending: true })

  if (error) {
    console.error('Error fetching clients:', error)
  }

  const clientesData: Cliente[] = clientes || []

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700">Crear Nuevo Cliente</h2>
        {/* 2. Renderizamos el formulario de cliente (Componente de Cliente) */}
        <AddClientForm />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">Lista de Clientes</h2>
        <div className="overflow-x-auto rounded-lg bg-white p-4 shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre del Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientesData.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {/* 3. Añadimos el enlace a la página de detalle */}
                    <Link href={`/admin/clients/${cliente.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {cliente.nombre_cliente}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cliente.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
