# Preparar Supabase para FP Conecta (prototipo)

Esta guía crea una base de pruebas. Usar únicamente datos ficticios. No introducir datos reales de alumnado ni documentos reales.

## 1. Crear el proyecto
1. Entrar en https://supabase.com/dashboard e iniciar sesión o crear una cuenta institucional/de proyecto aprobada por el centro.
2. Crear un proyecto nuevo llamado, por ejemplo, `fp-conecta-dev`.
3. Elegir una región tras revisar su disponibilidad y las necesidades de protección de datos; anotar la decisión para revisión institucional.
4. Guardar la contraseña de la base de datos en un gestor de contraseñas. No subirla a GitHub ni compartirla en el chat.
5. Esperar a que termine la creación y abrir Project Settings.

## 2. Configuración local
- Copiar `backend/.env.example` como `backend/.env` en el entorno local.
- Rellenar `SUPABASE_URL` y la clave publicable/anon si la integración la necesita.
- Guardar `DATABASE_URL` únicamente en el entorno local ignorado por Git o en un gestor de secretos. Preferir una cadena de conexión apropiada para el entorno (pooler/directa según el caso) y seguir las instrucciones del panel.
- No copiar aquí claves secretas ni tokens. No utilizar la clave `service_role` en navegador ni en el repositorio.
- Los valores `AUTH_ISSUER`, `AUTH_AUDIENCE` y `AUTH_JWKS_URL` deben verificarse en la configuración real de Auth/JWT. No habilitar rutas protegidas hasta probar la validación de firma, issuer, audience y algoritmo con tokens de prueba.

## 3. Esquema y permisos
1. Revisar `database/migrations/001_initial_schema.sql`.
2. Ejecutar la migración solo en el proyecto de desarrollo tras revisión técnica.
3. Antes de conectar datos a la interfaz, diseñar políticas RLS de mínimo privilegio para cada tabla expuesta.
4. Implementar autorización en la API por rol y ámbito; RLS no sustituye las comprobaciones de negocio del servidor.
5. Añadir pruebas de integración para acceso permitido, acceso denegado, aislamiento entre ciclos/empresas y capacidad concurrente.
6. Comprobar exportación y restauración con datos ficticios.

## 4. Límites y condiciones
- El proyecto no queda creado por este documento; una persona con acceso a Supabase debe crearlo y guardar sus credenciales de forma segura.
- El plan gratuito tiene cuotas y restricciones operativas. Revisar https://supabase.com/pricing y https://supabase.com/docs/guides/platform/billing-on-supabase.
- No usar el proyecto de prototipo para producción.
- Antes de producción, el centro y el DPD deben revisar proveedor, región, contrato/DPA, subencargados, transferencias, conservación, eliminación, copias, restauración y controles de acceso.
