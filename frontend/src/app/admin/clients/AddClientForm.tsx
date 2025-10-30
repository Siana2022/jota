// src/app/admin/clients/AddClientForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AddClientForm() {
  const [clientName, setClientName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    if (!clientName.trim()) {
      setError('El nombre del cliente no puede estar vacío.')
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('clientes')
      .insert([{ nombre_cliente: clientName.trim() }])

    if (error) {
      console.error('Error creating client:', error)
      setError('No se pudo crear el cliente.')
    } else {
      setSuccess(`Cliente "${clientName.trim()}" creado con éxito.`)
      setClientName('')
      // Refresca los datos del servidor para que la lista de clientes se actualice
      router.refresh()
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg bg-white p-6 shadow">
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
            Nombre del Nuevo Cliente
          </label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Ej: Siana Solutions"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creando...' : 'Crear Cliente'}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </form>
  )
}
