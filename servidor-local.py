#!/usr/bin/env python3
"""Servidor de pruebas: sirve web/ y emula la función del ranking.

    python3 servidor-local.py            # http://localhost:8080
    python3 servidor-local.py 9000        # otro puerto

Solo es para probar en local. En Netlify el ranking lo atiende
netlify/functions/ranking.mjs contra Netlify Blobs; aquí se guarda en
ranking-local.json, que está en .gitignore.

Igual que la función, lleva un tablero por juego: /api/ranking es el del
reto y /api/ranking?juego=carrera el del minijuego, que se guarda en
ranking-local-carrera.json. Un juego que no está en JUEGOS da 400.

Las comprobaciones de plausibilidad son las mismas que las de la función,
para que lo que pruebes sea lo que va a pasar en producción: si aquí te
rechaza una marca imposible, allí también.

Escucha en 0.0.0.0 a propósito, para poder abrirlo desde el móvil en la
misma wifi y probar el toque, que en el móvil no hay hover.
"""

import json
import math
import pathlib
import re
import sys
import time
import unicodedata
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

RAIZ = pathlib.Path(__file__).parent / "web"
AQUI = pathlib.Path(__file__).parent

# las reglas del reto, iguales que en index.html y en la función
PREGUNTAS = 12
POR_ACIERTO = 100 + 50 + 100
MS_MINIMOS = 12000

# las reglas de la carrera, iguales que en juego.html y en la función
VOTO = 25                  # puntos por papeleta
VEL_MAX = 32               # metros por segundo, el techo de velocidad del juego
SEP_VOTO = 6               # metros mínimos entre dos papeletas
EXTRA = 100                # puntos por churros o mollete
SEP_EXTRA = 50             # metros mínimos entre dos de esos
MS_MINIMOS_CARRERA = 2000


def slug(alias):
    a = unicodedata.normalize("NFD", alias.lower())
    a = "".join(c for c in a if unicodedata.category(c) != "Mn")
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9_-]+", "-", a))[:40]


def leer(datos):
    if not datos.exists():
        return {}
    try:
        return json.loads(datos.read_text())
    except json.JSONDecodeError:
        return {}


def escribir(datos, marcas):
    datos.write_text(json.dumps(marcas, ensure_ascii=False, indent=1))


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


def revisa_reto(m):
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


def entero(v):
    # como Number.isInteger de la función: 7 y "7" valen, 7.5 y True no.
    # int() a secas truncaría 7.5 a 7 y la marca pasaría
    if isinstance(v, bool):
        raise ValueError
    f = float(v)
    if not f.is_integer():
        raise ValueError
    return int(f)


def revisa_carrera(m):
    try:
        votos = entero(m["votos"])
    except (KeyError, TypeError, ValueError, OverflowError):
        return "votos no válidos"
    try:
        metros = entero(m["metros"])
    except (KeyError, TypeError, ValueError, OverflowError):
        return "metros no válidos"
    try:
        extras = entero(m.get("extras", 0))
    except (TypeError, ValueError, OverflowError):
        return "extras no válidos"
    if votos < 0:
        return "votos no válidos"
    if extras < 0:
        return "extras no válidos"
    if metros < 0:
        return "metros no válidos"

    try:
        ms = float(m["ms"])
    except (KeyError, TypeError, ValueError):
        return "la partida ha durado demasiado poco"
    if not math.isfinite(ms) or ms < MS_MINIMOS_CARRERA:
        return "la partida ha durado demasiado poco"

    # ni a toda velocidad desde el primer segundo se llega más lejos
    if metros > ms / 1000 * VEL_MAX:
        return "demasiados metros para lo que ha durado"
    # las papeletas salen separadas: el +1 es la primera, sin hueco delante
    if votos > metros // SEP_VOTO + 1:
        return "demasiados votos para esos metros"
    # los churros y el mollete, igual pero mucho más espaciados
    if extras > metros // SEP_EXTRA + 1:
        return "demasiados extras para esos metros"

    # sin rachas ni multiplicadores: los puntos salen exactos o no salen
    try:
        puntos = entero(m["puntos"])
    except (KeyError, TypeError, ValueError, OverflowError):
        puntos = None
    if puntos != metros + votos * VOTO + extras * EXTRA:
        return "los puntos no cuadran con metros, votos y extras"
    return None


# un tablero por juego, como en la función. El reto sigue en
# ranking-local.json para no perder lo que ya tengas de pruebas; guarda
# dice qué campos, aparte de alias, puntos y ts, se quedan en la marca
JUEGOS = {
    "reto": {
        "datos": AQUI / "ranking-local.json",
        "revisa": revisa_reto,
        "guarda": lambda c: {"aciertos": int(c["aciertos"]), "racha": int(c["racha"]),
                             "total": int(c["total"])},
    },
    "carrera": {
        "datos": AQUI / "ranking-local-carrera.json",
        "revisa": revisa_carrera,
        "guarda": lambda c: {"votos": entero(c["votos"]), "metros": entero(c["metros"]),
                             "extras": entero(c.get("extras", 0))},
    },
}


def juego_de(ruta):
    """El juego de la query, o None si no existe. Sin parámetro, el reto."""
    nombre = parse_qs(urlsplit(ruta).query).get("juego", [""])[0] or "reto"
    return JUEGOS.get(nombre)


# las mismas que netlify.toml; si allí se añade una, aquí también
REDIRECCIONES = {"/propuestas": "/#propuestas", "/peli": "/#estreno"}


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
            juego = juego_de(self.path)
            if not juego:
                return self.responde({"error": "juego desconocido"}, 400)
            marcas = leer(juego["datos"])
            return self.responde({"top": mejores(marcas), "jugadas": len(marcas)})
        limpio = self.path.split("?")[0]
        # las redirecciones de netlify.toml, para probar aquí las
        # direcciones que salen impresas en los carteles
        if limpio in REDIRECCIONES:
            self.send_response(302)
            self.send_header("location", REDIRECCIONES[limpio])
            self.end_headers()
            return None
        # rutas sin extensión, para que /buzon funcione igual que en Netlify
        if limpio != "/" and not pathlib.Path(limpio).suffix:
            if (RAIZ / (limpio.lstrip("/") + ".html")).exists():
                self.path = limpio + ".html"
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/ranking":
            return self.responde({"error": "no existe"}, 404)
        juego = juego_de(self.path)
        if not juego:
            return self.responde({"error": "juego desconocido"}, 400)
        datos = juego["datos"]

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

        fallo = juego["revisa"](cuerpo)
        if fallo:
            return self.responde({"error": fallo}, 422)

        puntos = int(float(cuerpo["puntos"]))
        marcas = leer(datos)

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
            escribir(datos, marcas)
            return self.responde({"guardada": False, "renombrada": True,
                                  "anterior": previa["puntos"], "top": mejores(marcas)})

        marcas[ident] = {
            "alias": alias,
            "puntos": puntos,
            **juego["guarda"](cuerpo),
            "ts": int(time.time() * 1000),
        }
        escribir(datos, marcas)
        return self.responde(
            {"guardada": True, "top": mejores(marcas), "jugadas": len(marcas)}
        )


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f"sirviendo {RAIZ} en http://localhost:{puerto}")
    for nombre, juego in JUEGOS.items():
        print(f"ranking {nombre} en http://localhost:{puerto}/api/ranking?juego={nombre}"
              f" -> {juego['datos'].name}")
    ThreadingHTTPServer(("0.0.0.0", puerto), Manejador).serve_forever()
