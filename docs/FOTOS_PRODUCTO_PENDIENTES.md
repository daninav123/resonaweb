# Fotos y nombres de producto pendientes — ReSona Rent

Generado el 2026-09-24 contra el catálogo de producción (80 referencias).

## Por qué existe este documento

Las imágenes subidas al backend se pierden en cada deploy porque Render usa disco
efímero — ver [PROBLEMA-STORAGE-IMAGENES.md](PROBLEMA-STORAGE-IMAGENES.md). De las 53
referencias que tenían imagen en base de datos, **18 se ven y 35 dan 404**. Las 35
perdidas eran capturas del 4 de agosto y no hay copia en ningún sitio.

**Formato que funciona**: recorte del producto sobre fondo blanco. Las 18 que
sobreviven son fotos de prensa de fabricante y por eso la rejilla queda homogénea.
Fondo oscuro no vale: casi todo el material es negro y desaparece.

---

## 1. Fotos pendientes (49)

| Producto | Se puede buscar oficial |
|---|---|
| Altavoz LD System Curv 500TS | Sí |
| bases | No — foto propia |
| Behringheir xair18 | Sí |
| Cabina jardin | No — foto propia |
| Cabina palets | No — foto propia |
| Carga confeti | No — foto propia |
| cubos | No — foto propia |
| distribuidor 32a | No — foto propia |
| focos spot pequeños | No — foto propia |
| generador 6500w | No — foto propia |
| Guirlanda bombilla incandesdecente 25m | No — foto propia |
| Guirnalda led | No — foto propia |
| lanzador confeti | No — foto propia |
| Letras | No — foto propia |
| Maquina de humo Hazer 1000 w | Sí |
| Mesa Chamsys QuickQ 20 | Sí |
| Micro audibax sm570 | Sí |
| Micro audibax sm580 | Sí |
| Micro Behringer BA 19A | Sí |
| Micro inalámbrico | No — foto propia |
| Micro Piezoelectrico pinza | No — foto propia |
| mini truss 2m 14cm | No — foto propia |
| mini wash | No — foto propia |
| Modulo pantalla led p3.91 1000x500 | No — foto propia |
| Máquina fuego frío 700w | No — foto propia |
| pantalla | No — foto propia |
| Pantalla LED 3×2 m P3.9 | No — foto propia |
| Pata regulable 0,6-1m | No — foto propia |
| patas 1 m | No — foto propia |
| Polvo Fuego Frio | No — foto propia |
| Procesador t racks 204 | Sí |
| Proyector | No — foto propia |
| semicírculos 4m diametro | No — foto propia |
| Set micro 2 micros inalámbricos | No — foto propia |
| Soporte Gravity Blanco | Sí |
| Soundcraft EPM8 | Sí |
| Spliter 32a | No — foto propia |
| tarima 2x1 | No — foto propia |
| Tarima escenario 2x0,5 | No — foto propia |
| top | No — foto propia |
| Torre elevadora Guil ELC 785 | Sí |
| Totem madera 1m | No — foto propia |
| Totems madera 2m | No — foto propia |
| truss 1 m | No — foto propia |
| truss 1.5m | No — foto propia |
| truss 2 m | No — foto propia |
| trípodes grandes | No — foto propia |
| Trípodes negros | No — foto propia |
| Zapatillas | No — foto propia |

---

## 2. Nombres que hay que corregir en base de datos

Esto no se arregla con ningún rediseño: el cliente lee el nombre tal cual está en BD.

### Faltas de ortografía (9)

| Actual | Corrección |
|---|---|
| Adapador trípode/mariposa | adaptador trípode/mariposa |
| Alargadores shucko | Alargadores Schuko |
| Behringheir xair18 | Behringer xair18 |
| Guirlanda bombilla incandesdecente 25m | guirnalda bombilla incandescente 25m |
| Maguera trifasica 5 metros | manguera trifásica 5 metros |
| Manguera trifasica 20 metros | Manguera trifásica 20 metros |
| Polvo Fuego Frio | Polvo Fuego frío |
| Spliter 32a | splitter 32a |
| alimentacion powercon | alimentación powercon |

### Nombres internos de almacén (9)

Un cliente no sabe qué es «Zapatillas» ni «top». Hay que renombrarlos a algo
que se entienda desde fuera.

| Actual |
|---|
| Letras |
| Proyector |
| Zapatillas |
| bases |
| cubos |
| pantalla |
| patas 1 m |
| semicírculos 4m diametro |
| top |

### Empiezan en minúscula (21)

Mezclados con los que sí empiezan en mayúscula, en la misma rejilla.

---

## 3. Cómo subirlas sin morir en el intento

Una a una por el panel son 49 vueltas de buscar producto, abrir modal, elegir
archivo y guardar. Hay un script que lo hace en dos pasos:

```bash
cd packages/backend

# 1. Empareja los archivos de una carpeta con los productos
npx ts-node --transpile-only src/scripts/bulk-upload-product-photos.ts --plan ~/fotos-resona

# 2. Revisa plan-fotos.json, corrige los productId dudosos, y aplica
npx ts-node --transpile-only src/scripts/bulk-upload-product-photos.ts --apply
```

El emparejado va por el nombre del archivo, así que cuanto más se parezca al
nombre del producto, mejor: `das-audio-action-215a.jpg` acierta solo, `IMG_4821.jpg`
sale marcado para que lo asignes a mano.

Nunca pisa un producto que ya tenga foto, salvo que añadas `--overwrite`.

## 4. No necesitan foto

Accesorios y cableado van en lista sin imagen en el catálogo nuevo.
