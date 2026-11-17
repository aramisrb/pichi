# Verificación de Pichi · revisión v2

La versión de 512 px y sus controles están implementados. La revisión vigente está en [el informe](revision-v2/INFORME.md), con [referencias y tiempos](revision-v2/REFERENCIAS.md), [métricas completas](revision-v2/metricas.json) y [visor local](revision-v2/reproductor.html).

**La aprobación visual en movimiento sigue pendiente.** Se han inspeccionado imágenes y secuencias estáticas; no se han observado cinco ciclos consecutivos a velocidad normal y reducida en un navegador. Las pruebas JavaScript usan un DOM simulado. Los MP4 exportados no acreditan que se hayan visto.

El acceso al navegador no estuvo disponible mediante la herramienta de control visual. El intento posterior de seleccionar el Explorador del proyecto agotó el tiempo de aprobación. No se declara comprobada la reproducción local renderizada, GitHub Pages, descarga real ni rendimiento del navegador. Los manifiestos conservan `visualApproval: pending-v2-playback-review` y las métricas `visual_pass: null`.

La revisión anterior de 256 px se conserva en `trabajo/version-anterior-20261117/VERIFICACION.md`; sus resultados no se aplican a esta versión.
