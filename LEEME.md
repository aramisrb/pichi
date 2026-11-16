# Pequi · Animaciones locales

Extrae **todo el ZIP** en una carpeta y abre `index.html` con Chrome, Edge o Firefox. No requiere instalación, Internet ni servidor. No abras el HTML dentro de la vista previa del ZIP.

## Contenido

- Siete animaciones de 6 segundos: 180 PNG RGBA de 256 × 256 por secuencia, reproducidos a 30 fps a velocidad 1×. Total: 1.260 PNG de animación.
- `animaciones/<nombre>/frame_0000.png` hasta `frame_0179.png`: imágenes independientes, con transparencia.
- `poses/<nombre>/`: poses clave generadas antes de la interpolación (30 por acción; 36 para el giro y la voltereta).
- `fondos/`: cuatro escenarios generados a partir de las fotografías: nieve, lago, salón y cocina.
- `referencias/`: seis fotografías aportadas por el usuario.
- `manifest.js` y `manifest.json`: catálogo, duración, dimensiones, fotogramas y frecuencia.
- `PROMPT_NUEVA_ANIMACION.md`: instrucciones reutilizables para otra animación.

## Reproductor

Selecciona la acción y espera a que termine su precarga. Puedes pausar, reiniciar, avanzar o retroceder una imagen, desplazarte por la línea de tiempo, cambiar la velocidad y activar o desactivar la repetición. El botón Guardar PNG descarga el fotograma transparente original, sin el fondo. Puedes elegir uno de los cuatro escenarios, un fondo propio, transparencia visual o un color sólido.

## Alcance y limitaciones reales

Las imágenes son una **recreación generativa aproximada** de este perro. No son fotografías reales nuevas. Se han utilizado las referencias para conservar cara achatada, hocico oscuro, ojos oscuros, tonos dorados y crema, orejas caídas con flecos, patas cortas y cola emplumada. **No se ha conseguido ni se puede certificar una identidad exacta del pelo, cuerpo o expresión en todas las poses.** Las fotografías muestran iluminación, prendas y expresiones diferentes; la versión animada no lleva arnés, ropa ni correa.

Los 30 fps son la frecuencia de reproducción de archivos PNG reales. No son 30 poses generadas independientemente cada segundo: se han interpolado las poses clave mediante estimación de desplazamiento de bloques y mezcla de muestras con alfa premultiplicado. Las carreras repiten tres ciclos de poses dentro de los seis segundos; la sacudida repite dos. El acercamiento y desplazamiento lateral están incorporados en los PNG. Puede haber deformaciones o dobles contornos en transiciones, sobre todo en el giro, la lengua y las patas. El detalle efectivo procede de celdas de aproximadamente 209 × 251 píxeles, o 209 × 209 para la voltereta; los PNG están adaptados a un lienzo 256 × 256. No son fotogramas de alta definición.

La voltereta representa un giro y rodar boca arriba en el suelo. La lamida es un gesto simulado hacia la cámara. La sacudida y la elevación de orejas son aproximaciones visuales; no constituyen una simulación física del pelo o el agua. La continuidad al repetir no es perfecta en todas las acciones.

## Añadir otra secuencia

1. Genera y verifica los PNG siguiendo el prompt incluido.
2. Colócalos en `animaciones/nueva-accion/frame_0000.png`, etc.
3. Para este reproductor, utiliza 180 PNG de 256 × 256, a 30 fps y 6 segundos.
4. Añade al array de `manifest.js` una entrada con `id`, `name`, `fps:30`, `frames:180`, `duration:6`, `keyframes`, `width:256`, `height:256`. Actualiza también `manifest.json` como documentación.

El reproductor de esta entrega está ajustado a 180 fotogramas. Para duraciones distintas, adapta el límite del selector y la lógica de avance del HTML, además del manifiesto.
