# Pequi · Animaciones locales

Abre `index.html` después de extraer el paquete completo. Solo necesita los archivos locales; no utiliza servicios externos para reproducir. Las rutas relativas conservan la estructura de GitHub Pages bajo `/pichi/`. No se ha publicado esta revisión.

## Contenido y procedencia

- Siete secuencias de 6 segundos, 180 PNG RGBA de 256 × 256 a 30 fps: 1.260 archivos.
- `animaciones/<acción>/frame_0000.png` … `frame_0179.png`: resultado reproducido.
- `poses/refinadas/<acción>/`: poses utilizadas por la reconstrucción actual.
- `poses/<acción>/`: poses anteriores, conservadas como fuente y comparación.
- `referencias/` y `fondos/`: las seis fotografías y los cuatro escenarios originales, sin modificar.
- `manifest.json` y `manifest.js`: catálogo sincronizado, frecuencia, cantidad, dimensiones y procedencia.
- `revision/generadas/`: hojas producidas con ImageGen y prompts. Las hojas `frontal.png`, `lateral.png` y `dos-patas.png` **no se utilizan**: las carreras nuevas empeoraban las correspondencias de patas y la primera hoja de dos patas tenía un velo. Se usa `dos-patas-limpio.png`.
- `revision/*-procedencia.json`: tiempo, poses fuente, fracción y distinción entre pose generada e interpolación por fotograma.
- `revision/metricas-antes.json`, `metricas-despues.json` y hojas de cierre: evidencia reproducible. Consulta `VERIFICACION.md` para el alcance real.

| Acción | Poses fuente | Repeticiones del ciclo de poses en 6 s | PNG distintos |
|---|---:|---:|---:|
| Frontal | 30 anteriores | 3 | 60 |
| Lateral | 18 anteriores seleccionadas | 4 | 45 |
| Dos patas | 24 nuevas | 1 | 180 |
| Perseguir la cola y rodar | 24 nuevas | 1 | 180 |
| Curiosidad | 12 nuevas | 1 | 180 |
| Sacudida | 16 nuevas | 4 | 45 |
| Lamida | 16 nuevas | 2 | 90 |

Las repeticiones forman parte del movimiento periódico; **no se presentan como más imágenes independientes ni como mejora de fluidez**. La carrera frontal contiene más de un paso dentro de su ciclo de poses. No son 180 poses generadas por acción ni vídeo capturado del perro.

## Movimiento y límites

Las carreras mantienen posición y escala, sin acercamiento acumulativo ni desplazamiento lateral. La lateral utiliza el primer galope completo de las poses originales; se excluye el segundo tramo incompleto, que deriva hacia arriba y recorta la cola. Dos patas contiene subida, equilibrio y bajada. La rodada contiene giro, paso por panza arriba y recuperación frontal. Curiosidad alterna inclinaciones. La sacudida conserva apariencia húmeda. La lamida contiene extensión y retracción sin agrandar la cabeza.

El muestreo es `t = i·T/N`, para `i = 0…N−1`. La interpolación incluye última pose → primera pose y sus vecinas circulares. No se añade un fotograma final duplicado ni se invierte la secuencia completa. Se estima flujo óptico DIS, se interpolan desplazamientos cúbicos y se combinan muestras registradas con alfa premultiplicado. Una aproximación estable de la inversión del desplazamiento evita los agujeros de la inversión iterativa en oclusiones. Se limita la región de interpolación al área recorrida por las siluetas más margen.

**Persisten defectos y falta la aprobación visual en reproducción.** El flujo óptico no conoce articulaciones, oclusiones ni identidad. Quedan variaciones de textura y pueden aparecer deformaciones y contornos secundarios, especialmente en patas, lengua y rodada. No se certifican bucles imperceptibles ni fidelidad anatómica completa. Las diferencias de píxeles y la velocidad del centro de la silueta sirven para detectar problemas, no para aprobar calidad visual.

Las fotografías tienen prioridad: cara ancha y achatada, hocico oscuro, ojos de tamaño natural, orejas caídas, pelo dorado y crema, cuerpo bajo, patas cortas y cola emplumada. Las nuevas poses son interpretaciones; la densidad del pelo y algunas proporciones aún difieren. Vientre, recuperación de la rodada y pelo mojado son reconstrucciones propuestas, no apariencias exactas verificadas en las fotos. La versión animada no lleva ropa, arnés ni correa. Los PNG siguen siendo de 256 × 256; no se afirma un aumento de detalle por reescalado.

## Reproductores

`index.html` conserva selección de animación y fondo, pausa, reinicio, velocidad, avance y retroceso, búsqueda y descarga del PNG transparente. Añade fondos claro y oscuro. Duración, límites, frecuencia y lienzo se obtienen del manifiesto; ya no hay límites fijos de 180/30/256 en la lógica.

`revision/reproductor.html` permite observar las siete acciones juntas a 1× o 0,5×, sobre claro, oscuro o salón. Incluye contador de ciclos y modo últimos diez → primeros diez. El regreso del primer bloque de diez al último es un salto deliberado del **visor de inspección**, no parte del ciclo real. La revisión pendiente requiere cinco ciclos completos: 30 segundos a 1× y 60 segundos a 0,5×, sobre cada fondo, observando cara, patas, pelo y ritmo.

## Reconstrucción y comprobaciones

Solo para desarrollar; el reproductor no necesita Python ni Node:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r scripts\requirements.txt
.venv\Scripts\python scripts\refinar.py
.venv\Scripts\python scripts\auditar.py
node scripts\test-player.cjs
```

`refinar.py --only curiosidad` reconstruye una acción. Las hojas se separan según la cuadrícula inspeccionada y una escala común por secuencia. Estos scripts procesan las hojas guardadas; no llaman a una API generativa. `auditar.py --tag antes` solo debe ejecutarse sobre los originales para rehacer la comparación histórica.

Para otra acción, crea PNG consecutivos y actualiza ambos manifiestos con cantidad, frecuencia y dimensiones reales; `duration = frames/fps`. Mantén al menos 30 fps y entre 5 y 15 segundos, transparencia y cierre verificado. Sigue `PROMPT_NUEVA_ANIMACION.md`.
