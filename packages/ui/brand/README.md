# Marca ReSona — archivos maestros

Logotipo, símbolo y favicons en vectorial. **Estos son los archivos buenos**: cualquier
otro PNG de `ReSona` que circule por el proyecto está obsoleto.

## Qué usar

| Archivo | Cuándo |
|---|---|
| `resona-logo.svg` | Logotipo sobre fondo claro |
| `resona-logo-negativo.svg` | Logotipo sobre fondo oscuro |
| `resona-logo-mono-negro.svg` · `-blanco.svg` | Un solo tinta, sin bajada |
| `resona-events.svg` · `resona-rent.svg` | **El logotipo con su bajada. Es la versión que se usa por defecto** |
| `resona-events-negativo.svg` · `resona-rent-negativo.svg` | Las mismas, sobre fondo oscuro |
| `resona-*-mono-negro.svg` · `-mono-blanco.svg` | Un tinta, para serigrafía y vinilo de corte |
| `resona-simbolo.svg` | El símbolo solo: avatar, marca de agua, badge, formatos estrechos |
| `resona-simbolo-negativo.svg` · `-mono-*.svg` | Las mismas variantes del símbolo |
| `favicon.svg` | Favicon y app icon |
| `favicon-mini.svg` | Solo para 16 y 32 px: mismo dibujo con el hueco más abierto para que no se empaste |
| `favicon.ico` | Windows y navegadores antiguos (16/32/48 en un solo archivo) |
| `png/avatar-1000-*.png` | Avatar cuadrado para Instagram, Google Business y WhatsApp. Con fondo, no transparente: esas plataformas recortan |
| `png/og-image-*.png` | 1200×630, la imagen que se ve al compartir un enlace en WhatsApp o LinkedIn |
| `png/resona-simbolo-*.png` | El símbolo suelto en grande, transparente: marca de agua en vídeo |
| `stencil/` | Plantillas recortables para pintar con spray en los flightcases |
| `imprenta/` | **Lo que se manda a un proveedor**: los mismos archivos con el texto ya trazado, en SVG y PDF. Ver [`imprenta/README.md`](imprenta/README.md) |
| `png/` | El resto, rasterizados con transparencia |

## Construcción

El logotipo **es** el símbolo: la R azul ocupa el lugar de la inicial y la palabra
continúa con `eSona`. No se ponen símbolo y logotipo juntos — sería la R dos veces.

Retícula medida sobre el original:

- Altura de mayúscula **136** · altura de x **107** · línea base **168**
- La S sube **14** sobre la mayúscula y baja **11** bajo la línea base (18 → 179)
- El símbolo ocupa exactamente ese rango, 18 → 179, alineado con los extremos de la S
- Separación entre el símbolo y la `e`: **13**, la misma que hay entre las demás letras

## La bajada: EVENTS y RENT

**Montserrat, peso 500**, centrada bajo el logotipo. Las medidas están fijadas en unidades del
logotipo, que mide 811,6 × 161:

| | |
|---|---|
| Cuerpo | **40** (0,248 × la altura del logotipo) |
| Tracking | **56** (1,40 em) — sí, es mucho, y es a propósito |
| Separación | **30** entre el pie del logotipo y la mayúscula de la bajada |
| Alto total | **219** |

Con esas medidas `EVENTS` ocupa el 54 % del ancho del logotipo y `RENT` el 34 %. **No se igualan
los anchos**: lo que comparten las dos líneas es el tracking, no la longitud.

> Los SVG llevan la bajada como texto, no como trazado. En web funciona si Montserrat está cargada;
> **para imprenta hace falta el texto trazado**, o el proveedor verá otra fuente. Ya está hecho en
> [`imprenta/`](imprenta/README.md): manda esos archivos, no estos.

## No hay versión vertical

Y es a propósito: como el símbolo está dentro del logotipo, apilarlos significaría poner la R dos
veces. Para un formato estrecho o cuadrado se usa **el símbolo solo**.

## Cómo colocarlo

**Área de respeto.** Alrededor del logotipo se deja libre, como mínimo, **la mitad de la altura del
símbolo** (80 unidades de las 161 del logotipo). Nada entra en ese margen: ni texto, ni fotos, ni el borde
de la pieza.

**Tamaño mínimo.** Medido, no estimado: por debajo de **110 px de ancho** el contrapunzón de la «e» y el
hueco de la «a» se empastan y la palabra deja de leerse.

- Logotipo completo: **110 px de ancho** en pantalla · 25 mm impreso
- Símbolo solo: **16 px** (usa `favicon-mini.svg`, que lleva el hueco más abierto)

