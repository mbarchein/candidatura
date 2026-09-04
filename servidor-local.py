#!/usr/bin/env python3
"""Servidor de pruebas: sirve web/ y emula la función del ranking.

    python3 servidor-local.py            # http://localhost:8080
    python3 servidor-local.py 9000        # otro puerto

Solo es para probar en local. En Netlify el ranking lo atiende
netlify/functions/ranking.mjs contra Netlify Blobs; aquí se guarda en
ranking-local.json, que está en .gitignore.

Las comprobaciones de plausibilidad son las mismas que las de la función,
para que lo que pruebes sea lo que va a pasar en producción: si aquí te
rechaza una marca imposible, allí también.

Escucha en 0.0.0.0 a propósito, para poder abrirlo desde el móvil en la
misma wifi y probar el toque, que en el móvil no hay hover.
"""

import json
import pathlib
import re
import sys
import time
import unicodedata
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = pathlib.Path(__file__).parent / "web"
DATOS = pathlib.Path(__file__).parent / "ranking-local.json"

# las reglas del reto, iguales que en index.html y en la función
PREGUNTAS = 12
POR_ACIERTO = 100 + 50 + 100
MS_MINIMOS = 12000


def slug(alias):
    a = unicodedata.normalize("NFD", alias.lower())
    a = "".join(c for c in a if unicodedata.category(c) != "Mn")
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9_-]+", "-", a))[:40]


def leer():
    if not DATOS.exists():
        return {}
    try:
        return json.loads(DATOS.read_text())
    except json.JSONDecodeError:
        return {}


ID_VALIDO = re.compile(r"^[a-z0-9-]{8,48}$")


def mejores(marcas):
    # se guarda por id de navegador; el slug que sale es el del alias,
    # que es con lo que el cliente marca cuál es la tuya
    filas = [
        {"slug": slug(m["alias"]) or i, "alias": m["alias"],
         "puntos": m["puntos"], "ts": m["ts"]}
        for i, m in marcas.items()
    ]
    # la lista entera: pagina el cliente, así quien va el 47 puede
    # saltar a su página sin preguntar al servidor
    filas.sort(key=lambda f: (-f["puntos"], f["ts"]))
    return filas


def revisa(m):
    """Devuelve el motivo del rechazo, o None si la marca se sostiene."""
    try:
        total, puntos = int(m["total"]), int(m["puntos"])
        aciertos, racha, ms = int(m["aciertos"]), int(m["racha"]), float(m["ms"])
    except (KeyError, TypeError, ValueError):
        return "faltan datos o no son números"

    if not 1 <= total <= PREGUNTAS:
        return "total fuera de rango"
    if puntos < 0:
        return "puntos no válidos"
    if not 0 <= aciertos <= total:
        return "aciertos fuera de rango"
    if not 0 <= racha <= aciertos:
        return "racha fuera de rango"
    if puntos > aciertos * POR_ACIERTO:
        return "los puntos no cuadran con los aciertos"
    if aciertos == 0 and puntos > 0:
        return "puntos sin aciertos"
    if ms < MS_MINIMOS:
        return "la partida ha durado demasiado poco"
    return None


class Manejador(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(RAIZ), **k)

    def log_message(self, formato, *args):
        if "/api/ranking" in self.path or not self.path.endswith((".webp", ".svg")):
            super().log_message(formato, *args)

    def responde(self, cuerpo, estado=200):
        crudo = json.dumps(cuerpo, ensure_ascii=False).encode()
        self.send_response(estado)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("cache-control", "no-store")
        self.send_header("content-length", str(len(crudo)))
        self.end_headers()
        self.wfile.write(crudo)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/ranking":
            marcas = leer()
            return self.responde({"top": mejores(marcas), "jugadas": len(marcas)})
        # rutas sin extensión, para que /buzon funcione igual que en Netlify
        limpio = self.path.split("?")[0]
        if limpio != "/" and not pathlib.Path(limpio).suffix:
            if (RAIZ / (limpio.lstrip("/") + ".html")).exists():
                self.path = limpio + ".html"
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/ranking":
            return self.responde({"error": "no existe"}, 404)

        largo = int(self.headers.get("content-length") or 0)
        try:
            cuerpo = json.loads(self.rfile.read(largo) or b"{}")
        except json.JSONDecodeError:
            return self.responde({"error": "cuerpo ilegible"}, 400)

        ident = str(cuerpo.get("id", "")).lower()
        if not ID_VALIDO.match(ident):
            return self.responde({"error": "identificador no válido"}, 400)

        alias = " ".join(str(cuerpo.get("alias", "")).split())[:24]
        if len(alias) < 2:
            return self.responde({"error": "alias demasiado corto"}, 400)
        if not slug(alias):
            return self.responde({"error": "alias sin caracteres utilizables"}, 400)

        fallo = revisa(cuerpo)
        if fallo:
            return self.responde({"error": fallo}, 422)

        puntos = int(cuerpo["puntos"])
        marcas = leer()

        # el primero que coge un alias se lo queda: si no, dos filas iguales
        if any(o != ident and slug(m["alias"]) == slug(alias) for o, m in marcas.items()):
            return self.responde({"error": "ese alias ya lo está usando otra persona"}, 409)

        previa = marcas.get(ident)
        if previa and previa["puntos"] >= puntos:
            if previa["alias"] == alias:
                return self.responde(
                    {"guardada": False, "anterior": previa["puntos"], "top": mejores(marcas)}
                )
            # no mejora la marca pero cambia el alias: se renombra
            previa["alias"] = alias
            DATOS.write_text(json.dumps(marcas, ensure_ascii=False, indent=1))
            return self.responde({"guardada": False, "renombrada": True,
                                  "anterior": previa["puntos"], "top": mejores(marcas)})

        marcas[ident] = {
            "alias": alias,
            "puntos": puntos,
            "aciertos": int(cuerpo["aciertos"]),
            "racha": int(cuerpo["racha"]),
            "total": int(cuerpo["total"]),
            "ts": int(time.time() * 1000),
        }
        DATOS.write_text(json.dumps(marcas, ensure_ascii=False, indent=1))
        return self.responde(
            {"guardada": True, "top": mejores(marcas), "jugadas": len(marcas)}
        )


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f"sirviendo {RAIZ} en http://localhost:{puerto}")
    print(f"ranking en http://localhost:{puerto}/api/ranking -> {DATOS.name}")
    ThreadingHTTPServer(("0.0.0.0", puerto), Manejador).serve_forever()
