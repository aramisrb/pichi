# Revisión de las siete animaciones · 17 de noviembre de 2026

**Estado: cambios implementados para revisión; aprobación visual temporal pendiente.** No se declara que las siete acciones cumplan todavía todos los criterios de naturalidad, identidad y cierre imperceptible.

## Comprobaciones ejecutadas

- Inspección de `index.html`, ambos manifiestos, estructura real de `animaciones/`, poses y las seis fotografías originales. Se vieron las fotografías completas y hojas de todas las poses anteriores. La inspección inicial fue estática: no se consiguió visualizar las animaciones originales en movimiento antes de modificarlas.
- Generación con ImageGen de siete hojas a partir de fotografías originales y una edición de transparencia para dos patas. Se aceptaron cinco acciones nuevas. Se rechazaron las carreras nuevas por artefactos de patas; se reutilizan 30 poses frontales y las primeras 18 laterales. Se excluyó el tramo lateral posterior, incompleto y con deriva vertical y recortes.
- Decodificación de los 1.260 PNG finales: numeración completa, RGBA, 256 × 256, alfa cero en el fondo y contenido opaco. Margen mínimo del contenido con alfa > 8/255: 10 píxeles en el conjunto.
- Ningún duplicado consecutivo; último y primero diferentes en las siete acciones. Los ciclos internos repetidos sí reutilizan imágenes, según la tabla de `LEEME.md`.
- Medición circular de diferencia RGBA premultiplicada, segunda diferencia temporal, masa alfa y desplazamiento del centro de la silueta. Se guardan todos los valores por fotograma, antes y después, no solo un resumen favorable.
- Inspección estática de hojas últimos diez → primeros diez y muestras sobre claro, oscuro y salón; revisión de casos problemáticos de patas y rodada. Se retiró la inversión iterativa del flujo que producía agujeros y residuos lejanos, y se delimitó su región válida. Esto reduce artefactos, no demuestra ausencia de todos ellos.
- `node --check player.js` y `node scripts/test-player.cjs`: correctos. El test utiliza un **DOM simulado**, carga cabeceras PNG reales y verifica selección, conteo/fps dinámicos, pausa, reinicio, paso, búsqueda, velocidad, fin sin repetición, rutas de descarga, fondos, cambio rápido de selección y recuperación tras error de carga. Incluye una secuencia de prueba de 7 imágenes a 60 fps para detectar constantes ocultas.
- Concordancia de manifiestos y resolución de rutas bajo `/pichi/` comprobadas por código. No equivalen a una prueba real de GitHub Pages ni de descarga en navegador.

## Revisión por animación

| Acción | Corrección implementada | Cierre inspeccionado y limitaciones restantes |
|---|---|---|
| Frontal | Eliminados acercamiento y escalado acumulativos; 30 poses originales con interpolación circular y margen. | Hojas 170–179/0–9 y métricas. Persiste cambio local de textura/expresión y puede suavizarse demasiado una pata. La transición de la cola necesita revisión en movimiento. |
| Lateral | Galope en el sitio; seleccionadas 18 poses de un ciclo completo, nivel de apoyo estabilizado y oscilación vertical periódica. | Cierre estático frontal de perfil derecho, sin teletransporte. Pelo de baja resolución y apoyos aproximados; no está validada la velocidad física del galope. |
| Dos patas | 24 poses nuevas con subida, equilibrio, cola y bajada; eliminada la capa lechosa mediante una segunda edición generativa. | Cierre sobre la postura inicial en cuatro patas, con escala estable en las muestras. Persisten cambios de anchura del torso y ajustes de patas traseras que requieren revisión temporal. |
| Perseguir cola y rodar | 24 poses nuevas: giro, descenso, panza arriba y recuperación frontal; margen y región del flujo corregidos. | Regresa a la orientación inicial en las muestras. Giro y recuperación aún son aproximaciones generativas; vientre y cara lateral no están verificados por las fotos. Puede haber deformación de hocico y patas durante la rodada. |
| Curiosidad | 12 poses nuevas con inclinaciones alternas, orejas caídas y cuerpo estable. | Unión estática próxima a neutral, sin duplicar el extremo. La segunda diferencia en el cierre supera ligeramente el percentil 95 interno: posible pequeño tirón pendiente de observar. Pelo y base de orejas tienen variación residual. |
| Sacudida | 16 poses nuevas con apariencia húmeda constante, oscilación de cabeza, pelo y orejas. | No hay cambio seco/mojado en las muestras del cierre. Oscilación física aproximada; no se certifica propagación anatómica correcta ni energía suficiente a velocidad normal. |
| Lamida | 16 poses nuevas, cabeza estable, extensión y retracción de lengua y cola periódica. | Expresión próxima a la inicial y sin aumento acumulativo de escala. La lamida es corta, el contacto es simulado y pueden quedar cambios de textura en lengua/labios. |