**Qué no hacer.** No estirarlo ni deformarlo, no rotarlo, no cambiar la separación entre el símbolo y la
palabra, no recolorear la pata azul salvo en las versiones monocromas ya preparadas, y no volver a poner
el símbolo al lado del logotipo: ya está dentro.

## Events y Rent

Mismo logotipo, mismo símbolo, mismo azul. Lo único que cambia es la bajada, el fondo y el tipo de foto.
Lo caro de construir se repite; lo barato es lo que varía.

| | **Events** | **Rent** |
|---|---|---|
| Fondo | Negro, siempre | Claro, siempre |
| Foto | Ambiente, luz, gente, noche | Producto recortado sobre fondo limpio |
| Texto | Poco y grande. Vende una sensación | Fichas, precios, botones. Vende fiabilidad |
| Qué hace el cliente | Pide presupuesto | Añade al carrito y paga |
| Claim | Producción audiovisual para eventos extraordinarios | Alquiler de sonido, iluminación e imagen · Valencia |

Un claim por línea, no uno común: Events vende producción y Rent vende alquiler, y meterlos en la misma
frase obliga a ser tan genérico que no dice nada.

## Fotografía

**Solo fotos propias de eventos reales.** Nada de stock: se nota, y además contradice lo que vendes.

- **Events** — luz, movimiento, gente disfrutando, planos generales de sala. Sin posados.
- **Rent** — el equipo recortado sobre fondo claro, siempre igual de encuadrado y de iluminado.
  La coherencia entre fichas importa más que la espectacularidad de cada una.

**El logotipo sobre una foto** va siempre en su versión negativa (blanca) y sobre una zona oscura y
tranquila de la imagen. Si no la hay, se oscurece esa zona con un velo negro al 40 %. El logotipo negro
nunca va directamente sobre fotografía.

## Plantilla para spray (flightcases)

En `stencil/`. **Lo negro es lo que se recorta**; el resto es el material que se queda.

| Archivo | Hoja | Dónde imprimirla |
|---|---|---|
| `plantilla-resona-150mm.svg` | 190 × 70 mm | A4 apaisado |
| `plantilla-resona-300mm.svg` | 340 × 100 mm | A3 apaisado |
| `plantilla-resona-500mm.svg` | 540 × 139 mm | Plotter o copistería |
| `plantilla-resona-300mm-300dpi.png` | | Si la copistería no acepta SVG |

**Los puentes.** El logotipo tiene tres islas —los huecos de la «e», la «o» y la «a»— que al recortar
se caerían y dejarían esas letras rellenas. La plantilla lleva **seis puentes de 3 mm** (dos por isla)
que las sujetan. Comprobado por ordenador: con ellos no queda ni una pieza suelta. **No los quites.**

Se notan un poco al pintar, y es normal: cualquier plantilla de una tinta los tiene. Si molestan mucho,
se retocan a mano con un rotulador del mismo color cuando la pintura esté seca.

**Cómo usarla**

1. Imprimir **al 100 %**, sin «ajustar a página»: si se escala, deja de medir lo que dice.
2. Pegarla sobre cartón pluma, PVC de 1–2 mm o acetato y recortar lo negro con cúter.
3. Las líneas magenta no se recortan: el marco es el contorno del material y las cuatro marcas de los
   bordes son los ejes, para alinear la plantilla recta sobre el flightcase.
4. Fijar con cinta de carrocero por todo el perímetro, pegando bien alrededor de los huecos.
5. **Spray blanco**, dos o tres pasadas finas en vez de una gruesa: si se carga, se cuela por debajo.
   Pulverizar perpendicular a la superficie, nunca en diagonal.
6. Retirar la plantilla con la pintura aún fresca, tirando recto.

**Qué tamaño.** 150 mm para flightcases pequeños, 300 mm para los de rack y baúles, 500 mm para los
grandes. Sobre negro va en blanco; sobre gris claro, en negro.

## Colores

**De marca**

```
Negro         #0A0A0A
Azul          #3D5AFE     CMYK 76 65 0 0
Gris oscuro   #1A1A1A
Gris          #4D4D4D
Gris claro    #E5E5E5
```

**El azul tiene dos versiones, y no es un capricho.** Medido: `#3D5AFE` sobre negro da **3,86:1**, por
debajo del 4,5:1 que exige la accesibilidad para texto. Como Events vive sobre fondo negro, ahí hace
falta el azul aclarado:

```
Azul sobre claro   #3D5AFE     5,13:1 sobre blanco   OK
Azul sobre oscuro  #5B74FE     5,07:1 sobre negro    OK
```

