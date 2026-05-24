# Checklist de Seguridad Supabase — Euskera SRS

Esta guía detalla los pasos críticos de configuración y seguridad que deben realizarse en la consola de Supabase antes del despliegue final en producción.

---

## 1. Row Level Security (RLS) en la Base de Datos
Es imperativo que todas las tablas de acceso público tengan RLS activado para evitar que cualquier usuario consulte o modifique datos ajenos utilizando la anon-key pública.

### Estado en la Base de Datos:
*   [x] **Tabla `public.users`**: RLS activado.
    *   *Política SELECT*: `auth.uid() = id` (El usuario solo lee su propio perfil).
    *   *Política UPDATE*: `auth.uid() = id` (El usuario solo modifica su propio perfil).
*   [x] **Tabla `public.words`**: RLS activado.
    *   *Política SELECT*: `is_active = true` (Acceso de lectura a palabras activas para todos).
    *   *Modificación*: Denegada. Solo realizable mediante `service_role` (ej. script de seed).
*   [x] **Tabla `public.examples`**: RLS activado.
    *   *Política SELECT*: Permiso concedido a usuarios autenticados.
    *   *Modificación*: Denegada. Solo realizable mediante `service_role`.
*   [x] **Tabla `public.user_word_progress`**: RLS activado.
    *   *Políticas SELECT/INSERT/UPDATE/DELETE*: `auth.uid() = user_id` (Solo acceso a datos del propio usuario).
*   [x] **Tabla `public.sessions`**: RLS activado.
    *   *Políticas SELECT/INSERT/UPDATE*: `auth.uid() = user_id` (Solo acceso a datos del propio usuario).
*   [x] **Tabla `public.achievements`**: RLS activado.
    *   *Política SELECT*: Lectura abierta a autenticados para mostrar el catálogo general.
*   [x] **Tabla `public.user_achievements`**: RLS activado.
    *   *Política SELECT*: `auth.uid() = user_id` (Solo el propio usuario ve sus logros desbloqueados).

> [!WARNING]
> Nunca uses la clave `service_role` en el código del lado del cliente. Esta clave se salta todas las políticas RLS y da acceso total de lectura/escritura a la base de datos.

---

## 2. Configuración de Autenticación (Supabase Auth)
Para asegurar que los redireccionamientos de autenticación (login, recuperación, confirmación de correo) funcionen correctamente en el servidor de producción:

### URLs de Redirección Autorizadas:
1.  Ve a **Authentication > Provider Settings** en el panel de Supabase.
2.  Configura la **Site URL**:
    *   `https://eus-sigma.vercel.app` (o tu dominio personalizado de producción).
3.  Añade a **Redirect URLs**:
    *   `http://localhost:3000/**` (para desarrollo local).
    *   `https://eus-sigma.vercel.app/**` (para tu entorno de producción).
    *   `https://eus-sigma.vercel.app/auth/callback` (endpoint específico para el intercambio del código de sesión).

### Confirmación por Correo Electrónico (Email Confirmation):
*   [ ] **Activar Email Confirmation**: Asegura que el interruptor *Confirm Email* esté activado en **Authentication > Providers > Email**. Esto previene el registro de cuentas falsas.
*   [ ] **Configurar Plantillas de Correo (Email Templates)**:
    *   En la plantilla *Confirm signup*, asegúrate de que el enlace de redirección apunte al callback de tu app:
        `{{ .SiteURL }}/auth/callback?next=/dashboard` o directamente a tu URL de producción si es fija.

---

## 3. Límites de Rate Limit e Infraestructura
*   [ ] **Límites de correo**: Por defecto, Supabase utiliza un proveedor de correo interno con un límite estricto (generalmente 3 o 4 correos por hora). Para producción, configura tu propio servicio SMTP (SendGrid, Resend, Mailgun) en **Settings > Auth** para evitar fallos en el envío de correos de confirmación.
*   [ ] **Seguridad del JWT**: Asegura que el tiempo de vida por defecto de los tokens de sesión (generalmente 3600 segundos/1 hora) es el adecuado para mantener segura la app.
