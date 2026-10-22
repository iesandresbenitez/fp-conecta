# Preparar Supabase para FP Conecta (prototipo)

Esta guía prepara una base de pruebas. Usar únicamente datos ficticios. No introducir datos reales de alumnado ni documentos reales.

## 1. Proyecto y credenciales
1. Abrir https://supabase.com/dashboard y usar una cuenta institucional/de proyecto aprobada por el centro.
2. Seleccionar el proyecto de pruebas ya creado y confirmar que se está trabajando en el proyecto correcto antes de ejecutar SQL.
3. Guardar la contraseña de la base de datos en un gestor de contraseñas. No subirla a GitHub ni compartirla en el chat.
4. Revisar la región y dejar anotada la decisión para revisión institucional y del DPD antes de cualquier uso real.

## 2. Configuración local
- Copiar `backend/.env.example` como `backend/.env` en el entorno local.
- Configurar `SUPABASE_URL` con la URL del proyecto y la clave publicable solo en el entorno donde sea necesaria.
- Guardar `DATABASE_URL` únicamente en el entorno local ignorado por Git o en un gestor de secretos. Elegir conexión directa o pooler según el entorno y las indicaciones del panel.
- No compartir claves ni tokens en el chat, incidencias o capturas. Nunca usar `service_role` en el navegador ni guardarla en el repositorio.
- Verificar los valores reales de `AUTH_ISSUER`, `AUTH_AUDIENCE` y `AUTH_JWKS_URL` en la configuración de Auth/JWT. No habilitar rutas protegidas hasta probar firma, issuer, audience y algoritmo con tokens ficticios de prueba.

## 3. Esquema y acceso seguro
1. Revisar `database/migrations/001_initial_schema.sql`; contiene el esquema de partida y **no activa RLS por sí sola**.
2. En el proyecto de pruebas, aplicar primero la migración inicial tras revisión técnica.
3. Aplicar después `database/migrations/002_enable_rls_deny_by_default.sql`. Activa RLS en las tablas y no crea políticas: el acceso mediante los roles API queda bloqueado por defecto hasta definir políticas explícitas.
4. Comprobar en Supabase que RLS está activado en todas las tablas de la migración y que las consultas de los roles API no devuelven datos sin políticas. No añadir políticas permisivas temporales para “hacer que funcione”.
5. Antes de exponer tablas a una interfaz, diseñar políticas RLS de mínimo privilegio por rol y ámbito; probar acceso permitido y denegado, aislamiento entre ciclos/empresas y cambios de rol.
6. Implementar autorización equivalente en la API. RLS no sustituye las comprobaciones de negocio del servidor. No añadir endpoints de datos hasta que existan autorización y pruebas de integración.
7. La API actual todavía no conecta a PostgreSQL ni resuelve roles. No usar una conexión privilegiada como atajo para saltarse RLS; definir primero el modelo de permisos y la estrategia de conexión.
8. Probar exportación y restauración solo con datos ficticios.

## 4. Límites y condiciones
- Esta guía no aplica migraciones ni modifica por sí misma el proyecto remoto.
- Supabase Free es solo para el prototipo. Revisar cuotas y restricciones en https://supabase.com/pricing y https://supabase.com/docs/guides/platform/billing-on-supabase.
- No usar el proyecto de prototipo para producción.
- Antes de producción, el centro y el DPD deben revisar proveedor, región, contrato/DPA, subencargados, transferencias, conservación, eliminación, copias, restauración y controles de acceso.
