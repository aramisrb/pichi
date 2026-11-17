# Crear o refinar una acción del mismo perro

Usa todas las fotos de `referencias/` como identidad principal. La cara seria frontal en nieve, la carrera feliz y el cuerpo entero en salón aportan detalles complementarios. Las poses generadas anteriores solo sirven para continuidad; no reemplazan las fotografías.

```text
Crea poses fotorealistas del MISMO perro pequinés adulto de las fotografías.
ACCIÓN: [acción, apoyos, mirada, orientación y recuperación].
Identidad: cara ancha y achatada, hocico corto gris oscuro, nariz negra pequeña,
ojos con tamaño y separación originales, frente dorada, pecho crema,
orejas caídas de flecos largos, cuerpo compacto y bajo, patas cortas,
cola emplumada curvada sobre el dorso. No cachorro, peluche ni dibujo.
Sin ropa, arnés, correa, adornos ni personas. No agrandar ojos o alargar hocico.

Conserva cámara, escala e iluminación. Cuerpo completo con margen transparente
para cada pata, oreja y cola. Alfa real: cero fuera del perro, opaco dentro,
parcial solo para bordes finos. Sin sombras horneadas, velo ni cuadros dibujados.

Diseña el ciclo entero, incluida recuperación. Muestrea N poses a t=i*T/N,
i=0..N-1, sin duplicar el instante T. Última→primera debe continuar posición,
velocidad, orientación, expresión, pelo, orejas y cola. Sin fundidos de dos perros,
desapariciones, teletransportes ni reproducción inversa de toda la secuencia.

Carreras: en el sitio, mirada frontal o estrictamente lateral según la acción.
Dos patas: subida, equilibrio con cola y bajada a cuatro patas.
Rodada: giro completo, descenso, panza arriba y recuperación de orientación.
Curiosidad: inclinaciones oscilatorias, sin detenerse inesperadamente al cerrar.
Sacudida: oscilación periódica con igual estado húmedo en todo el ciclo.
Lamida: extensión, contacto simulado y retracción con escala de cabeza estable.

Si entregas una hoja: [columnas] × [filas] de celdas iguales, una pose por celda,
cronología de izquierda a derecha y de arriba abajo; sin líneas ni texto.
Indica la cantidad real. Una hoja de poses no es una animación de 30 fps.
Las zonas no observables son reconstrucciones propuestas, no verificadas.
```

Inspecciona la cuadrícula real antes de separar las celdas. Rechaza anatomías incoherentes y alfa lechoso aunque exista un canal RGBA. No integres automáticamente una generación: las carreras nuevas de esta revisión fueron descartadas por empeorar las patas.

Prioriza 6 segundos y 180 fotogramas a 30 fps; si cambia la duración, mantén 5–15 segundos y al menos 30 fps. Actualiza ambos manifiestos con valores reales. El reproductor ya obtiene de ellos dimensiones, límites y frecuencia.

Documenta qué poses son nuevas, cuáles se reutilizan y cuáles son fotogramas interpolados. La repetición de ciclos no aumenta el número de imágenes independientes. Un reescalado no añade detalle.

Verifica todos los PNG y revisa interpolaciones en cara, ojos, lengua, patas y bordes. Compara últimos diez → primeros diez sobre claro, oscuro y un escenario; contrasta diferencia y velocidad con transiciones internas. Reproduce cinco ciclos a 1× y cinco a 0,5×. Registra pruebas realmente ejecutadas y defectos pendientes; no apruebes solo por métricas.
