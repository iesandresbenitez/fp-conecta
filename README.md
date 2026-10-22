# FP Conecta · IES Andrés Benítez

Prototipo web estático para explorar la gestión de perfiles de alumnado de Formación Profesional y empresas colaboradoras.

## Funciones de esta demo

- Resumen con estadísticas básicas.
- Alta y consulta de perfiles ficticios de alumnado.
- Registro de empresas colaboradoras.
- Asignaciones de ejemplo y seguimiento de estado.
- Vista de demostración del portal de empresas.
- Guardar cambios en el almacenamiento local del navegador.
- Importar y exportar los datos en formato JSON.

## Probar en local

Abre `index.html` en un navegador moderno. No necesita instalación, dependencias ni servidor.

## Publicar con GitHub Pages

1. En el repositorio, abre **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Guarda los cambios si GitHub te lo solicita.
4. En la pestaña **Actions**, comprueba la ejecución del flujo **Deploy to GitHub Pages**.
5. Cuando termine correctamente, la aplicación estará en:

   https://iesandresbenitez.github.io/fp-conecta/

El flujo de trabajo está en `.github/workflows/pages.yml`.

## Limitaciones importantes

Esta es una demostración sin servidor ni autenticación real. Los datos se guardan únicamente en el navegador que los introduce; no se comparten automáticamente entre el centro y las empresas. No introduzcas nombres reales, datos de contacto, expedientes, información sensible ni datos personales del alumnado.

Para un uso real con varios usuarios será necesario añadir autenticación, una base de datos compartida, permisos por rol, copias de seguridad y las garantías de protección de datos correspondientes.
