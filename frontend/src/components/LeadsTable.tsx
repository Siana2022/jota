// src/components/LeadsTable.tsx
'use client' // Convertimos este componente a un Componente de Cliente

import { useState } from 'react'
import type { Lead } from "@/app/dashboard/page";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusSelector from './StatusSelector';
import CommentsModal from './CommentsModal'; // Importamos el modal

type LeadsTableProps = {
  leads: Lead[];
};

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleOpenModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  if (leads.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No se encontraron leads.
      </p>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{lead.nombre || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{lead.email || 'N/A'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(lead.created_at)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm"><StatusSelector lead={lead} /></td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button
                    onClick={() => handleOpenModal(lead)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Ver Comentarios
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* El Modal se renderiza aquí, pero solo es visible cuando isModalOpen es true */}
      <CommentsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lead={selectedLead}
      />
    </>
  );
}
