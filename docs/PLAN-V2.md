# FP Conecta v2 — base funcional y técnica

## Decisiones acordadas
- Alojamiento: servicio cloud gestionado, pendiente de evaluación y aprobación institucional.
- Usuarios iniciales: administración/coordinación FP, tutores y empresas validadas.
- Alumnado: portal pospuesto a fase 2.
- Asignación: sugerencias automáticas explicables; el tutor conserva la decisión final.
- Alcance funcional: todos los ciclos del centro, con despliegue gradual y datos de prueba.

## Arquitectura objetivo
- Interfaz web modular.
- API/backend como única vía para operaciones de negocio.
- PostgreSQL gestionado, condicionado a la revisión del proveedor.
- Proveedor de identidad gestionado o identidad institucional aprobada; no implementar almacenamiento casero de contraseñas.
- Almacenamiento privado para documentos, si se habilita.
- Entornos separados de desarrollo, pruebas y producción.

La interfaz estática actual puede servir de referencia visual, pero el almacenamiento local del navegador no es una base de datos compartida y no es apto para datos personales de alumnado.

## Alcance de la primera versión real
1. Catálogos de ciclos y periodos.
2. Usuarios, roles y permisos por ámbito.
3. Empresas y proceso de validación.
4. Plazas con requisitos, capacidad y vigencia.
5. Convenios y documentación administrativa.
6. Sugerencias explicables y flujo de revisión del tutor.
7. Asignaciones confirmadas e historial.
8. Auditoría, exportación controlada, copias y recuperación.

## Reglas de negocio esenciales
- Ninguna sugerencia crea una asignación definitiva.
- Solo el tutor autorizado puede confirmar o cambiar una asignación.
- El servidor valida todos los permisos; ocultar controles en la interfaz no es autorización.
- Las empresas solo consultan su propia ficha y los datos expresamente autorizados.
- Las plazas no pueden superar su capacidad.
- Los resultados de matching guardan versión de reglas y explicación.
- Las reglas de elegibilidad y ponderaciones deben ser aprobadas y documentadas por el centro.
- No usar datos sensibles ni inferencias sensibles para puntuar candidaturas.

## Protección de datos y seguridad — bloqueos previos a producción
- Validación del responsable del tratamiento y del DPD.
- Evaluación documentada del proveedor, ubicación de datos, subencargados, contrato, transferencias, exportación y eliminación.
- Definición de base jurídica, información a las personas, plazos de conservación y procedimiento de derechos.
- Autenticación individual y MFA para perfiles privilegiados.
- Pruebas de aislamiento entre ciclos, usuarios y empresas.
- Registro restringido de operaciones relevantes, sin registrar contraseñas, tokens ni contenido sensible innecesario.
- Cifrado en tránsito, secretos fuera del repositorio, copias y prueba de restauración.
- Datos ficticios únicamente en desarrollo y pruebas.

## Fases
- **Fase 1A:** decisiones de infraestructura, modelo de datos, autenticación, permisos y entornos.
- **Fase 1B:** ciclos, periodos, empresas, plazas y convenios.
- **Fase 1C:** matching explicable, revisión y confirmación por tutor.
- **Fase 1D:** pruebas, formación, aprobación y despliegue.
- **Fase 2:** portal del alumnado, tras revisión específica de privacidad y permisos.

## Criterios de aceptación
- Un usuario no puede acceder a datos fuera de su ámbito aunque manipule una URL o petición.
- La capacidad de una plaza se valida en el servidor y ante operaciones concurrentes.
- Las sugerencias exponen razones y versión de reglas.
- Toda confirmación o cambio de asignación deja un historial.
- Existe una prueba documentada de restauración.
- La producción no se habilita hasta obtener las aprobaciones institucionales necesarias.

## Pendientes que bloquean decisiones de implementación
1. Proveedor cloud y región/ubicación contractual.
2. Proveedor de identidad e integración institucional disponible.
3. Catálogo oficial de ciclos y periodos que se importará.
4. Reglas de elegibilidad, criterios de matching y tratamiento de excepciones.
5. Política de documentos, conservación y auditoría.

## Estado
Este documento y la migración SQL inicial son artefactos de diseño. No crean un backend desplegado, no configuran autenticación y no autorizan el tratamiento de datos reales.
