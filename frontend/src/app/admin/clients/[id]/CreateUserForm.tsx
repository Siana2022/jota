// src/app/admin/clients/[id]/CreateUserForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type CreateUserFormProps = {
  clientId: string;
};

export default function CreateUserForm({ clientId }: CreateUserFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setError('No estás autenticado. Por favor, vuelve a iniciar sesión.')
      setIsSubmitting(false)
      return
    }

    const response = await supabase.functions.invoke('create-user', {
      body: { email, password, clientId },
    })

    if (response.error) {
      setError(response.error.message)
    } else {
      setSuccess(`Usuario ${email} creado con éxito.`)
      setEmail('')
      setPassword('')
      router.refresh() // Actualiza la lista de usuarios en la página
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg bg-white p-6 shadow">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">
            Email del Usuario
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </form>
  )
}
