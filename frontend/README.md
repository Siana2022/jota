# Frontend del CRM Siana

Esta carpeta contiene la aplicación de frontend para el CRM, construida con Next.js y Supabase.

## Cómo Empezar

Sigue estos pasos para ejecutar la aplicación en tu entorno de desarrollo local.

### 1. Requisitos Previos

-   Node.js (versión 18 o superior)
-   npm

### 2. Instalación de Dependencias

Navega a la carpeta del frontend e instala los paquetes necesarios:

```bash
cd frontend
npm install
```

### 3. Configuración de Variables de Entorno

Para que la aplicación pueda conectarse a tu proyecto de Supabase, necesita dos claves: la URL del proyecto y la `anon key`.

1.  **Crea un archivo `.env.local`** en la raíz de la carpeta `frontend`. Puedes hacerlo copiando el archivo de ejemplo:
    ```bash
    cp .env.example .env.local
    ```
    *Nota: Crearemos el archivo `.env.example` en el siguiente paso.*

2.  **Obtén tus credenciales de Supabase**:
    -   Ve al [dashboard de tu proyecto en Supabase](https://supabase.com/dashboard).
    -   Entra en la configuración del proyecto (icono de engranaje) -> "API".
    -   En esta página, encontrarás la **URL del Proyecto** y la **`anon` key** (debajo de "Project API keys").

3.  **Añade las credenciales a tu archivo `.env.local`**:
    ```
    NEXT_PUBLIC_SUPABASE_URL=URL_DE_TU_PROYECTO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_DE_SUPABASE
    ```
    Reemplaza los valores con tus credenciales reales. El prefijo `NEXT_PUBLIC_` es importante para que Next.js exponga estas variables al navegador de forma segura.

### 4. Ejecutar la Aplicación

Una vez que las dependencias estén instaladas y las variables de entorno configuradas, puedes iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Flujo de Autenticación para Probar

1.  **Crea un usuario de prueba**:
    -   En tu dashboard de Supabase, ve a "Authentication".
    -   Haz clic en "Add user" y crea un nuevo usuario con un email y una contraseña.
2.  **Prueba el Login**:
    -   Abre [http://localhost:3000/login](http://localhost:3000/login).
    -   Usa las credenciales del usuario que acabas de crear.
    -   Si el inicio de sesión es exitoso, serás redirigido al `/dashboard`.
    -   Desde el dashboard, puedes probar el botón de "Cerrar Sesión".
