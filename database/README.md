# Esquema inicial de datos — FP Conecta v2

Este directorio contiene la primera propuesta de esquema relacional para PostgreSQL. Supabase Free es el destino de prueba elegido, exclusivamente con datos ficticios.

## Aplicación
Revisar migrations/001_initial_schema.sql con el equipo técnico antes de aplicarla en el proyecto de prueba. La migración requiere una versión de PostgreSQL que disponga de gen_random_uuid(); en instalaciones que lo requieran, habilitar la extensión autorizada por el administrador de la base de datos.

## Advertencias
- Es un esquema inicial, no una aplicación desplegada.
- No incluye todavía autenticación, autorización de API ni políticas de seguridad por fila (RLS).
- Antes de exponer tablas a un cliente, diseñar políticas RLS de mínimo privilegio y probar accesos permitidos y denegados.
- El servidor debe validar permisos en cada operación. No conectar una interfaz pública directamente a tablas sin una política de seguridad revisada.
- La capacidad total de plazas debe controlarse transaccionalmente en el backend; no basta con una validación visual.
- El índice de asignaciones activas es una protección inicial, no sustituye la lógica de negocio ni la revisión de estados.
- El diseño de los datos identificativos del alumnado queda deliberadamente minimizado y debe concretarse con el centro y el DPD.
- No usar datos reales en desarrollo/pruebas ni ejecutar en producción antes de revisar la migración y las obligaciones de protección de datos.
- No almacenar claves de servicio ni cadenas de conexión en el repositorio.
