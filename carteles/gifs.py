#!/usr/bin/env python3
"""Monta los GIF de Compi que se mandan por chat.

    pip install pillow && python3 carteles/gifs.py

Chrome pinta de una sola pasada la tira con todos los fotogramas de cada
GIF -- eso es compi-gifs.html?g=N -- y aquí se corta y se monta. Un
Chrome por GIF en vez de uno por fotograma: son siete capturas en vez de
veintiséis.

La lista de GIF vive en compi-gifs.html y se lee de ahí con ?info=1,
para no tener las frases escritas en dos sitios.

Paleta sin difuminado: el sprite son colores planos y el difuminado de
PIL le mete ruido a los bordes del pixel art.
"""

import json
import pathlib
import re
import shutil
import subprocess
import tempfile

from PIL import Image

AQUI = pathlib.Path(__file__).parent
FUENTE = AQUI / "compi-gifs.html"
SALIDA = AQUI / "gif"
COLORES = 128


def chrome(args):
    perfil = tempfile.mkdtemp()
    try:
        return subprocess.run(
            ["google-chrome", "--headless", "--disable-gpu", "--hide-scrollbars",
             "--force-device-scale-factor=1", "--user-data-dir=" + perfil,
             "--allow-file-access-from-files", "--virtual-time-budget=5000"] + args,
            capture_output=True, text=True, timeout=120).stdout
    finally:
        shutil.rmtree(perfil, ignore_errors=True)


def especies():
    dom = chrome(["--dump-dom", f"file://{FUENTE}?info=1"])
    crudo = re.search(r"SPEC::(\[.*?\])</title>", dom, re.S)
    if not crudo:
        raise SystemExit("no se pudo leer la lista de GIF de compi-gifs.html")
    return json.loads(crudo.group(1).replace("&quot;", '"'))


def monta(spec, i, tmp):
    tira = tmp / f"{spec['nombre']}.png"
    an, al = spec["w"] * spec["n"], spec["h"]
    chrome([f"--window-size={an},{al}", f"--screenshot={tira}",
            f"file://{FUENTE}?g={i}"])
    hoja = Image.open(tira).convert("RGB")
    if hoja.size != (an, al):
        raise SystemExit(f"{spec['nombre']}: la tira salió {hoja.size} y no {(an, al)}")

    cuadros = [
        hoja.crop((k * spec["w"], 0, (k + 1) * spec["w"], al))
            .convert("P", palette=Image.ADAPTIVE, colors=COLORES, dither=Image.NONE)
        for k in range(spec["n"])
    ]
    destino = SALIDA / f"compi-{spec['nombre']}.gif"
    cuadros[0].save(destino, save_all=True, append_images=cuadros[1:],
                    duration=spec["dur"], loop=0, optimize=True, disposal=1)
    return destino


def main():
    SALIDA.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = pathlib.Path(t)
        for i, spec in enumerate(especies()):
            d = monta(spec, i, tmp)
            print(f"{d.name}: {spec['n']} cuadros a {spec['dur']} ms "
                  f"· {spec['w']}x{spec['h']} · {d.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
