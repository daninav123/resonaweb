# Paquete de imprenta — ReSona

Los archivos de esta carpeta son **los que se mandan a un proveedor** (rotulista, imprenta,
serigrafía, copistería). Se diferencian de los de `../` en una sola cosa: **el texto va trazado**,
convertido en curvas. En los originales, `EVENTS`, `RENT` y los datos de las tarjetas son texto vivo
en Montserrat; si el proveedor no tiene esa fuente instalada, su ordenador la sustituye por otra y
rotula con una tipografía que no es la nuestra.

> Generados desde `../` con Montserrat variable instanciada en cada peso. Comprobado: el trazado
> es idéntico píxel a píxel al renderizado con la fuente. **No los edites a mano.** Si cambia un
> original, se regenera todo con `python3 packages/ui/brand/imprenta/generar.py`
> (necesita `pip3 install fonttools uharfbuzz` y Chrome para el PDF).

## Qué mandar según el trabajo

| Trabajo | Archivo |
|---|---|
| Rotulación de furgoneta, rótulo de fachada, lona | `pdf/resona-events.pdf` o `pdf/resona-rent.pdf` |
| Vinilo de corte, serigrafía, bordado (una tinta) | `pdf/resona-*-mono-negro.pdf` · `-mono-blanco.pdf` |
| Sobre fondo oscuro a todo color | `pdf/resona-*-negativo.pdf` |
| Tarjetas de visita | `pdf/tarjeta-events-anverso.pdf` + el reverso de cada persona |
| El proveedor pide vectorial editable | los `.svg` de esta misma carpeta |

**El logotipo sin bajada y el símbolo solo no están aquí**: `../resona-logo*.svg` y
`../resona-simbolo*.svg` no llevan texto, así que ya son válidos para imprenta tal cual.

Las plantillas de spray de `../stencil/` tampoco se duplican. Llevan una nota en magenta en
Helvetica/Arial, pero es una instrucción para quien imprime, no parte del dibujo: si se sustituye
la fuente no pasa nada.

**Los `-mono-blanco` son blanco sobre transparente**: en pantalla y sobre papel blanco no se ven.
Es lo correcto — van sobre un fondo de color que pone el proveedor.

## Tarjetas de visita

- **Tamaño final 85 × 55 mm.** Los archivos miden 91 × 61 mm porque **incluyen 3 mm de sangre por
  lado**. La línea de corte va a 3 mm de cada borde del archivo.
- Impresión a 4 tintas, dos caras. Fondo negro a sangre.
- Todo el contenido queda a **4,95 mm del corte** como mínimo. `generar.py` lo comprueba en cada
  ejecución y avisa si algo se acerca de más.
- El QR codifica `https://resonaevents.com/hola`, versión 3 con corrección de errores Q y **4 módulos
  de zona de silencio**. Módulo de 0,46 mm: por debajo de eso, una impresión mala lo revienta.
  Aun así, **escanéalo desde una prueba impresa** antes de tirar la partida entera.

## Colores

| | HEX | Pantone (sólido, recubierto) | RAL | CMYK orientativo |
|---|---|---|---|---|
| Azul ReSona | `#3D5AFE` | **2726 C** (ΔE 5,6) | ninguno cerca — el mejor es 5007, ΔE 12 | 77 / 51 / 0 / 0 |
| Negro ReSona | `#0A0A0A` | **419 C**, o negro 100 % | **9005** Jet black (ΔE 1,4) | 74 / 71 / 65 / 82 |
| Azul claro (cargos, tarjeta) | `#5B74FE` | 2130 C (ΔE 4,9) | — | 67 / 42 / 0 / 0 |
| Gris de texto (tarjeta) | `#9A9A9A` | Cool Gray 7 C (ΔE 1,5) | 9022 (ΔE 0,6) | 38 / 32 / 29 / 0 |

**El azul es el problema y conviene saberlo antes de gastar dinero.** `#3D5AFE` es un azul de
pantalla, muy saturado, y **no existe en tinta**: al pasarlo a CMYK se va a `#426CA7` (ΔE 11,6), es
decir, sale más apagado y más gris de lo que se ve en la web. No es un fallo del proveedor.

Qué hacer con eso:

- **Vinilo y pintura**: elegir el color sobre un **muestrario físico** del fabricante (Oracal, Avery,
  la carta RAL del pintor), no por el HEX. Ahí sí hay azules saturados que se acercan.
- **Papel**: si la tirada da para una tinta directa, pedir **Pantone 2726 C** y queda casi igual que
  en pantalla. En CMYK normal, aceptar que va a salir algo más apagado.
- **Pedir siempre prueba de color** en el primer trabajo con cada proveedor, y guardar esa muestra
  como referencia para los siguientes.
- Los Pantone de la tabla están calculados por diferencia de color (CIEDE2000) sobre valores Lab.
  Sirven para pedir presupuesto; **la referencia buena es la guía física**.

## Medidas mínimas

- Logotipo completo: **25 mm de ancho** impreso. Por debajo, el hueco de la «e» y el de la «a» se
  empastan.
- Símbolo solo: no bajar de **8 mm**.
- Área de respeto alrededor: **la mitad de la altura del símbolo**. Nada entra ahí, tampoco el borde
  de la pieza.

El resto de reglas de uso (fondos, fotografía, qué no hacer) están en [`../README.md`](../README.md).
