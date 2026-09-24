#!/usr/bin/env python3
"""Regenera el paquete de imprenta a partir de los archivos maestros de `../`.

    pip3 install fonttools uharfbuzz
    python3 packages/ui/brand/imprenta/generar.py

Convierte los <text> en <path> y exporta PDF. Se usa HarfBuzz para el shaping, de modo que
el trazado sale idéntico a lo que dibuja el navegador, kerning incluido.
"""
import html
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import uharfbuzz as hb
from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

BRAND = Path(__file__).resolve().parent.parent
OUT = BRAND / "imprenta"
CACHE = Path(tempfile.gettempdir()) / "resona-imprenta"
FUENTE_URL = "https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# La línea de corte de las tarjetas: 91x61 mm de pliego, 85x55 mm reales, 3 mm de sangre.
CORTE = (3.0, 3.0, 88.0, 58.0)

_fuentes = {}


def _fuente(peso):
    if peso not in _fuentes:
        CACHE.mkdir(parents=True, exist_ok=True)
        base = CACHE / "Montserrat.ttf"
        if not base.exists():
            # curl y no urllib: el Python de python.org no trae certificados raiz en macOS
            subprocess.run(["curl", "-sL", "-o", str(base), FUENTE_URL], check=True)
        inst = CACHE / f"Montserrat-{peso}.ttf"
        if not inst.exists():
            instantiateVariableFont(TTFont(base), {"wght": peso}).save(inst)
        tt = TTFont(inst)
        font = hb.Font(hb.Face(inst.read_bytes()))
        font.scale = (tt["head"].unitsPerEm, tt["head"].unitsPerEm)
        _fuentes[peso] = (tt, tt.getGlyphSet(), font, tt["head"].unitsPerEm)
    return _fuentes[peso]


def _trazar(attrs, texto):
    tam = float(attrs["font-size"])
    peso = int(attrs.get("font-weight", 400))
    tracking = float(attrs.get("letter-spacing", 0))
    tt, glyphset, hbfont, upm = _fuente(peso)
    escala = tam / upm

    buf = hb.Buffer()
    buf.add_str(texto)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})

    orden = tt.getGlyphOrder()
    colocados, avance = [], 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        colocados.append((orden[info.codepoint], avance + pos.x_offset * escala))
        # CSS añade el letter-spacing también tras el último glifo: por eso las anclas
        # de los originales están desplazadas media unidad de tracking a la derecha.
        avance += pos.x_advance * escala + tracking

    x, y = float(attrs["x"]), float(attrs["y"])
    anchor = attrs.get("text-anchor", "start")
    if anchor == "middle":
        x -= avance / 2
    elif anchor == "end":
        x -= avance

    pen = SVGPathPen(glyphset, ntos=lambda v: f"{v:.3f}")
    caja = BoundsPen(glyphset)
    for nombre, dx in colocados:
        t = Transform(escala, 0, 0, -escala, x + dx, y)
        glyphset[nombre].draw(TransformPen(pen, t))
        glyphset[nombre].draw(TransformPen(caja, t))

    extra = "".join(f' {k}="{v}"' for k, v in attrs.items()
                    if k in ("opacity", "fill-opacity", "transform"))
    nodo = f'<path d="{pen.getCommands()}" fill="{attrs.get("fill", "#000000")}"{extra}/>'
    return nodo, caja.bounds


TEXT_RE = re.compile(r"<text\b([^>]*)>(.*?)</text>", re.S)
ATTR_RE = re.compile(r'([\w-]+)\s*=\s*"([^"]*)"')


def convertir(src, dst):
    cajas = []

    def repl(m):
        attrs = dict(ATTR_RE.findall(m.group(1)))
        nodo, caja = _trazar(attrs, html.unescape(m.group(2)).strip())
        cajas.append((html.unescape(m.group(2)).strip(), caja))
        return nodo

    svg = TEXT_RE.sub(repl, src.read_text())
    if "<text" in svg:
        sys.exit(f"{src.name}: han quedado <text> sin trazar")
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(svg)
    return cajas


def pdf(rel, ancho_mm, alto_mm):
    svg = (OUT / rel).read_text()
    svg = re.sub(r'\swidth="[\d.]+mm"\s+height="[\d.]+mm"', " ", svg, count=1)
    svg = re.sub(r"^<svg ", f'<svg width="{ancho_mm}mm" height="{alto_mm}mm" ', svg, count=1)
    tmp = CACHE / (rel.replace("/", "_") + ".html")
    tmp.write_text(
        f'<!doctype html><meta charset="utf-8"><style>'
        f"@page{{size:{ancho_mm}mm {alto_mm}mm;margin:0}}"
        f"html,body{{margin:0;padding:0}}svg{{display:block}}</style>{svg}"
    )
    destino = OUT / "pdf" / (Path(rel).stem + ".pdf")
    destino.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={destino}", "--virtual-time-budget=4000", tmp.as_uri()],
        capture_output=True, timeout=120, check=False,
    )
    return destino


def main():
    trabajos = []
    for base in ("resona-events", "resona-rent"):
        for var in ("", "-negativo", "-mono-negro", "-mono-blanco"):
            trabajos.append((f"{base}{var}.svg", 200.0, 200.0 * 219.0 / 811.6))
    for tarjeta in sorted((BRAND / "tarjetas").glob("*.svg")):
        trabajos.append((f"tarjetas/{tarjeta.name}", 91.0, 61.0))

    for rel, ancho, alto in trabajos:
        cajas = convertir(BRAND / rel, OUT / rel)
        salida = pdf(rel, ancho, alto)
        avisos = ""
        if rel.startswith("tarjetas/"):
            for texto, c in cajas:
                if c and (c[0] < CORTE[0] or c[1] < CORTE[1] or c[2] > CORTE[2] or c[3] > CORTE[3]):
                    avisos += f"\n    AVISO: «{texto}» se sale del corte ({c[0]:.2f}–{c[2]:.2f} mm)"
        print(f"{rel} -> imprenta/{rel} + pdf/{salida.name}{avisos}")


if __name__ == "__main__":
    main()
