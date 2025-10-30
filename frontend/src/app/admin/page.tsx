// src/app/admin/page.tsx
export default function AdminHomePage() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-gray-700">
        Bienvenido al Panel de Administración
      </h2>
      <p className="text-gray-600">
        Selecciona una opción del menú para empezar a gestionar clientes, usuarios o configuraciones.
      </p>
      {/* En el futuro, aquí podríamos añadir un menú de navegación */}
    </div>
  )
}
