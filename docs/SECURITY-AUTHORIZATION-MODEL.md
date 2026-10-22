# Modelo de autorización y vinculación de cuentas — FP Conecta v2

Estado: propuesta de implementación incremental. Esta documentación y la migración asociada no significan que el sistema esté listo para producción. La migración no se ha ejecutado en ningún proyecto remoto.

## Principios obligatorios

1. Denegar por defecto si no se puede verificar identidad, estado, rol, ámbito o relación con el recurso.
2. La firma JWT válida solo demuestra identidad. En cada petición protegida, consultar el estado vigente de la cuenta y los permisos en el servidor.
3. Nunca confiar en IDs de alumno, ciclo, empresa, rol o usuario suministrados por el cliente.
4. No exponer datos de negocio hasta tener autorización en API, RLS revisado y pruebas negativas.
5. No usar claves privilegiadas en el navegador ni saltarse RLS mediante una conexión privilegiada sin un diseño revisado.
6. No eliminar expedientes al desactivar cuentas. Mantener historial de revocación y auditoría.
7. No almacenar tokens de invitación en claro: generar un token aleatorio de alta entropía, enviar el token una sola vez y guardar solo su SHA-256 en minúsculas hexadecimales.
8. No incluir tokens, contraseñas, cabeceras de autorización ni datos académicos completos en logs.

## Relaciones propuestas

- `app_users.identity_subject` identifica la identidad externa y debe seguir siendo única.
- `student_account_links` relaciona una cuenta interna con un expediente. Los índices parciales impiden más de una vinculación activa por cuenta o expediente y permiten conservar historial revocado.
- `account_invitations` representa una invitación de activación ligada a un único expediente y a un correo verificado por el centro.
- Las tablas nuevas tienen RLS habilitado y ninguna política permisiva: siguen inaccesibles para roles API hasta que se diseñen y prueben las políticas explícitas.

## Emisión y consumo de invitaciones

1. Solo administración autorizada o tutor autorizado del ciclo puede emitir/revocar invitaciones.
2. El servidor obtiene el expediente y el ámbito del usuario desde la base de datos; no acepta la autorización basándose en el ciclo enviado por el cliente.
3. El correo se confirma por el centro antes de emitir la invitación. El alumno no puede cambiarlo durante la activación.
4. La invitación tiene caducidad, un token aleatorio de un solo uso y estado pendiente/consumido/revocado/expirado.
5. Consumirla requiere verificar token, hash, estado pendiente, caducidad y coincidencia del correo verificado por el proveedor de identidad.
6. El consumo, la creación de cuenta si procede, la vinculación activa y el registro de auditoría deben ocurrir atómicamente en una transacción.
7. Repetir el consumo debe fallar sin revelar si un expediente o correo existe.
8. Cambiar el correo tras perder acceso al correo personal es un proceso manual del centro con verificación de identidad, auditoría y nueva invitación. No se modifica el correo durante el flujo de activación.

## Autorización por rol y ámbito

- Alumno: solo su expediente activo, competencias, asignaciones y documentos expresamente autorizados.
- Tutor: solo ciclos asignados; datos académicos y operativos permitidos. No cambia datos identificativos, vínculos, roles ni permisos.
- Administrador FP: funciones administrativas autorizadas, incluidos vínculos, roles, ciclos, reactivación y archivo.
- Usuario de empresa: solo asignaciones y datos mínimos de su empresa validada. La empresa se deriva de la membresía vigente del servidor, no de un `company_id` enviado por el cliente.
- Expedientes archivados: lectura administrativa; tutor solo con ciclo asignado, necesidad académica justificada y motivo obligatorio auditado. No se permiten cambios ordinarios; las correcciones excepcionales requieren flujo de aprobación.
- Desactivación: comprobar estado vigente en cada petición protegida y revocar sesiones/refresh tokens según las capacidades del proveedor. Una firma JWT válida no debe reactivar el acceso.

## Auditoría

Los eventos deben registrar UTC, actor, acción, tipo/ID de recurso, resultado, request ID y motivo cuando corresponda. Nunca registrar tokens, secretos ni el contenido íntegro del expediente. Los eventos deben insertarse mediante operaciones controladas de servidor; los usuarios de aplicación no pueden editarlos ni borrarlos. El trigger append-only añadido en la migración no protege contra un propietario técnico de base de datos comprometido; se requiere separación de privilegios y valorar una copia externa de eventos críticos.

## Condiciones previas a habilitar datos

- Diseñar y revisar políticas RLS para todas las tablas, incluidas relaciones y tablas hijas.
- Implementar repositorio de autorización en servidor y operaciones transaccionales para invitaciones/vínculos.
- Añadir pruebas de integración negativas: alumno cruzado, tutor fuera de ciclo, empresa cruzada, cuenta desactivada, invitación caducada/reutilizada/revocada, vínculo duplicado, RLS sin sesión y auditoría no disponible.
- Probar revocación de sesiones, almacenamiento privado de documentos, análisis antimalware, restauración de copias y aplicación de revocaciones tras restaurar.
- Revisar configuración del proveedor, región, contrato/DPA, conservación y obligaciones con el centro y el DPD.

## Estado de implementación

La API actual valida JWT y expone `/api/v1/me`, pero todavía no implementa autorización de negocio ni endpoints de expedientes. La migración 003 añade estructura de vinculación/invitaciones y protección append-only de auditoría; no implementa por sí sola el envío de correo, la activación, la revocación de sesiones ni las políticas RLS de negocio. No se debe afirmar que esas funciones están implementadas hasta que exista código y pruebas verificadas.
