# Pichi · Animaciones locales

Abre `index.html` con el paquete completo. La versión actual contiene siete secuencias de **512 × 512, 180 PNG RGBA, 30 fps y 6 segundos**. Usa archivos y rutas relativas, sin servicios externos para reproducir. Los cambios están preparados para revisión, sin publicar.

Las poses se han generado de nuevo con ImageGen a partir de las fotografías y fotogramas de los vídeos. No se han ampliado los antiguos sprites de 256 px para presentarlos como detalle nuevo. La generación sigue siendo una interpretación: consulta [el informe y sus limitaciones](revision-v2/INFORME.md) y las [referencias utilizadas](revision-v2/REFERENCIAS.md).

## Archivos y procedencia

- `animaciones/<acción>/frame_0000.png` … `frame_0179.png`: los 1.260 PNG reproducidos.
- `poses/fuentes-v2/`: 18 láminas generadas activas y sus prompts; 69 poses utilizadas. Se conserva también la lámina de bajada sustituida.
- `poses/refinadas/<acción>/`: poses recortadas, normalizadas y exportadas a 512 px.
- `poses/<acción>/`: material anterior conservado.
- `referencias/`: 42 fotografías y 14 vídeos originales intactos. `fondos/`: cuatro escenarios.
- `trabajo/referencias-video/`: inventario ffprobe, muestreo inicial, 474 fotogramas nativos seleccionados, marcas de tiempo y hojas de inspección.
- `trabajo/version-anterior-20261117/`: copia local anterior a esta revisión, incluidos PNG, poses, reproductor y documentación.
- `manifest.json` y `manifest.js`: catálogo sincronizado, dimensiones, frecuencia, cantidad, referencias de movimiento y mapa de imágenes repetidas.
- `revision-v2/`: comparaciones, procedencia por PNG, métricas, cierres, informe y visor.

| Acción | Poses nuevas | Ciclos de movimiento en 6 s | Imágenes distintas |
|---|---:|---:|---:|
| Carrera frontal | 8 | 12 | 15 |
| Carrera lateral | 8 | 12 | 15 |
| Dos patas | 12 | 1 | 180 |
| Perseguir cola y rodar | 21 | 1 | 180 |
| Curiosidad | 4 | 2 | 90 |
| Sacudida | 8 | 15 | 12 |
| Lamida | 8 | 4 | 45 |

Los ciclos cortos se repiten dentro de los seis segundos. Esas repeticiones **no son detalle temporal adicional ni mejora de fluidez por duplicación**. Se mantienen 180 archivos para descarga y compatibilidad; `frameMap` comparte su decodificación. Los archivos `*-procedencia.json` distinguen poses generadas de muestras interpoladas.

## Movimiento y transparencia

Las carreras son en el sitio, con escala común y oscilación periódica. Dos patas incluye subida y bajada; la rodada vuelve a cuatro patas y a su orientación inicial; curiosidad inclina y recupera; la lamida extiende y retrae. No se invierten carreras ni rodada. El muestreo `t=i·T/N`, con `i=0…N−1`, excluye el extremo final y considera las poses vecinas a ambos lados del cierre.

La interpolación usa flujo DIS, trayectorias cúbicas circulares y un mapa inverso denso calculado al proyectar coordenadas hacia delante. Rellena huecos de coordenadas antes de muestrear la textura en RGBA premultiplicado. Conserva una silueta principal en oclusiones para reducir dobles patas. Pueden quedar cambios locales al alternar la pose fuente, especialmente en patas y rodada. No equivale a un esqueleto articulado ni a seguimiento del perro real.

Los pequeños huecos cerrados creados dentro del pelo por la proyección se reparan localmente; se registran los píxeles afectados. No se rellenan los espacios abiertos entre patas ni se presenta ese procesamiento como detalle generativo.

Se conserva alfa gradual en pelos finos; el interior casi opaco de las láminas generadas se normaliza a opaco. No se aplica enfoque artificial. Las fuentes se reducen con una escala común por acción, sin ampliarlas. El perro no lleva ropa, arnés ni correa.

## Reproductores

Se conservan animación, fondo, pausa, reinicio, velocidad, paso adelante/atrás, búsqueda, tamaño y descarga del PNG. Lienzo, frecuencia y límites proceden del manifiesto. El lienzo interno conserva los 512 px; la presentación se adapta al espacio disponible.

`frame-cache.js` mantiene hasta 48 MiB de imágenes decodificadas referenciadas por el reproductor principal, más hasta cuatro cargas en curso. La caché interna del navegador y la GPU quedan fuera de esa estimación. Si falta una imagen, detiene el reloj lógico hasta cargarla; el rendimiento real aún requiere comprobación en navegador.

[El visor de revisión](revision-v2/reproductor.html) muestra las siete acciones o una sola, a 1×/0,5× y sobre blanco, oscuro o salón. Incluye últimos diez → primeros diez. El regreso de ese bloque reducido a su comienzo es un salto del visor de inspección, no de la animación completa. Sus contadores no certifican revisión visual.

## Repetir el proceso

Solo para desarrollar; reproducir los PNG no requiere Python, Node ni FFmpeg:

```powershell
.venv\Scripts\python scripts\analizar_referencias.py
.venv\Scripts\python scripts\extraer_fragmentos.py
.venv\Scripts\python scripts\refinar_v2.py
.venv\Scripts\python scripts\auditar_v2.py
.venv\Scripts\python scripts\preparar_evidencia_v2.py --videos
node scripts\test-player.cjs
```

Dependencias Python en `scripts/requirements.txt`; FFmpeg y ffprobe deben estar en PATH. `refinar_v2.py --only curiosidad` procesa una acción. Estos scripts reutilizan las láminas guardadas y **no invocan generación de imágenes**. `refinar.py` y `auditar.py` son históricos: ejecutar su flujo principal sobrescribiría la versión actual con el proceso anterior.

La copia anterior, extracciones nativas y MP4 de consulta se conservan en disco y se excluyen de Git para evitar duplicar grandes volúmenes. Sus inventarios, tiempos, fuentes aceptadas e informe permanecen disponibles. No se ha hecho commit, push ni publicación.
