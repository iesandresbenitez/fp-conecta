# API inicial de FP Conecta v2

## Estado
Scaffold de desarrollo para comenzar la validación de tokens OIDC/JWT de un proveedor de identidad gestionado. No hay todavía acceso a base de datos, roles, autorización por ciclo/empresa ni endpoints de negocio. No desplegar como servicio de producción.

## Requisitos
- Node.js 22 o superior.
- Un proveedor OIDC aprobado y configuración real de issuer, audience y JWKS URL.
- No usar cuentas, tokens o datos personales reales en pruebas locales.

## Desarrollo
1. Copiar .env.example a .env y configurar solo un proveedor de pruebas autorizado.
2. Ejecutar npm install.
3. Ejecutar npm run dev.
4. /health/live comprueba que el proceso está activo.
5. /health/ready y /api/v1/me no quedan habilitados hasta configurar el proveedor de identidad.
6. npm run build comprueba tipos; npm test ejecuta pruebas automatizadas.

## Seguridad
- La validación JWT comprueba firma, issuer, audience y algoritmo permitido.
- No se aceptan tokens si falta configuración; comportamiento fail-closed.
- El endpoint /api/v1/me devuelve únicamente el subject, no el token ni las claims.
- La autenticación NO equivale a autorización. Antes de añadir endpoints de datos se debe implementar consulta de usuario/roles, permisos por ámbito, revocación/baja, protección de abuso y pruebas de aislamiento.
- Configurar MFA, políticas de recuperación, sesiones y baja de cuentas en el proveedor de identidad, y verificarlo antes de producción.
- No registrar encabezados Authorization, contraseñas, tokens ni cuerpos sensibles.
- No añadir credenciales al repositorio. Los secretos de producción deben vivir en el gestor de secretos de la plataforma elegida.
