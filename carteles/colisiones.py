#!/usr/bin/env python3
"""Avisa de pegatinas que se solapan en las hojas.

    python3 carteles/colisiones.py

Cada pieza lleva su posición y su giro en el style inline. Al girar, la
caja que ocupa de verdad crece: para un rectángulo w x h girado θ es
w·|cosθ| + h·|senθ| de ancho. Ajustar a ojo con nueve piezas giradas es
como se colaron los solapes de la primera versión.

Se exige separación de 2 mm entre cajas, que es lo que necesita la
tijera para no entrar en la vecina.
"""

import math
import pathlib
import re
import sys

HOJAS = ["pegatinas.html", "pegatinas-frases.html"]
SEPARACION = 2.0          # mm libres exigidos entre dos piezas
AQUI = pathlib.Path(__file__).parent

ESTILO = re.compile(
    r'class="pieza[^"]*"\s+style="left:([\d.]+)mm;top:([\d.]+)mm;'
    r'width:([\d.]+)mm;height:([\d.]+)mm;transform:rotate\(([-\d.]+)deg\)"'
)


def caja(izq, arriba, an, al, grados):
    """Caja real que ocupa la pieza una vez girada sobre su centro."""
    r = math.radians(abs(grados))
    an2 = an * math.cos(r) + al * math.sin(r)
    al2 = an * math.sin(r) + al * math.cos(r)
    cx, cy = izq + an / 2, arriba + al / 2
    return cx - an2 / 2, cy - al2 / 2, cx + an2 / 2, cy + al2 / 2


def solapan(a, b, holgura):
    hx = min(a[2], b[2]) - max(a[0], b[0])
    hy = min(a[3], b[3]) - max(a[1], b[1])
    if hx > -holgura and hy > -holgura:
        return hx, hy
    return None


fallos = 0
for nombre in HOJAS:
    texto = (AQUI / nombre).read_text()
    piezas = [
        (i + 1, caja(*map(float, m.groups())))
        for i, m in enumerate(ESTILO.finditer(texto))
    ]
    print(f"{nombre}: {len(piezas)} piezas")

    for n, c in piezas:
        if c[0] < 10 or c[1] < 10 or c[2] > 200 or c[3] > 287:
            print(f"  pieza {n}: se sale del margen de 10 mm del A4 "
                  f"({c[0]:.1f},{c[1]:.1f})-({c[2]:.1f},{c[3]:.1f})")
            fallos += 1

    for i, (n1, c1) in enumerate(piezas):
        for n2, c2 in piezas[i + 1:]:
            choque = solapan(c1, c2, SEPARACION)
            if choque:
                print(f"  piezas {n1} y {n2}: solapan "
                      f"{choque[0]:.1f} x {choque[1]:.1f} mm")
                fallos += 1

sys.exit(1 if fallos else 0)
