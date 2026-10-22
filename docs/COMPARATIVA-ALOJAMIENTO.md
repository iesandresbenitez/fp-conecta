# Comparativa de alojamiento para FP Conecta v2

**Decisión actual:** Supabase Free para prototipo y pruebas exclusivamente con datos ficticios. **No es una selección ni autorización para producción.** La evaluación institucional de producción sigue pendiente.

Los precios y condiciones cambian; revisar siempre las páginas oficiales antes de decidir.

## Estado de las opciones

| Opción | Papel en FP Conecta | Costes y mantenimiento | Comprobaciones |
|---|---|---|---|
| **Supabase Free** | Elegido para prototipo técnico; PostgreSQL y autenticación gestionada en una plataforma. | 0 USD/mes dentro de cuotas y condiciones del plan. Tiene límites, puede pausar proyectos inactivos y no debe tratarse como servicio de producción con garantías operativas. | Crear proyecto manualmente; confirmar región, DPA, subencargados, transferencias, copias, recuperación, límites, MFA y políticas RLS. |
| **Supabase Pro** | Posible evolución, no aprobado. | La tarifa publicada parte de USD 25/mes; cómputo y otros consumos pueden modificar el coste total. | Estimar coste real, copias, soporte, límites y requisitos contractuales. |
| **Render: servicio web + PostgreSQL** | Alternativa si se separa el backend del proveedor de base de datos. | App y base de datos se facturan según planes y recursos; el plan gratuito tiene restricciones que lo excluyen como base para producción. | Región, contrato, identidad, copias, recuperación y coste total. |
| **Microsoft Azure: App Service + Azure Database for PostgreSQL** | Alternativa a evaluar si encaja con gobierno e identidad institucional. | Coste según cómputo, almacenamiento, copias, región y servicios añadidos. | Identidad, red, contratos, soporte, estimación y configuración. |
| **Proveedor institucional aprobado** | Alternativa prioritaria para consultar con el centro si existe servicio disponible. | Depende de capacidad, soporte y acuerdos vigentes. | Compatibilidad con PostgreSQL, copias, identidad, segregación y responsabilidades operativas. |

## Referencias oficiales
- Supabase pricing: https://supabase.com/pricing
- Supabase billing: https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Render pricing: https://render.com/pricing
- Render Postgres: https://render.com/docs/postgresql
- Azure Database for PostgreSQL: https://learn.microsoft.com/en-us/azure/postgresql/configure-maintain/overview-postgres-choose-server-options
- Azure PostgreSQL pricing: https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/

## Límites de la decisión
- Supabase Free se usa solo para desarrollo y pruebas con datos ficticios.
- No se ha creado el proyecto ni se han configurado claves o proveedores de identidad.
- No incluir secretos, contraseñas, tokens ni claves `service_role` en GitHub ni en el frontend.
- No conectar el frontend directamente a tablas hasta diseñar y probar RLS; la API debe aplicar autorización por rol y ámbito.
- Antes de producción, el centro y el DPD deben revisar ubicación, contrato/DPA, subencargados, transferencias, conservación, exportación/eliminación, copias, restauración y controles de acceso.
- No usar un plan gratuito para producción sin una aprobación expresa y una evaluación documentada de los riesgos y las necesidades operativas.

## Próximos pasos técnicos
1. El responsable del proyecto crea el proyecto Supabase en su cuenta y comparte únicamente los valores públicos/no secretos necesarios para configurar el entorno.
2. Añadir variables de entorno localmente, sin subir archivos `.env`.
3. Revisar y aplicar la migración en el proyecto de prueba.
4. Diseñar y probar RLS y autorización de API antes de añadir endpoints de datos.
5. Ejecutar pruebas de integración con datos ficticios y documentar exportación/restauración.