Mismo tono (231°), solo cambia la luminosidad. El de marca —el del logotipo y la pata del símbolo— es
siempre `#3D5AFE`; el aclarado es **solo para texto y enlaces sobre negro**.

**Botones**

```
Normal    #3D5AFE     texto blanco encima, 5,13:1
Hover     #1F40FE
Pulsado   #052BFE
```

**Estados** (los necesita Rent: errores de pago, confirmaciones, avisos de stock)

| | Sobre fondo claro | Sobre fondo oscuro |
|---|---|---|
| Error | `#D92D20` | `#FF6B5E` |
| Acierto | `#0F7B4F` | `#3FD98C` |
| Aviso | `#9A5B00` | `#FFB020` |

Todos verificados por encima de 4,5:1 contra su fondo.

**Texto de apoyo**: `#9A9A9A` sobre negro (7,04:1) · `#4D4D4D` sobre claro (8,45:1).

El azul es para la pata del símbolo, los botones y los enlaces. Un dato destacado por pantalla, no más.
Si está en todo, deja de llamar la atención.

## Tipografía

- **`ReSona`** — lettering propio, no es una fuente. Nadie puede escribirlo y obtener el logo.
  Dibujado a partir del original y refinado a mano, con las curvas redibujadas. 1,7 KB de trazado limpio.
  El símbolo que hace de inicial es el mismo dibujo del favicon, escalado ×1,2578.

- **`EVENTS` / `RENT`** y los textos corporativos — **Montserrat**.

Escala, para que todas las piezas se monten igual:

| Uso | Peso | Escritorio | Móvil | Detalle |
|---|---|---|---|---|
| Titular | 700 | 34–56 px | 26–34 px | Tracking −0,5 px. Poco texto |
| Subtítulo | 600 | 20–24 px | 18–20 px | |
| Cuerpo | 400 | 16 px | 16 px | Interlineado 1,6. **Nunca menos de 16 px**: por debajo, iOS hace zoom al tocar un campo |
| Apoyo | 400 | 13–14 px | 13 px | Gris `#9A9A9A` sobre negro, `#4D4D4D` sobre claro |
| Etiqueta | 600 | 11–12 px | 11 px | Mayúsculas, tracking +2 px |

**Pesos a cargar: 400, 600, 700 y la itálica 400.** La itálica solo porque el texto de las páginas
la usa para enfatizar; si algún día se quita ese recurso, se quita también de la carga. El 500 únicamente en las bajadas EVENTS/RENT, que
van en los SVG, así que no hace falta cargarlo en la web. Cada peso de más son ~25 KB que paga el
visitante, y en móvil eso se nota.

## Espaciado y formas

Para que las tres apps se monten igual:

- **Espaciado en múltiplos de 4**: 4, 8, 12, 16, 24, 32, 48, 64, 96. Nada de valores sueltos.
- **Radio de esquina**: 4 px en botones y campos · 6 px en tarjetas · 50 % en avatares. Nada más.
- **Bordes**: 1 px `#262626` sobre negro, 1 px `#D4D4D4` sobre claro.
- **Zona de toque mínima**: 44 × 44 px. Un botón puede verse más pequeño, pero su área pulsable no.

## Estado en la web

La web actual **todavía no usa esta tipografía**: Events carga Inter (textos) y Playfair Display
(titulares). El manual manda, pero la migración se hará con el rediseño completo, no página a página.

`/hola` es la **primera página con el sistema nuevo**: Montserrat, colores verificados y el logotipo
desde `@resona/ui`. Sirve de referencia para el resto del rediseño. Pide Montserrat solo para ella;
cuando se rediseñe la web, la fuente pasa al `index.html` y esto se quita.

## Pendiente

- **Instalar en las tres apps.** Cada una espera estos nombres en `public/`: `favicon.svg`,
  `favicon-32.png`, `favicon-192.png`, `favicon.png` (512), `favicon.ico`, `apple-touch-icon.png`
  y `og-image.png`. Ahora mismo tienen los antiguos. Ojo: un push a main redespliega las cuatro apps.
- **Sustituir los logos viejos**: `apps/events/public/logo-events.png`, `logo-events-white.png`,
  `apps/rent/public/logo-resona.png` y `logo.png` siguen siendo la versión anterior.
- **Revisar los JSON-LD**: `schemas.ts` de cada app referencia el logo por URL; hay que comprobar que
  apunten al archivo nuevo, porque eso es lo que Google lee.
- **`apps/admin` no tiene favicon** ninguno.
