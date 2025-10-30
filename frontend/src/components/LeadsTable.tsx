// src/components/LeadsTable.tsx
import type { Lead } from "@/app/dashboard/page";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusSelector from './StatusSelector'; // Importamos el nuevo componente

type LeadsTableProps = {
  leads: Lead[];
};

export default function LeadsTable({ leads }: LeadsTableProps) {
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
      console.error('Invalid date:', dateString);
      return 'Fecha inválida';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Teléfono
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Fecha de Creación
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {lead.nombre || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {lead.email || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {lead.telefono || 'N/A'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(lead.created_at)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {/* Reemplazamos el texto estático con el componente interactivo */}
                <StatusSelector lead={lead} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
