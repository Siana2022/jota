// src/app/admin/clients/[id]/ApiConfigForm.tsx
'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Definimos el tipo para los datos de configuración. Hacemos todos los campos opcionales.
type ApiConfig = {
  id?: string;
  cliente_id: string;
  google_ads_customer_id?: string | null;
  google_ads_developer_token?: string | null;
  // ... Añade todos los demás campos de tu tabla aquí
  gtm_server_url?: string | null;
  mapeo_conversiones?: object | null;
};

type ApiConfigFormProps = {
  clienteId: string;
  initialData?: ApiConfig | null;
};

export default function ApiConfigForm({ clienteId, initialData }: ApiConfigFormProps) {
  const [config, setConfig] = useState<ApiConfig>(
    initialData || { cliente_id: clienteId }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value || null }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const { error } = await supabase.from('configuraciones_api').upsert(
      {
        ...config,
        cliente_id: clienteId, // Asegurarnos de que el cliente_id está presente
        // Parsear el JSON del mapeo de conversiones
        mapeo_conversiones: config.mapeo_conversiones ? JSON.parse(config.mapeo_conversiones as any) : null,
      },
      { onConflict: 'cliente_id' }
    );

    if (error) {
      console.error('Error saving API config:', error);
      setError('No se pudo guardar la configuración. Revisa el formato del JSON.');
    } else {
      setSuccess('Configuración guardada con éxito.');
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección de Google Ads */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">Google Ads API</h4>
        <div>
          <label className="text-sm font-medium text-gray-600">Customer ID</label>
          <input
            name="google_ads_customer_id"
            value={config.google_ads_customer_id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm"
          />
        </div>
        {/* Añade aquí el resto de los campos de Google Ads... */}
      </div>

      {/* Sección de GTM */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">GTM Server-side</h4>
        <div>
          <label className="text-sm font-medium text-gray-600">URL del Endpoint</label>
          <input
            name="gtm_server_url"
            value={config.gtm_server_url || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm"
          />
        </div>
        {/* Añade aquí el resto de los campos de GTM... */}
      </div>

      {/* Sección de Mapeo de Conversiones */}
      <div className="space-y-2">
         <h4 className="font-semibold text-gray-700">Mapeo de Conversiones</h4>
        <textarea
          name="mapeo_conversiones"
          value={typeof config.mapeo_conversiones === 'object' ? JSON.stringify(config.mapeo_conversiones, null, 2) : config.mapeo_conversiones || ''}
          onChange={handleChange}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 font-mono text-xs text-black shadow-sm"
          placeholder='{ "Lead Cualificado": "AW-123/conversion_id_1" }'
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </form>
  );
}
