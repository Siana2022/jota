// src/components/StatusSelector.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Lead } from '@/app/dashboard/page'
import { createClient } from '@/lib/supabase/client'

type StatusSelectorProps = {
  lead: Lead;
};

export default function StatusSelector({ lead }: StatusSelectorProps) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(lead.estado)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Lead['estado']
    setIsUpdating(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ estado: newStatus })
      .eq('id', lead.id)

    if (error) {
      console.error('Error updating status:', error)
      setError('No se pudo actualizar el estado.')
      // Revertimos el estado visual si hay un error
      setCurrentStatus(currentStatus)
    } else {
      setCurrentStatus(newStatus)
      // Refresca la data del servidor para que toda la fila (y la app) esté actualizada
      router.refresh()
    }

    setIsUpdating(false)
  }

  const statusOptions: Lead['estado'][] = ['Lead', 'Lead Cualificado', 'Cliente/Compra']

  const getStatusColor = (status: Lead['estado']) => {
    switch (status) {
      case 'Cliente/Compra': return 'bg-green-100 text-green-800'
      case 'Lead Cualificado': return 'bg-yellow-100 text-yellow-800'
      case 'Lead': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center">
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${getStatusColor(currentStatus)}`}
      >
        {statusOptions.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
    </div>
  );
}
