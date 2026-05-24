# Euskara SRS — Aprendizaje de Euskera con Repetición Espaciada

Una aplicación web moderna y minimalista diseñada para aprender vocabulario y frases hechas en euskera utilizando el método científico de repetición espaciada (**algoritmo SM-2**). La aplicación cuenta con modo oscuro por defecto, estética premium inspirada en Linear/Arc, soporte para instalación como **PWA (Progressive Web App)** y una arquitectura serverless robusta sobre **Next.js 14 App Router** y **Supabase**.

---

## Características Core
*   **Algoritmo SRS (SM-2)**: Programación adaptativa de repasos basada en tu nivel de retención histórico.
*   **Auto-enrolamiento**: Los nuevos usuarios reciben un lote de inicio inmediato de 10 palabras ordenadas por frecuencia de uso.
*   **PWA Integrado**: Instala la aplicación en tu móvil, tableta u ordenador con accesos rápidos directos (shortcuts) a tus repasos.
*   **Supabase SSR Auth**: Flujo completo de sesión e inicio con Magic Links o credenciales tradicionales de forma segura.
*   **Arquitectura Next.js 14**: Server Components para mayor velocidad de carga y optimización SEO automática.

---

## Requisitos Previos
*   **Node.js** v20.x o superior
*   **npm** v10.x o superior
*   Un proyecto activo en **Supabase**

---

## Setup Local (Paso a Paso)

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/juanulisespv/eus.git
cd eus
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.local.example` y renómbralo a `.env.local`:
```bash
cp .env.local.example .env.local
```
Abre `.env.local` e introduce tus claves de Supabase.

### 3. Ejecutar las migraciones SQL
Importa el contenido de `./sql/euskera_srs_schema.sql` en el editor SQL de tu panel de Supabase para generar las tablas, relaciones, triggers de racha y políticas de seguridad RLS.

### 4. Poblar la base de datos (Seed)
Ejecuta el importador para inyectar las primeras 100 palabras estructuradas y sus 200 frases de ejemplo en euskera y castellano:
```bash
npm run db:seed
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Comandos Útiles

*   `npm run dev` - Inicia el servidor local de desarrollo en el puerto 3000.
*   `npm run build` - Compila la aplicación de Next.js optimizada para producción (valida estáticos, rutas y compila el service worker de PWA).
*   `npm run start` - Inicia la aplicación compilada en modo producción.
*   `npm run lint` - Ejecuta el linter de ESLint para asegurar la calidad de código.
*   `npm run type-check` - Valida los tipos TypeScript en todo el proyecto sin generar ficheros.
*   `npm run db:seed` - Importa/actualiza las palabras y frases modelo desde `./data/words_seed.json`.
*   `npm run db:reset` - Limpia todo el historial de progreso y sesiones para pruebas limpias de desarrollo.

---

## Estructura del Directorio

```
├── app/                  # Next.js App Router (Páginas, Layouts y Callbacks)
│   ├── auth/             # Rutas de login, signup y callback de sesión
│   ├── dashboard/        # Dashboard principal del usuario
│   ├── study/            # Interfaz de estudio con tarjetas interactivas
│   ├── error.tsx         # Manejador de errores globales
│   └── not-found.tsx     # Vista elegante de 404
├── components/           # Componentes reutilizables
│   ├── dashboard/        # Componentes del dashboard (StatsCard, StreakDisplay)
│   ├── flashcard/        # Tarjetas de estudio interactivas y botones de calidad
│   └── ui/               # Componentes base (Card, Button, Input)
├── data/                 # Archivos de datos estáticos (Semilla JSON)
├── docs/                 # Documentación adicional del sistema
├── hooks/                # Hooks personalizados de React
├── lib/                  # Utilidades y configuración core
│   ├── srs/              # Algoritmo SM-2 y gestor de colas de estudio
│   └── supabase/         # Clientes Supabase (Browser, Server y Middleware)
├── public/               # Recursos estáticos (Iconos, Manifest JSON de PWA)
└── sql/                  # Scripts SQL y esquemas de base de datos
```

---

## Roadmap de Desarrollo

### Fase 1: Core SRS & Auth (Completada)
*   [x] Integración de Supabase SSR Auth compatible con Next.js Middleware.
*   [x] Diseño de base de datos y triggers automáticos de rachas diarias.
*   [x] Motor SRS (algoritmo SM-2 estándar).
*   [x] Auto-enrolamiento y soporte para usuarios nuevos en frío.

### Fase 2: PWA & Pulido (Actual)
*   [x] Habilitación completa de PWA y shortcuts para estudio rápido.
*   [x] Configuración óptima de CSP y cabeceras de seguridad en producción.
*   [x] Rutas elegantes de fallback (404, 500/error).

### Fase 3: Gamificación & Audio (Siguiente)
*   [ ] Integración de síntesis de voz (TTS) o archivos de audio para pronunciación de palabras.
*   [ ] Sistema de logros interactivo en el dashboard basados en rachas o palabras aprendidas.
*   [ ] Gráficos semanales de rendimiento y precisión del usuario.