En todas las acciones la comparación de identidad fue contra las fotos, pero no permite certificar coincidencia exacta. La masa de pelo y algunas proporciones siguen siendo aproximadas. Ninguna nueva vista del vientre o del pelo mojado puede considerarse verificada.

## Métricas de cierre

Valores de diferencia media RGBA premultiplicada normalizados a 0–1; desplazamiento del centro de silueta en píxeles por fotograma. El percentil 95 corresponde a transiciones internas. La diferencia de velocidades de píxeles tampoco sustituye el seguimiento anatómico.

| Acción | Diferencia cierre antes → después | P95 interno después | Desplazamiento cierre antes → después |
|---|---:|---:|---:|
| Frontal | 0,17292 → 0,02716 | 0,02732 | 48,56 → 2,34 |
| Lateral | 0,13556 → 0,01553 | 0,02450 | 81,02 → 2,77 |
| Dos patas | 0,05791 → 0,00327 | 0,01414 | 7,77 → 0,10 |
| Rodada | 0,11231 → 0,00771 | 0,01551 | 9,62 → 0,81 |
| Curiosidad | 0,12537 → 0,00318 | 0,00459 | 19,55 → 0,14 |
| Sacudida | 0,04845 → 0,00693 | 0,02026 | 8,88 → 0,36 |
| Lamida | 0,06776 → 0,00201 | 0,01548 | 5,02 → 0,06 |

Todas las diferencias de cierre finales están por debajo del P95 interno, pero eso **no significa** que todas las transiciones internas sean buenas. La segunda diferencia temporal del cierre de curiosidad es 0,00398 frente a P95 interno 0,00355. Los JSON contienen también máximos locales implícitos en sus series completas para revisar otras transiciones.

## Prueba de navegador no completada

El primer acceso a Chrome agotó el plazo de autorización. En el segundo intento, la revisión automática rechazó seleccionar una ventana ajena a esta tarea para no exponer su contenido. Se abrió entonces una instancia aislada con perfil nuevo dentro de `revision/temporales/chrome`, dedicada al visor local. Computer Use detuvo el acceso porque no pudo determinar su URL con suficiente confianza. No se continuó usando la interfaz tras esa detención.

**No se han observado cinco ciclos consecutivos a 1× y 0,5× en navegador**, ni se declara comprobada la descarga real, la apertura local renderizada o GitHub Pages. El visor `revision/reproductor.html` está preparado para completar esa revisión. Los manifiestos conservan `visualApproval: pending-playback-review` y las métricas `visual_pass: null`.

## Evidencias y repetición

- `revision/*-despues-cierre-{claro,oscuro,salon}.jpg`: los 20 fotogramas del cierre.
- `revision/*-comparacion-fondos.jpg`: muestras de los tres fondos.
- `revision/*-poses-refinadas.jpg`: poses efectivamente utilizadas.
- `revision/metricas-{antes,despues}.json`: medición completa.
- `revision/*-procedencia.json`: origen e interpolación de cada PNG.
- `scripts/refinar.py`, `scripts/auditar.py`, `scripts/test-player.cjs`: reconstrucción y controles locales.

No se ha hecho commit, push ni publicación.
