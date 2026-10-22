# FP Conecta v2 — base funcional y técnica

## Decisiones acordadas
- **Plataforma del prototipo:** Supabase Free para pruebas técnicas con datos ficticios. No se considera una aprobación de producción.
- Usuarios iniciales: administración/coordinación FP, tutores y empresas validadas.
- Alumnado: portal pospuesto a fase 2.
- Asignación: sugerencias automáticas explicables; el tutor conserva la decisión final.
- Alcance funcional: todos los ciclos del centro, con despliegue gradual y datos de prueba.
- Cambios de infraestructura y código permanecen en la rama de revisión; no fusionar a `main` sin autorización.

## Arquitectura objetivo del prototipo
- Interfaz web modular.
- API/backend como única vía para operaciones de negocio.
- PostgreSQL gestionado en Supabase para desarrollo y pruebas, pendiente de crear/configurar el proyecto.
- Supabase Auth como candidato para la autenticación gestionada del prototipo; issuer, audience, JWKS, políticas de MFA y ciclo de vida de cuentas deben configurarse y probarse antes de habilitar rutas protegidas.
- Almacenamiento privado para documentos, si se habilita y tras diseñar permisos.
- Entornos separados de desarrollo, pruebas y producción; producción no se habilita por esta decisión.
- No exponer la clave `service_role` ni secretos del servidor en el navegador o en el repositorio.

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
- Las políticas PostgreSQL Row Level Security (RLS) se diseñarán y probarán antes de exponer cualquier tabla a clientes; RLS complementa, no sustituye, la autorización de la API.

## Protección de datos y seguridad — bloqueos previos a producción
- Validación del responsable del tratamiento y del DPD.
- Evaluación documentada del proveedor, región del proyecto, DPA, subencargados, transferencias, exportación y eliminación.
- Definición de base jurídica, información a las personas, plazos de conservación y procedimiento de derechos.
- Autenticación individual y MFA para perfiles privilegiados.
- Pruebas de aislamiento entre ciclos, usuarios y empresas.
- Registro restringido de operaciones relevantes, sin registrar contraseñas, tokens ni contenido sensible innecesario.
- Cifrado en tránsito, secretos fuera del repositorio, copias y prueba de restauración.
- Datos ficticios únicamente en desarrollo y pruebas.
- Confirmar límites del plan Free, pausa por inactividad, retención y recuperación antes de depender de él para cualquier servicio operativo.

## Fases
- **Fase 1A:** proyecto Supabase de prueba, decisiones de región/configuración, modelo de datos, autenticación, permisos y entornos.
- **Fase 1B:** ciclos, periodos, empresas, plazas y convenios.
- **Fase 1C:** matching explicable, revisión y confirmación por tutor.
- **Fase 1D:** pruebas, formación, aprobación y decisión explícita sobre producción.
- **Fase 2:** portal del alumnado, tras revisión específica de privacidad y permisos.

## Criterios de aceptación
- Un usuario no puede acceder a datos fuera de su ámbito aunque manipule una URL o petición.
- La capacidad de una plaza se valida en el servidor y ante operaciones concurrentes.
- Las sugerencias exponen razones y versión de reglas.
- Toda confirmación o cambio de asignación deja un historial.
- Existe una prueba documentada de restauración.
- La producción no se habilita hasta obtener las aprobaciones institucionales necesarias.

## Pendientes
1. Crear el proyecto Supabase Free para pruebas y confirmar región y configuración; no se ha creado desde este repositorio.
2. Configurar y validar Supabase Auth/OIDC y los permisos por rol/ámbito.
3. Revisar el esquema SQL y crear políticas RLS con pruebas negativas.
4. Catálogo oficial de ciclos y periodos que se importará.
5. Reglas de elegibilidad, criterios de matching y tratamiento de excepciones.
6. Política de documentos, conservación y auditoría.
7. Evaluación institucional/DPD antes de usar datos reales o habilitar producción.

## Estado
Este documento y la migración SQL inicial son artefactos de diseño. La decisión de usar Supabase se limita al prototipo; no crea un proyecto, no despliega el backend, no configura autenticación y no autoriza el tratamiento de datos reales.
