#!/usr/bin/env python3
"""Genera los QR que van en los carteles.

    pip install segno && python3 carteles/qr.py

Cada uno sale como un SVG de un solo <path>, sin fondo, en el color de
la tinta del cartel claro: se coloca sobre el papel del propio cartel y
no lleva cuadro blanco alrededor porque el cartel ya es claro.

Si cambia una dirección, toca QR, vuelve a ejecutar esto y reexporta el
cartel que lo lleve:

    ./carteles/exportar.sh 1 11

Corrección de errores en Q (25%): un QR impreso o mirado en el móvil de
otro sigue leyéndose con una esquina tapada por un dedo.
"""

import pathlib

import segno

QR = {
    "qr-buzon.svg": "https://sin-siglas.info/buzon",
    "qr-reto.svg": "https://sin-siglas.info/#quiz",
}
AQUI = pathlib.Path(__file__).parent
TINTA = "#191820"          # --texto del tema claro

for nombre, url in QR.items():
    qr = segno.make(url, error="q")
    qr.save(
        AQUI / nombre,
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
    print(f"{nombre}: {qr.symbol_size(scale=1, border=0)[0]} módulos · {url}")
