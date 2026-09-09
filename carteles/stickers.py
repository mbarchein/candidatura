#!/usr/bin/env python3
"""Saca las pegatinas de WhatsApp de Compi.

    pip install pillow && python3 carteles/stickers.py

Salen a 512x512 WEBP con fondo transparente, que es lo que pide WhatsApp,
y por debajo de 100 KB cada una. El pack se monta en el móvil con
cualquier app de stickers: esto genera los ficheros, que es la parte que
no se puede hacer a mano.

NINGUNA lleva `29-S` ni la web impresos, y eso no es un descuido: sin
esas marcas no son propaganda electoral, así que no les aplica el cierre
del art. 8.4 del RD 1844/1994 y pueden quedarse en el teclado de la gente
el lunes 28 y el martes 29.

La transparencia la da --default-background-color=00000000; sin eso
Chrome saca el PNG con fondo blanco y el sticker queda con un cuadro.
"""

import json
import pathlib
import re
import shutil
import subprocess
import tempfile

from PIL import Image

AQUI = pathlib.Path(__file__).parent
FUENTE = AQUI / "stickers.html"
SALIDA = AQUI / "stickers"


def chrome(args):
    perfil = tempfile.mkdtemp()
    try:
        return subprocess.run(
            ["google-chrome", "--headless", "--disable-gpu", "--hide-scrollbars",
             "--force-device-scale-factor=1", "--user-data-dir=" + perfil,
             "--default-background-color=00000000",
             "--allow-file-access-from-files", "--virtual-time-budget=5000"] + args,
            capture_output=True, text=True, timeout=120).stdout
    finally:
        shutil.rmtree(perfil, ignore_errors=True)


def main():
    SALIDA.mkdir(exist_ok=True)
    dom = chrome(["--dump-dom", f"file://{FUENTE}?info=1"])
    crudo = re.search(r"SPEC::(\[.*?\])</title>", dom, re.S)
    if not crudo:
        raise SystemExit("no se pudo leer la lista de pegatinas de stickers.html")
    spec = json.loads(crudo.group(1).replace("&quot;", '"'))

    with tempfile.TemporaryDirectory() as t:
        for i, st in enumerate(spec):
            png = pathlib.Path(t) / f"{st['nombre']}.png"
            chrome(["--window-size=512,512", f"--screenshot={png}",
                    f"file://{FUENTE}?s={i}"])
            im = Image.open(png).convert("RGBA")
            if im.size != (512, 512):
                raise SystemExit(f"{st['nombre']}: salió {im.size} y no (512, 512)")
            if im.getextrema()[3][0] == 255:
                raise SystemExit(f"{st['nombre']}: sin transparencia, revisa Chrome")
            destino = SALIDA / f"compi-{st['nombre']}.webp"
            im.save(destino, "WEBP", lossless=True, quality=90, method=6)
            kb = destino.stat().st_size / 1024
            aviso = "  <-- pasa de 100 KB" if kb > 100 else ""
            print(f"{destino.name}: 512x512 · {kb:.0f} KB{aviso}")


if __name__ == "__main__":
    main()
