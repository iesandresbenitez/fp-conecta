# Comparativa de alojamiento para FP Conecta v2

**Estado: evaluación preliminar; no se ha seleccionado proveedor.** Los precios y condiciones cambian. Las cifras indicadas son referencias públicas consultadas el 22 de octubre de 2026, no una oferta contractual ni un coste total garantizado.

## Resumen ejecutivo

| Opción | Ventajas | Costes y mantenimiento | Identidad | Riesgos / comprobaciones |
|---|---|---|---|---|
| **Supabase gestionado** | PostgreSQL, Auth y almacenamiento en una plataforma; reduce integración inicial. | Plan Pro anunciado desde USD 25/mes; cómputo adicional y exceso de cuotas pueden aumentar el total. La aplicación sigue necesitando pruebas, configuración segura y mantenimiento. | Incluye autenticación gestionada; revisar MFA disponible, recuperación, sesiones y ciclo de vida de cuentas. | Confirmar región del proyecto, DPA, subencargados, transferencias, copias, retención de logs y controles de acceso. RLS y políticas deben diseñarse y probarse; no confiar solo en la UI. |
| **Render: servicio web + PostgreSQL** | Despliegue desde GitHub, servicios gestionados y base de datos PostgreSQL gestionada. | Workspace Hobby gratuito para pruebas; el plan Pro se anuncia desde USD 25/mes más cómputo. App y base de datos se facturan por separado; el coste depende de instancias, almacenamiento y tráfico. | Se necesita un proveedor de identidad de aplicación por separado; la autenticación OIDC del workspace no equivale a autenticación de usuarios finales. | Confirmar región disponible y contratada, condiciones de tratamiento, controles de red, copias y recuperación. Evitar planes gratuitos para producción. |
| **Microsoft Azure: App Service + Azure Database for PostgreSQL** | Opciones empresariales, integración con Microsoft Entra y controles de red, identidad y gobierno. | Precio por cómputo, almacenamiento, copias y servicios adicionales; usar calculadora con región y tamaño concretos. Más opciones implican mayor configuración. | Microsoft Entra External ID u otra identidad institucional, sujeto a compatibilidad y licencia. | Requiere diseño de permisos, configuración de red/identidad, evaluación contractual y estimación de costes; no es automáticamente seguro por ser empresarial. |
| **Proveedor institucional aprobado** | Puede encajar con las políticas y contratos de la administración educativa, y facilitar la gobernanza. | Depende del servicio disponible, soporte, capacidad y acuerdos institucionales. | Preferible reutilizar identidad institucional si está autorizada y soportada. | Confirmar que admite el despliegue, PostgreSQL, copias, monitorización, segregación de entornos y soporte operativo. |

## Referencias oficiales consultadas

- Supabase pricing: https://supabase.com/pricing
- Supabase billing: https://supabase.com/docs/guides/platform/billing-on-supabase
- Render pricing: https://render.com/pricing
- Render Postgres: https://render.com/docs/postgresql
- Render free services (sus limitaciones excluyen producción): https://render.com/docs/free
- Azure Database for PostgreSQL: https://learn.microsoft.com/en-us/azure/postgresql/configure-maintain/overview-postgres-choose-server-options
- Azure PostgreSQL pricing: https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/

## Recomendación para el prototipo

Evaluar **Supabase y Azure** como primeras opciones, sin aprobar todavía ninguna:
- Supabase reduce el trabajo de integración y puede acelerar un piloto técnico; hay que validar el modelo de permisos, la región, el contrato y los requisitos de identidad.
- Azure puede ser preferible si el centro ya tiene gobierno, contratos, identidad o soporte institucional Microsoft; su coste y complejidad deben estimarse con una configuración real.
- Render es una alternativa razonable para prototipos y despliegues simples, pero añade la elección y operación de un proveedor de identidad separado.

No usar la disponibilidad de un plan gratuito como criterio de producción. No subir datos reales hasta que el centro y el DPD hayan revisado y autorizado el proveedor y la configuración.

## Matriz de decisión que debe completar el centro

Puntuar cada opción de 1 (débil) a 5 (fuerte), adjuntando evidencia contractual/técnica. Los pesos son una propuesta y deben aprobarse antes de usar el resultado.

| Criterio | Peso sugerido | Evidencia necesaria |
|---|---:|---|
| Privacidad, DPA y transferencias | 25% | Contrato, subencargados, ubicación, transferencias, eliminación y exportación |
| Seguridad y control de acceso | 25% | MFA, roles, logs, gestión de incidentes, cifrado, red y pruebas |
| Identidad institucional / cuentas | 15% | OIDC/SAML disponible, recuperación de cuentas, baja de personal |
| Copias y recuperación | 15% | Retención, RPO/RTO acordados y restauración probada |
| Coste total | 10% | Presupuesto anual con soporte, cómputo, base de datos, logs, tráfico e impuestos |
| Mantenimiento y portabilidad | 10% | Actualizaciones, soporte, exportación estándar y plan de salida |

La ponderación no sustituye a los requisitos obligatorios: una opción que no supere privacidad, seguridad o aprobación institucional debe descartarse aunque obtenga una puntuación total alta.
