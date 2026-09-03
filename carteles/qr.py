#!/usr/bin/env python3
"""Genera el QR del buzón que va en el cartel 01.

    pip install segno && python3 carteles/qr.py

Sale un SVG de un solo <path>, sin fondo, en el color de la tinta del
cartel claro: se coloca sobre el papel del propio cartel y no lleva
cuadro blanco alrededor porque el cartel ya es claro.

Si cambia la dirección del buzón, toca URL, vuelve a ejecutar esto y
reexporta el cartel 01:

    ./carteles/exportar.sh 1

Corrección de errores en Q (25%): un QR impreso o mirado en el móvil de
otro sigue leyéndose con una esquina tapada por un dedo.
"""

import pathlib

import segno

URL = "https://sin-siglas.info/buzon"
SALIDA = pathlib.Path(__file__).parent / "qr-buzon.svg"
TINTA = "#191820"          # --texto del tema claro

qr = segno.make(URL, error="q")
qr.save(
    SALIDA,
    kind="svg",
    scale=10,
    border=0,              # el margen lo pone el cartel, no el QR
    dark=TINTA,
    light=None,            # sin fondo: se ve el papel del cartel
    svgclass=None,
    lineclass=None,
    omitsize=True,         # sin width/height: manda el CSS del cartel
    svgversion=None,
)

print(f"{SALIDA.name}: {qr.symbol_size(scale=1, border=0)[0]} módulos · {URL}")
