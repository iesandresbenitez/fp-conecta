# API inicial de FP Conecta v2

## Estado
Scaffold de desarrollo. Supabase Free es el destino elegido para el prototipo, pero el proyecto Supabase debe crearse y configurarse manualmente. Aún no hay conexión a base de datos, roles, autorización por ciclo/empresa ni endpoints de negocio. No desplegar como servicio de producción.

## Requisitos
- Node.js 22 o superior.
- Proyecto Supabase de pruebas con datos ficticios.
- Configuración OIDC/JWT aprobada y validada antes de habilitar rutas protegidas.
- No usar cuentas, tokens o datos personales reales en pruebas locales.

## Desarrollo
1. Copiar .env.example a .env y configurar solo los valores del proyecto de pruebas.
2. Ejecutar npm install.
3. Ejecutar npm run dev.
4. /health/live comprueba que el proceso está activo.
5. /health/ready y /api/v1/me no quedan habilitados hasta configurar el proveedor de identidad.
6. npm run build comprueba tipos; npm test ejecuta pruebas automatizadas.

## Integración Supabase — siguiente paso
- Crear manualmente un proyecto de prueba en https://supabase.com/dashboard.
- Guardar la cadena de conexión de PostgreSQL y las credenciales en variables locales/gestor de secretos; nunca en Git.
- Aplicar la migración solo tras revisarla.
- Implementar roles y autorización por ámbito en la API y políticas RLS; probar denegaciones además de accesos permitidos.
- La clave `service_role` es secreta y nunca debe usarse en el navegador. No añadir endpoints de datos hasta tener permisos y pruebas.
- No asumir que Supabase Auth configura automáticamente la API actual: hay que verificar issuer, audience, JWKS y claims reales y ajustar el middleware con pruebas.

## Seguridad
- La validación JWT comprueba firma, issuer, audience y algoritmo permitido.
- No se aceptan tokens si falta configuración; comportamiento fail-closed.
- El endpoint /api/v1/me devuelve únicamente el subject, no el token ni las claims.
- La autenticación NO equivale a autorización. Antes de añadir endpoints de datos se debe implementar consulta de usuario/roles, permisos por ámbito, revocación/baja, protección de abuso y pruebas de aislamiento.
- Configurar MFA, políticas de recuperación, sesiones y baja de cuentas en el proveedor de identidad, y verificarlo antes de producción.
- No registrar encabezados Authorization, contraseñas, tokens ni cuerpos sensibles.
- No añadir credenciales al repositorio. Los secretos deben vivir fuera del código, en entorno local ignorado por Git o gestor de secretos.
