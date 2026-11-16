# Prompt para crear una nueva animación de este pequinés

Adjunta las fotografías originales de `referencias/`, especialmente la cara frontal seria en la nieve, la carrera frontal feliz y la fotografía de cuerpo entero en el salón. No confíes solamente en la descripción textual. Adjunta también una pose aprobada de la animación actual para orientar el acabado, manteniendo las fotos originales como referencia principal de identidad.

## Plantilla principal

```text
Crea una secuencia fotorealista del MISMO perro pequinés de las fotografías adjuntas.
ACCIÓN: [describir acción concreta, dirección, mirada y principio/final].
DURACIÓN: 6 segundos. ENTREGA: 180 imágenes PNG RGBA, 30 fps,
numeradas frame_0000.png a frame_0179.png, sin saltos.

IDENTIDAD: conservar al máximo la anatomía y rasgos individuales de las fotos:
frente dorada, pelo crema largo en pecho y flecos de orejas, cara ancha y
achatada, nariz negra pequeña, hocico gris oscuro corto, ojos oscuros separados
del tamaño original; cuerpo compacto, bajo y alargado, patas cortas,
cola de pelo largo claro curvada sobre la espalda. Orejas caídas, no puntiagudas.
No convertirlo en cachorro genérico, pomerania, shih tzu, dibujo o peluche.
No agrandar ojos ni alargar hocico o patas. No añadir volumen de pelo artificial.

EXPRESIÓN: [seria/curiosa como la foto frontal de boca cerrada, o contenta
como la foto de carrera con boca abierta]. No introducir sonrisa humana.
El cambio de expresión requerido por la acción debe ser anatómicamente natural.
No copiar destellos, adornos, personas, ropa, arnés o correa.

CÁMARA: posición, focal, luz y escala estables; cuerpo entero dentro del
lienzo con margen transparente suficiente, incluidas orejas, cola y patas.
Lienzo final uniforme de 256 × 256 para el reproductor suministrado.
Generar originalmente a mayor resolución si se necesita más detalle.
FONDO: transparencia alfa real, alfa cero fuera del perro, sin suelo,
sin sombra horneada, sin niebla blanca ni patrón de cuadros dibujado.
Preservar pelo fino mediante valores alfa parciales solamente en los bordes.

MOVIMIENTO:
0–1 s: [anticipación].
1–4 s: [acción principal, pasos y orientación].
4–6 s: [asentamiento y regreso a la pose inicial si debe cerrar en bucle].
Patas apoyadas con coherencia, sin deslizamiento; pelo y cola siguen el cuerpo.
No cambiar de individuo, color, proporciones o iluminación entre imágenes.
No duplicar imágenes para aparentar más movimiento. No entregar 30 imágenes
aleatorias e indicar que equivalen a 180 fotogramas independientes.

Si no puedes producir los 180 fotogramas coherentes, entrega poses clave
ordenadas e indica claramente su cantidad real. La interpolación posterior
se documentará por separado y no se presentará como fotografías generadas
independientes. No afirmes identidad exacta sin poder comprobarla.
```

## Alternativa para generadores de imágenes fijas

Una sola llamada de un generador de imágenes fijas no garantiza una secuencia de vídeo ni un ZIP de 180 archivos. Solicita una hoja de poses, inspecciónala, separa las celdas y realiza después la interpolación con un sistema adecuado. Esta entrega emplea esa estrategia.

```text
Genera una hoja de sprites de 6 columnas por 5 filas: 30 poses clave
cronológicas de la acción [ACCIÓN], leyendo izquierda a derecha y de arriba
abajo. Celdas exactamente iguales, una pose de cuerpo entero por celda,
márgenes transparentes de al menos 15%, sin superposiciones, sin texto ni
líneas de cuadrícula. Mismo tamaño de perro, cámara y luz en cada celda.
Incluye los criterios de identidad, expresión y transparencia de la
plantilla principal. Mantén la cronología del movimiento.
```

Comprueba el número real de filas: los generadores pueden incumplir la cuadrícula. No cortes automáticamente una hoja sin verificar su distribución.

## Revisión antes de integrar

- Comparar nariz, hocico, separación de ojos, perfil, longitud de orejas, color del pecho, longitud del cuerpo y forma de cola contra las fotos, no solo contra imágenes generadas anteriores.
- Revisar alfa sobre blanco, negro y un color saturado. Rechazar fondos lechosos y bordes rectangulares.
- Revisar todas las poses por patas duplicadas, partes cortadas y cambio de identidad.
- Revisar la reproducción lenta para detectar deformaciones de interpolación, ojos fluctuantes y patas que se funden.
- Verificar 180 archivos, dimensiones constantes, canal alfa y ausencia de rutas externas.
- Para verdadera fidelidad temporal a 30 fps, preferir vídeo de referencia del propio perro o un modelo 3D riggeado y texturizado a partir de más vistas. Un prompt por sí solo no garantiza identidad exacta.
