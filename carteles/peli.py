#!/usr/bin/env python3
"""La peli de Compi: las nueve propuestas, contadas por Compi y con los once en píxeles.

    python3 -m venv ~/.venv-peli && ~/.venv-peli/bin/pip install edge-tts pillow numpy
    ~/.venv-peli/bin/python carteles/peli.py              # monta carteles/video/peli-compi.mp4
    ~/.venv-peli/bin/python carteles/peli.py --muestra 3  # solo la escena 3, para mirarla rápido

Sustituye al vídeo de voces (GUION-VIDEO.md, video.py), que no llegó a
grabarse. Aquí no habla nadie de la lista: habla Compi, con voz sintética,
y los once salen dibujados como él. Es a propósito. Poner una voz de
máquina con el nombre de un compañero debajo es hacerle decir algo con una
voz que no es la suya; con Compi no hay duda de quién habla.

LO QUE SE DECIDIÓ AL REVISARLO (animación, dirección y campaña, 25-S):

- Dura unos dos minutos. Lo que es texto fijo -- el pie legal, «en urna y
  en secreto», el horario de la mesa, la URL -- va escrito en la tarjeta
  final y no se dice.
- Engancha en el fotograma 0, que es la miniatura del chat: Compi ya está
  en cuadro, con el abanico, bajo «Elecciones al comité · 29-S».
- El cartel entero no se enseña nunca: a 1080 de ancho su letra no se lee
  en un móvil. Se ve la mitad de arriba (el titular) y, en la frase de la
  salvedad, la de abajo (el recuadro de «lo que no depende de nosotros»).
  Sale del PNG al doble, así que el recorte va nítido.
- Los once salen juntos, con su nombre, en la intro y en el cierre.
- José Pablo no lleva ninguna propuesta en cartel -- la suya se descartó
  el 23 --, así que cuenta la de parking con Rafael. Por eso la banda de
  abajo dice «la cuentan» y no «lo llevan»: en el vídeo cada una la
  cuentan dos, y las piden los once. En la escena de parking la cámara no
  baja al pie del cartel, donde salen otras dos caras.
- Sin confeti: nada está conseguido, y celebrarlo contradice la frase de
  «ninguna está conseguida». Sin QR: no se escanea la pantalla en la que
  lo estás viendo.
- «Vota a Sin siglas» y no «vota sin siglas», que oído suena a «vota sin
  estar afiliado».

EL GUION ESTÁ AQUÍ ABAJO, en GUION. Cada frase es un subtítulo y se
sintetiza por separado, así que el subtítulo entra y sale justo con la
voz. Lo que se dice y lo que se lee pueden ser distintos: «veintinueve» se
dice y «29» se lee, «de ene i» se dice y «DNI» se lee. Entre asteriscos, lo
que se pinta en coral en el bocadillo.

La voz es es-ES-AlvaroNeural por edge-tts, un punto más aguda. Ojo: eso
manda el texto del guion al servicio de voz de Microsoft. Es texto que se
va a publicar igual, pero no sale de la máquina solo si se vuelve a Piper.
Las frases se guardan en carteles/video/voz-compi/, que está en
.gitignore, y solo se piden las que cambian.

Los muñecos los dibuja peli-sprites.js con el mismo compi.js de los
carteles. Los carteles al doble se sacan con

    google-chrome --headless --force-device-scale-factor=2 --window-size=1080,1350 \\
      --screenshot=carteles/video/carteles-2x/<nombre>.png "file://.../carteles.html?n=<n>"

1080 x 1920, vertical, 25 fps. Los subtítulos van siempre, en el
bocadillo de Compi: esto se ve en un chat, en silencio y de pie.
"""

import asyncio
import hashlib
import json
import math
import pathlib
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFont

AQUI = pathlib.Path(__file__).parent
SALIDA = AQUI / "video"
CACHE = SALIDA / "voz-compi"
CARTELES = SALIDA / "carteles-2x"
TIPOS = AQUI.parent / "fuentes"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

ANCHO, ALTO, FPS = 1080, 1920, 25
SR = 24000
VOZ = "es-ES-AlvaroNeural"
VOZ_TONO = "+18Hz"     # un punto más agudo: la voz de un muñeco, no la de un locutor
VOZ_RITMO = "+6%"
PAUSA = 0.32           # entre frase y frase

PAPEL, PANEL = (246, 242, 234), (255, 253, 249)
TINTA, TEXTO_2, APAGADO = (25, 24, 32), (58, 55, 66), (94, 87, 78)
CIAN, CORAL = (13, 111, 146), (191, 63, 47)
CIAN_VIVO, CORAL_VIVO = (63, 201, 240), (244, 121, 107)

# el escenario, de arriba abajo
BANDA = 104                          # rótulo y marcador
VENTANA = (0, 116, 1080, 1016)       # donde se ve el trozo de cartel
ETIQUETA_Y = 1034                    # «lo llevan · …»
BOCADILLO = (40, 1136, 1040, 1356)
SUELO = 1856
# el trozo de cartel, en coordenadas del cartel de 1080 x 1350: ancho fijo
# y el alto que da la proporción de la ventana. Arriba sale el titular;
# abajo, el recuadro de la salvedad y las caras de quien lo lleva
ZONA_ANCHO = 1060
ZONA_ALTO = ZONA_ANCHO * (VENTANA[3] - VENTANA[1]) / (VENTANA[2] - VENTANA[0])
ZONAS = {"titular": 44, "caja": 1350 - ZONA_ALTO - 4}

GENTE = {
    "munoz": ("Laura", "Muñoz"), "navarro": ("Raúl", "Navarro"), "galindo": ("Rocío", "Galindo"),
    "fernandez": ("José Pablo", "Fernández"), "lopezm": ("Rafael", "López"), "bolivar": ("Fran", "Bolívar"),
    "algarra": ("Leticia", "Algarra"), "barchein": ("Mario", "Barchéin"), "aranda": ("Mario", "Aranda"),
    "lopeza": ("Violeta", "López"), "castillo": ("María Emilia", "Castillo"),
}
SUPLENTES = {"lopeza", "castillo"}
ORDEN = list(GENTE)


def F(dicho, leido=None, **kw):
    """Una frase del guion. kw: pose (la de Compi en esa frase), zona
    ("titular" o "caja"), cartel (si cambia a mitad de escena), silencio
    (se corta la música justo antes), nombra (Compi dice los nombres: los
    dos saludan), serio (los dos se ponen serios)."""
    return dict(dicho=dicho, leido=leido or dicho, **kw)


# ------------------------------------------------------------------
# EL GUION
# ------------------------------------------------------------------
GUION = [
    {"tipo": "intro", "frases": [
        F("Julio. Cuarenta grados. Y sin intensiva.", "Julio. *40 grados.* Y sin intensiva.", pose="calor"),
        F("Eso se pide desde el comité de empresa, y el martes veintinueve lo eliges tú.",
          "Eso se pide desde el comité de empresa, y *el martes 29* lo eliges tú.", pose="explica"),
        F("Soy Compi, y estos somos Sin siglas: once de la casa, sin ningún sindicato detrás.",
          "Soy Compi, y estos somos *Sin siglas*: once de la casa, sin ningún sindicato detrás.", pose="saluda"),
        F("Traemos nueve peticiones, no promesas: quien firma es la empresa.",
          "Traemos *nueve peticiones*, no promesas: quien firma es la empresa."),
        F("Cada una la cuentan dos, pero las pedimos los once.",
          "Cada una la cuentan dos, pero *las pedimos los once*."),
    ]},
    {"tipo": "propuesta", "n": [1], "cartel": "verano-intensiva", "quien": ["algarra", "galindo"],
     "frases": [
         F("En julio también hace cuarenta grados, y el convenio solo da intensiva en agosto.",
           "En julio también hace 40 grados, y el convenio solo da intensiva *en agosto*.", pose="calor"),
         F("Leticia y Rocío piden los dos meses: las mismas horas al año, y sin tocar tus vacaciones.",
           "Leticia y Rocío piden *los dos meses*: las mismas horas al año, y sin tocar tus vacaciones.",
           nombra=True),
     ]},
    {"tipo": "propuesta", "n": [2], "cartel": "cumpleanos", "quien": ["aranda", "castillo"],
     "frases": [
         F("Mario Aranda y María Emilia piden tu cumpleaños libre, aparte de tus vacaciones.",
           "Mario Aranda y María Emilia piden *tu cumpleaños libre*, aparte de tus vacaciones.",
           pose="tarta", nombra=True),
         F("Si cae en fin de semana o en vacaciones, no se pierde."),
         F("Ojo: ninguna norma lo da. Se negocia.", "Ojo: *ninguna norma lo da*. Se negocia.", zona="caja", serio=True),
     ]},
    {"tipo": "propuesta", "n": [3], "cartel": "bici-y-patinete", "quien": ["lopezm", "aranda"],
     "frases": [
         F("Si vienes en bici o en patinete, no hay ningún sitio cerrado donde dejarlo.", pose="patinete"),
         F("Rafael y Mario Aranda piden uno con llave: una jaula en la cochera, o una zona cerrada en el patio.",
           "Rafael y Mario Aranda piden uno *con llave*: una jaula en la cochera, o una zona cerrada en el patio.",
           nombra=True),
     ]},
    {"tipo": "propuesta", "n": [4], "cartel": "parking", "quien": ["fernandez", "lopezm"],
     "frases": [
         F("José Pablo y Rafael cuentan la del coche: plaza de parking sin coste para quien tiene que venir.",
           "José Pablo y Rafael cuentan la del coche: *plaza de parking sin coste* para quien tiene que venir.",
           pose="plaza", nombra=True),
         F("Y el criterio de reparto, por escrito, para que todos sepamos cómo va."),
         F("La plaza la paga la empresa. Lo que sí se comprueba es el reparto.",
           "La plaza la paga la empresa. Lo que sí se comprueba es *el reparto*.", serio=True),
     ]},
    {"tipo": "propuesta", "n": [5], "cartel": "medico", "quien": ["lopeza", "navarro"],
     "frases": [
         F("Médico por la pública: la hora está cubierta. Por la privada, la pones tú.", pose="medico"),
         F("Violeta y Raúl piden que dé igual por dónde entres.",
           "Violeta y Raúl piden que *dé igual* por dónde entres.", nombra=True),
         F("Y que valga también para acompañar a quien tienes a cargo."),
     ]},
    {"tipo": "propuesta", "n": [6], "cartel": "dietas", "quien": ["aranda", "munoz"],
     "frases": [
         F("¿Viaje de trabajo? Las comidas y los taxis, los adelantas tú.", pose="maleta"),
         F("Laura y Mario Aranda piden un anticipo, o una tarjeta, antes de salir.",
           "Laura y Mario Aranda piden *un anticipo o una tarjeta* antes de salir.", nombra=True),
         F("Ni un euro más de dieta: solo que no salga de tu bolsillo.",
           "*Ni un euro más* de dieta: solo que no salga de tu bolsillo.", zona="caja"),
     ]},
    {"tipo": "propuesta", "n": [7], "cartel": "compensacion", "quien": ["navarro", "algarra"],
     "frases": [
         F("Guardias, viajes, horas de más: Raúl y Leticia piden un criterio escrito e igual para todos.",
           "Guardias, viajes, horas de más: Raúl y Leticia piden un criterio *escrito e igual para todos*.",
           pose="reloj", nombra=True),
         F("Para saber antes, y no después, qué te toca.", zona="caja"),
     ]},
    {"tipo": "propuesta", "n": [8], "cartel": "jornada-4-dias", "quien": ["barchein", "munoz"],
     "frases": [
         F("Mario Barchéin y Laura traen la semana de cuatro días, sin alargar el día.",
           "Mario Barchéin y Laura traen *la semana de cuatro días*, sin alargar el día.",
           pose="cansado", nombra=True),
         F("Es la más cara: ocho horas menos a la semana. No prometemos que salga.",
           "Es la más cara: ocho horas menos a la semana. *No prometemos que salga.*",
           zona="caja", silencio=True, serio=True, pose="serio"),
         F("Lo que sí haremos: pedir un piloto pactado, y contarte en qué queda.",
           "Lo que sí haremos: *pedir un piloto pactado*, y contarte en qué queda."),
     ]},
    {"tipo": "propuesta", "n": [9], "cartel": "ambiente", "quien": ["navarro", "bolivar"],
     "frases": [
         F("Comer delante del portátil no es una pausa.", pose="sillon"),
         F("Raúl y Fran piden dos sitios fuera del puesto: uno para comer, y otro para desconectar.",
           "Raúl y Fran piden *dos sitios fuera del puesto*: uno para comer, y otro para desconectar.",
           nombra=True),
         F("En una oficina no es obligatorio. Por eso se pide.", zona="caja"),
     ]},
    {"tipo": "cierre", "frases": [
        F("Ninguna está conseguida todavía: quien firma es la empresa.",
          "*Ninguna está conseguida todavía*: quien firma es la empresa.", silencio=True, pose="serio"),
        F("Las pedimos por escrito el primer mes, publicamos lo que contesten, y en enero lo compruebas.",
          "Las pedimos por escrito el primer mes, publicamos lo que contesten, y *en enero lo compruebas*."),
        F("Pero solo las puede pedir el comité, y el comité lo eliges tú.",
          "Pero solo las puede pedir el comité, y *el comité lo eliges tú*."),
        F("El martes veintinueve vota toda la plantilla, afiliada o no.",
          "El martes 29 vota *toda la plantilla*, afiliada o no."),
        F("Y no olvides tu de ene i físico el día de las votaciones. Ni foto, ni móvil.",
          "Y no olvides tu *DNI físico* el día de las votaciones. Ni foto, ni móvil.", dni=True),
        F("El buzón de la web sigue abierto, y seguirá abierto después de la campaña.",
          "El buzón sigue abierto, y *seguirá abierto después de la campaña*: sin-siglas.info/buzon", buzon=True),
        F("Vota a Sin siglas. ¡Nos vemos en la urna!", "*Vota a Sin siglas.* ¡Nos vemos en la urna!", pose="vota"),
    ]},
    {"tipo": "final", "frases": []},
]


# ------------------------------------------------------------------
# voz
# ------------------------------------------------------------------
def lee_wav(f):
    with wave.open(str(f)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def sintetiza(texto):
    """Una frase en la voz de Compi. Cacheada por texto y ajustes."""
    import edge_tts
    CACHE.mkdir(parents=True, exist_ok=True)
    clave = hashlib.sha1(f"{VOZ}|{VOZ_TONO}|{VOZ_RITMO}|{texto}".encode()).hexdigest()[:16]
    final = CACHE / f"{clave}.wav"
    if not final.exists():
        mp3 = CACHE / f"{clave}.mp3"
        asyncio.run(edge_tts.Communicate(texto, VOZ, rate=VOZ_RITMO, pitch=VOZ_TONO).save(str(mp3)))
        # edge-tts deja ~100 ms de aire delante y detrás: se recorta para
        # que el subtítulo y la boca vayan con la voz y no antes
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ac", "1", "-ar", str(SR), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        str(final)], check=True)
        mp3.unlink()
    return lee_wav(final)


# ------------------------------------------------------------------
# muñecos
# ------------------------------------------------------------------
class Sprites:
    """Pide a peli-sprites.js todas las rejillas de golpe y las cachea escaladas."""

    CAMPOS = ("quien", "pose", "tt", "izq", "boca", "mira", "aplasta", "estira")

    def __init__(self):
        self.pedidas, self.rejillas, self.escaladas = {}, {}, {}

    @staticmethod
    def clave(q):
        return (q["quien"], q["pose"], int(q.get("tt", 0)), bool(q.get("izq")), int(q.get("boca", 0)),
                tuple(q["mira"]) if q.get("mira") else None, bool(q.get("aplasta")), bool(q.get("estira")))

    def pide(self, q):
        self.pedidas.setdefault(self.clave(q), q)

    def carga(self):
        faltan = [k for k in self.pedidas if k not in self.rejillas]
        if not faltan:
            return
        peticiones = [{c: v for c, v in zip(self.CAMPOS, k) if v is not None} for k in faltan]
        salida = subprocess.run(["node", str(AQUI / "peli-sprites.js")], input=json.dumps(peticiones),
                                capture_output=True, text=True, check=True).stdout.split("\n")
        for k, linea in zip(faltan, salida):
            rejilla, dy = linea.split("|")
            im = Image.new("RGBA", (27, 36), (0, 0, 0, 0))
            px = im.load()
            for i, c in enumerate(rejilla.split(",")):
                if c:
                    px[i % 27, i // 27] = tuple(int(c[j:j + 2], 16) for j in (1, 3, 5)) + (255,)
            self.rejillas[k] = (im, int(dy))

    def imagen(self, q, esc):
        k = self.clave(q)
        if (k, esc) not in self.escaladas:
            im, dy = self.rejillas[k]
            self.escaladas[(k, esc)] = (im.resize((27 * esc, 36 * esc), Image.NEAREST), dy)
        return self.escaladas[(k, esc)]


def pinta_muneco(lienzo, sprites, m):
    """m: {q, x, pies, esc, salto}. La x y la y se ajustan a la rejilla del
    muñeco para que el píxel no nade medio punto entre fotogramas. La
    sombra se queda en el suelo aunque el muñeco salte, y encoge con el aire."""
    q, cx, pies, esc = m["q"], m["x"], m["pies"], m["esc"]
    salto = m.get("salto", 0)
    im, dy = sprites.imagen(q, esc)
    x0 = int(cx - 13.5 * esc)
    x0 -= x0 % esc
    y0 = int(pies - salto - 35 * esc)
    y0 -= (y0 - pies) % esc
    aire = max(0, -dy) + salto / esc
    d = ImageDraw.Draw(lienzo, "RGBA")
    xc = x0 + 13.5 * esc
    for fila, an in enumerate((11, 7)):
        an = max(3, an - aire * 0.8) * esc
        alfa = int(255 * max(0.08, 0.22 - aire * 0.02))
        d.rectangle([xc - an / 2, pies + fila * esc, xc + an / 2, pies + (fila + 1) * esc - 1], fill=(4, 10, 26, alfa))
    lienzo.paste(im, (x0, y0), im)


def urna(lienzo, cx, pies, esc):
    """La urna del cierre, en píxeles de 16 x 12 y con la ranura arriba."""
    d = ImageDraw.Draw(lienzo)
    w, h = 16 * esc, 12 * esc
    x0, y0 = cx - w // 2, pies - h
    d.rectangle([x0 - esc, y0 - esc, x0 + w + esc - 1, pies + esc - 1], fill=(5, 12, 28))
    d.rectangle([x0, y0, x0 + w - 1, pies - 1], fill=(233, 242, 252))
    d.rectangle([x0 + w - 2 * esc, y0, x0 + w - 1, pies - 1], fill=(184, 200, 221))
    d.rectangle([x0 + 4 * esc, y0 + esc, x0 + 12 * esc - 1, y0 + 2 * esc - 1], fill=(5, 12, 28))
    d.rectangle([x0, y0 + 5 * esc, x0 + w - 1, y0 + 7 * esc - 1], fill=CORAL_VIVO)
    f = mono(int(2.4 * esc))
    t = "29-S"
    d.text((cx - d.textlength(t, font=f) / 2, y0 + 8 * esc), t, font=f, fill=TINTA)


# ------------------------------------------------------------------
# texto
# ------------------------------------------------------------------
def tipo(nombre, tam):
    return ImageFont.truetype(str(TIPOS / nombre), tam)


def mono(tam):
    return ImageFont.truetype(MONO, tam)


def espaciado(d, xy, texto, fuente, fill, tracking):
    x, y = xy
    for c in texto:
        d.text((x, y), c, font=fuente, fill=fill)
        x += d.textlength(c, font=fuente) + tracking
    return x


def ancho_espaciado(d, texto, fuente, tracking):
    return sum(d.textlength(c, font=fuente) for c in texto) + tracking * (len(texto) - 1)


def trozos(texto):
    """«Hola *mundo* ya» -> [(palabra, en_coral), ...]."""
    out, coral = [], False
    for palabra in texto.split():
        empieza = palabra.startswith("*")
        palabra = palabra.lstrip("*") if empieza else palabra
        if empieza:
            coral = True
        acaba = palabra.rstrip(".,:;!?¡¿").endswith("*") or palabra.endswith("*")
        limpia = palabra.replace("*", "")
        out.append((limpia, coral))
        if acaba:
            coral = False
    return out


def parte(d, palabras, fuente, ancho):
    lineas, actual = [], []
    for p in palabras:
        prueba = " ".join(w for w, _ in actual + [p])
        if not actual or d.textlength(prueba, font=fuente) <= ancho:
            actual.append(p)
        else:
            lineas.append(actual)
            actual = [p]
    lineas.append(actual)
    return lineas


def titular(d, texto, y, color, x=64, ancho=ANCHO - 2 * 64, maximo=180):
    """Una línea en mayúsculas que llena el ancho, como los carteles."""
    tam = maximo
    while tam > 20:
        f = tipo("Gellix-Medium.otf", tam)
        if d.textlength(texto, font=f) <= ancho:
            break
        tam -= 2
    d.text((x, y), texto, font=f, fill=color)
    return tam


def marcador(d, hechas, ahora):
    """Nueve casillas arriba a la derecha: las contadas en cian, la de
    ahora en coral y las que faltan vacías. Dice cuánto queda sin decirlo."""
    lado, hueco = 22, 9
    x = ANCHO - 48 - 9 * lado - 8 * hueco
    y = (BANDA - lado) // 2
    for i in range(1, 10):
        caja = [x, y, x + lado - 1, y + lado - 1]
        if i in ahora:
            d.rectangle(caja, fill=CORAL_VIVO)
        elif i <= hechas:
            d.rectangle(caja, fill=CIAN_VIVO)
        else:
            d.rectangle(caja, outline=(90, 88, 100), width=3)
        x += lado + hueco


def rotulo(lienzo, izquierda, derecha=None, marca=None):
    d = ImageDraw.Draw(lienzo)
    d.rectangle([0, 0, ANCHO, BANDA], fill=TINTA)
    f = mono(24)
    espaciado(d, (48, 38), izquierda.upper(), f, CIAN_VIVO, 4)
    if marca:
        marcador(d, *marca)
    elif derecha:
        w = ancho_espaciado(d, derecha.upper(), f, 4)
        espaciado(d, (ANCHO - 48 - w, 38), derecha.upper(), f, CORAL_VIVO, 4)


def bocadillo(texto, pico_x):
    """El subtítulo, dentro de un bocadillo de píxeles que sale de Compi."""
    x0, y0, x1, y1 = BOCADILLO
    im = Image.new("RGBA", (ANCHO, ALTO), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    g = 6
    # esquinas en escalera: un bocadillo de los de videojuego, no redondeado
    d.rectangle([x0 + g, y0, x1 - g, y1], fill=TINTA)
    d.rectangle([x0, y0 + g, x1, y1 - g], fill=TINTA)
    d.rectangle([x0 + g, y0 + g, x1 - g, y1 - g], fill=PANEL)
    px = max(x0 + 70, min(x1 - 70, pico_x))
    for i in range(7):                     # el pico, en escalera hacia Compi
        w = 42 - i * 6
        yy = y1 - g + i * 6
        d.rectangle([px - w, yy, px + w // 3, yy + 5], fill=TINTA)
        if w - 6 > 0 and i < 6:
            d.rectangle([px - w + 6, yy - (6 if i == 0 else 0), px + w // 3 - 6, yy + 5], fill=PANEL)
    espaciado(d, (x0 + 34, y0 + 22), "COMPI", mono(20), CIAN, 4)
    palabras = trozos(texto)
    tam = 46
    while True:
        f = tipo("Gellix-Medium.otf", tam)
        lineas = parte(d, palabras, f, x1 - x0 - 68)
        alto = len(lineas) * tam * 1.22
        if (len(lineas) <= 2 and alto <= (y1 - y0) - 76) or tam <= 32:
            break
        tam -= 2
    y = y0 + 58 + ((y1 - y0 - 76) - alto) / 2
    esp = d.textlength(" ", font=f)
    for l in lineas:
        x = x0 + 34
        for w, coral in l:
            d.text((x, y), w, font=f, fill=CORAL if coral else TINTA)
            x += d.textlength(w, font=f) + esp
        y += tam * 1.22
    return im


# ------------------------------------------------------------------
# fondos
# ------------------------------------------------------------------
def suelo(lienzo):
    d = ImageDraw.Draw(lienzo)
    d.rectangle([0, SUELO + 6, ANCHO, ALTO], fill=(236, 229, 216))
    d.rectangle([0, SUELO + 6, ANCHO, SUELO + 9], fill=(74, 58, 46))
    for x in range(-40, ANCHO, 120):        # baldosas: un poco de fondo sin ruido
        d.line([(x, SUELO + 10), (x - 30, ALTO)], fill=(226, 218, 204), width=3)


def nombre_bajo(d, cx, y, k, color=TEXTO_2, tam=24):
    nom, ape = GENTE[k]
    f = tipo("Gellix-Regular.otf", tam)
    for i, t in enumerate((nom, ape)):
        d.text((cx - d.textlength(t, font=f) / 2, y + i * (tam + 4)), t, font=f, fill=color)
    if k in SUPLENTES:
        fm = mono(16)
        t = "SUPLENTE"
        w = ancho_espaciado(d, t, fm, 2)
        espaciado(d, (cx - w / 2, y + 2 * (tam + 4) + 2), t, fm, APAGADO, 2)


def rejilla(ks, y0, sep_y, por_fila=5):
    pos = []
    for fila in range(0, len(ks), por_fila):
        gente = ks[fila:fila + por_fila]
        paso = ANCHO / len(gente)
        for i, k in enumerate(gente):
            pos.append((k, paso * (i + 0.5), y0 + (fila // por_fila) * sep_y))
    return pos


INTRO_REJILLA = rejilla(ORDEN, 736, 300, por_fila=6)
CIERRE_REJILLA = rejilla(ORDEN, 700, 262, por_fila=6)
INTRO_ESC, CIERRE_ESC = 6, 5


def fondo_intro():
    lienzo = Image.new("RGB", (ANCHO, ALTO), PAPEL)
    rotulo(lienzo, "Elecciones al comité de empresa", "29-S")
    d = ImageDraw.Draw(lienzo)
    titular(d, "SIN SIGLAS.", 150, TINTA)
    titular(d, "SOLO COMPAÑERXS.", 330, CIAN)
    suelo(lienzo)
    return lienzo


def fondo_propuesta(e):
    lienzo = Image.new("RGB", (ANCHO, ALTO), PAPEL)
    hechas = min(e["n"]) - 1
    rotulo(lienzo, "Sin siglas · 29-S", marca=(hechas, e["n"]))
    d = ImageDraw.Draw(lienzo)
    d.rectangle([0, VENTANA[3], ANCHO, VENTANA[3] + 3], fill=(74, 58, 46))
    nums = " y ".join(str(n) for n in e["n"])
    cab = f"{'PROPUESTAS' if len(e['n']) > 1 else 'PROPUESTA'} {nums} · LA CUENTAN "
    nombre = " · ".join(" ".join(GENTE[k]) for k in e["quien"]).upper()
    f = mono(22)
    w = ancho_espaciado(d, cab + nombre, f, 3)
    x = (ANCHO - w) / 2
    x = espaciado(d, (x, ETIQUETA_Y), cab, f, APAGADO, 3)
    espaciado(d, (x, ETIQUETA_Y), nombre, f, CORAL, 3)
    suelo(lienzo)
    return lienzo


def fondo_cierre():
    lienzo = Image.new("RGB", (ANCHO, ALTO), PAPEL)
    rotulo(lienzo, "Sin siglas · 29-S", "sin-siglas.info")
    d = ImageDraw.Draw(lienzo)
    d.rectangle([0, BANDA, ANCHO, 470], fill=CORAL)
    espaciado(d, (64, BANDA + 36), "MARTES 29 DE SEPTIEMBRE · EN URNA", mono(24), PAPEL, 4)
    titular(d, "EL MARTES 29,", BANDA + 84, PAPEL, maximo=132)
    titular(d, "VOTA A SIN SIGLAS.", BANDA + 214, TINTA, maximo=132)
    suelo(lienzo)
    for k, cx, y in CIERRE_REJILLA:
        nombre_bajo(d, cx, y + 12, k)
    return lienzo


def fondo_final():
    """La tarjeta final, sin voz: lo que se tiene que poder leer parado."""
    lienzo = Image.new("RGB", (ANCHO, ALTO), TINTA)
    d = ImageDraw.Draw(lienzo)
    espaciado(d, (64, 90), "SIN SIGLAS. SOLO COMPAÑERXS. · 29-S", mono(24), CIAN_VIVO, 4)
    titular(d, "MARTES 29,", 150, PAPEL, maximo=170)
    titular(d, "VOTA A SIN SIGLAS.", 330, CORAL_VIVO, maximo=170)
    y = 520
    filas = [
        ("En urna y en secreto.", "Vota toda la plantilla del censo, afiliada o no."),
        ("Horario y sitio:", "los que publique la mesa electoral."),
        ("TRAE TU DNI FÍSICO.", "Ni foto, ni móvil."),
        ("El buzón sigue abierto,", "también después de la campaña: sin-siglas.info/buzon"),
    ]
    fb, fr = tipo("Gellix-Medium.otf", 40), tipo("Gellix-Regular.otf", 34)
    for i, (a, b) in enumerate(filas):
        d.rectangle([64, y, ANCHO - 64, y + 2], fill=(70, 68, 80))
        y += 26
        d.text((64, y), a, font=fb, fill=CORAL_VIVO if i == 2 else PAPEL)
        y += 52
        for linea in parte(d, [(w, False) for w in b.split()], fr, ANCHO - 128):
            d.text((64, y), " ".join(w for w, _ in linea), font=fr, fill=(206, 202, 196))
            y += 44
        y += 20
    d.rectangle([0, 1700, ANCHO, ALTO], fill=(14, 13, 20))
    fl = tipo("Gellix-Regular.otf", 24)
    legal = ("Candidatura Sin siglas. Solo compañerxs. La firman los once candidatos: "
             "no es una comunicación de la empresa.")
    yy = 1740
    for linea in parte(d, [(w, False) for w in legal.split()], fl, ANCHO - 128):
        d.text((64, yy), " ".join(w for w, _ in linea), font=fl, fill=(170, 166, 160))
        yy += 34
    return lienzo


# ------------------------------------------------------------------
# el cartel, con su trozo y su movimiento
# ------------------------------------------------------------------
_carteles = {}


def cartel(nombre):
    if nombre not in _carteles:
        _carteles[nombre] = Image.open(CARTELES / f"{nombre}.png").convert("RGB")
    return _carteles[nombre]


def suave(u):
    u = min(1, max(0, u))
    return u * u * (3 - 2 * u)


def pinta_cartel(lienzo, nombre, y_zona, zoom):
    """y_zona en coordenadas del cartel de 1080; zoom >= 1 acerca un poco
    alrededor del centro del trozo (el Ken Burns lento)."""
    src = cartel(nombre)
    k = src.width / 1080
    w, h = ZONA_ANCHO / zoom, ZONA_ALTO / zoom
    cx, cy = 540, y_zona + ZONA_ALTO / 2
    caja = [(cx - w / 2) * k, (cy - h / 2) * k, (cx + w / 2) * k, (cy + h / 2) * k]
    trozo = src.resize((VENTANA[2] - VENTANA[0], VENTANA[3] - VENTANA[1]), Image.LANCZOS, box=caja,
                       reducing_gap=2.0)
    lienzo.paste(trozo, (VENTANA[0], VENTANA[1]))


# ------------------------------------------------------------------
# montaje
# ------------------------------------------------------------------
def prepara():
    """Voz de cada escena y tiempos de cada frase."""
    escenas, t = [], 0.0
    for e in GUION:
        e = dict(e)
        entrada = {"intro": 0.35, "propuesta": 0.55, "cierre": 0.5, "final": 0}[e["tipo"]]
        cues, cursor = [], entrada
        for fr in e["frases"]:
            if fr.get("silencio"):
                cursor += 0.5
            audio = sintetiza(fr["dicho"])
            cues.append(dict(fr, ini=cursor, fin=cursor + len(audio) / SR, audio=audio))
            cursor += len(audio) / SR + PAUSA
        e["cues"] = cues
        e["ini"] = t
        e["dur"] = cursor + {"intro": 0.3, "propuesta": 0.35, "cierre": 0.6, "final": 4.6}[e["tipo"]]
        t += e["dur"]
        escenas.append(e)
    return escenas, t


def pista(escenas, total):
    voz = np.zeros(int((total + 1) * SR), dtype=np.float32)
    for e in escenas:
        for c in e["cues"]:
            i = int((e["ini"] + c["ini"]) * SR)
            voz[i:i + len(c["audio"])] += c["audio"]
    pico = np.abs(voz).max() or 1
    return voz / pico * 0.89


def musica(n, fiesta_desde=None):
    """Chiptune propia: do · sol · la m · fa a 100 bpm. Melodía en pulso del 25 %,
    arpegio en pulso del 12,5 %, bajo triangular y charles de ruido. En el
    cierre (fiesta_desde, en segundos) entra el bombo."""
    rng = np.random.default_rng(29)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    bpm = 100
    corchea = 60 / bpm / 2
    acordes = [(48, 52, 55), (43, 47, 50), (45, 48, 52), (41, 45, 48)]      # do · sol · la m · fa
    melodia = [
        [72, None, 76, 79, 76, None, 74, 72,   74, None, 76, None, 72, None, None, None],
        [71, None, 74, 79, 74, None, 72, 71,   72, None, 74, None, 67, None, None, None],
        [69, None, 72, 76, 72, None, 74, 76,   77, None, 76, None, 72, None, None, None],
        [65, None, 69, 72, 74, None, 72, 69,   67, None, 69, None, 71, None, None, None],
    ]
    out = np.zeros(n, dtype=np.float32)

    def pulso(f, seg, duty):
        return np.where((f * seg) % 1.0 < duty, 1.0, -1.0)

    def pon(i0, onda):
        i1 = min(n, i0 + len(onda))
        if i0 < n:
            out[i0:i1] += onda[:i1 - i0]

    paso_n = int(corchea * SR)
    ruido = rng.uniform(-1, 1, int(0.05 * SR)).astype(np.float32)
    for p in range(n // paso_n + 1):
        i0 = p * paso_n
        bloque = (p // 16) % 4
        a = acordes[bloque]
        seg = np.arange(int(corchea * 0.9 * SR)) / SR
        pon(i0, 0.022 * pulso(hz(a[p % 3] + 24), seg, 0.125) * np.exp(-seg * 7))
        nota = melodia[bloque][p % 16]
        if nota:
            larga = p % 16 + 1 < 16 and melodia[bloque][p % 16 + 1] is None
            seg = np.arange(int(corchea * (1.8 if larga else 0.9) * SR)) / SR
            vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * seg) * (seg > 0.12)
            env = np.minimum(1, seg / 0.01) * np.exp(-seg * 2.2)
            pon(i0, 0.05 * pulso(hz(nota) * vib, seg, 0.25) * env)
        if p % 2 == 0:
            seg = np.arange(int(corchea * 1.8 * SR)) / SR
            nb = a[0] - 12 if p % 4 == 0 else a[2] - 12
            tri = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * hz(nb) * seg))
            pon(i0, 0.10 * tri * np.minimum(1, (corchea * 1.8 - seg) / 0.02))
        seg = np.arange(int((0.05 if p % 2 else 0.02) * SR)) / SR
        pon(i0, 0.018 * ruido[:len(seg)] * np.exp(-seg * 90))
        if fiesta_desde is not None and p * corchea >= fiesta_desde and p % 4 == 0:
            seg = np.arange(int(0.18 * SR)) / SR
            f = 120 * np.exp(-seg * 22) + 45
            pon(i0, 0.16 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-seg * 14))
    # se apaga en el último segundo y medio
    cola = int(1.5 * SR)
    out[-cola:] *= np.linspace(1, 0, cola)
    return out


def pitido(n, en):
    out = np.zeros(n, dtype=np.float32)
    seg = np.arange(int(0.09 * SR)) / SR
    f = np.linspace(660, 990, len(seg))
    s = 0.10 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-seg * 18)
    for t0 in en:
        i = int(t0 * SR)
        if i < n:
            out[i:i + len(s)] += s[:n - i]
    return out


def silencios(escenas):
    """Sin música medio segundo antes de las frases marcadas, y durante ellas."""
    out = []
    for e in escenas:
        for c in e["cues"]:
            if c.get("silencio"):
                t = e["ini"] + c["ini"]
                out.append((t - 0.55, t + (c["fin"] - c["ini"]) + 0.1))
    return out


class Boca:
    """Tres bocas -- cerrada, a medias, abierta -- según el volumen de la
    voz, con un mínimo de dos fotogramas por estado para que no tiemble."""

    def __init__(self, voz):
        self.voz = voz
        rms = [self.rms(i / FPS) for i in range(int(len(voz) / SR * FPS))]
        hablando = np.array([r for r in rms if r > 0.01]) if any(r > 0.01 for r in rms) else np.array([0.1])
        self.u1, self.u2 = np.percentile(hablando, 25), np.percentile(hablando, 65)
        self.estado, self.cuenta = 0, 0

    def rms(self, t):
        i = int(t * SR)
        trozo = self.voz[max(0, i - 480):i + 480]
        return float(np.sqrt(np.mean(trozo ** 2))) if len(trozo) else 0.0

    def en(self, t):
        r = self.rms(t)
        quiere = 0 if r < self.u1 else (1 if r < self.u2 else 2)
        self.cuenta += 1
        if quiere != self.estado and self.cuenta >= 2:
            self.estado, self.cuenta = quiere, 0
        return self.estado


def anda(t, t0, t1, x0, x1):
    """Entrada con frenada: ease-out, y el tt del paso sale de la distancia
    recorrida para que los pies no patinen."""
    if t <= t0:
        return x0, False, 0
    if t >= t1:
        return x1, True, abs(x1 - x0)
    u = (t - t0) / (t1 - t0)
    u = 1 - (1 - u) ** 2
    return x0 + (x1 - x0) * u, False, abs(x1 - x0) * u


def cue_en(e, t):
    """La frase que suena en t; en los huecos se queda la anterior, para que
    nunca haya un fotograma sin subtítulo mientras dura la escena."""
    actual = e["cues"][0] if e["cues"] else None      # el fotograma 0 ya lleva la primera frase
    for c in e["cues"]:
        if t >= c["ini"] - 0.05:
            actual = c
    return actual


def plan(escenas, boca):
    fotogramas = []
    for e in escenas:
        nf = int(round(e["dur"] * FPS))
        habla_ms = 0
        for f in range(nf):
            t = f / FPS
            tg = e["ini"] + t
            ms = int(t * 1000)
            cue = cue_en(e, t)
            suena = cue is not None and cue["ini"] <= t <= cue["fin"]
            b = boca.en(tg) if suena else 0
            if suena:
                habla_ms += 40
            m = []
            fr = {"escena": e, "t": t, "munecos": m, "cue": cue["leido"] if cue else None, "extra": {}}

            def compi(x, esc, pose_def="explica"):
                pose = (cue.get("pose") if cue else None) or pose_def
                if pose == "explica" and not suena:
                    pose = "quieto"
                tt = habla_ms if pose == "explica" else ms
                return {"q": {"quien": "compi", "pose": pose, "tt": tt, "boca": b}, "x": x, "pies": SUELO, "esc": esc}

            tipo_ = e["tipo"]
            if tipo_ == "intro":
                m.append(compi(300, 10))
                aparece = e["cues"][2]["ini"]
                for i, (k, cx, y) in enumerate(INTRO_REJILLA):
                    ti = aparece + i * 0.16
                    if t < ti:
                        continue
                    u = (t - ti) / 0.32
                    salto = int(46 * math.sin(min(1, u) * math.pi)) if u < 1 else 0
                    aplasta = 1 <= u < 1.25
                    pose = "saluda" if e["cues"][-1]["ini"] <= t else "quieto"
                    m.append({"q": {"quien": k, "pose": pose, "tt": ms + i * 377, "aplasta": aplasta},
                              "x": cx, "pies": y, "esc": INTRO_ESC, "salto": salto})
            elif tipo_ == "propuesta":
                c_meta = compi(200, 11)
                # señala el cartel cuando la cámara baja a la salvedad
                if cue and cue.get("zona") == "caja" and t - cue["ini"] < 1.0 and not cue.get("pose"):
                    c_meta["q"]["pose"] = "senala"
                    c_meta["q"]["tt"] = ms
                # y mira a los dos mientras entran
                if t < 1.0 and c_meta["q"]["pose"] in ("explica", "quieto"):
                    c_meta["q"]["mira"] = [1, 0]
                m.append(c_meta)
                for j, (k, meta) in enumerate(zip(e["quien"], (640, 920))):
                    t0 = 0.05 + j * 0.22
                    x, llego, dist = anda(t, t0, t0 + 0.8, ANCHO + 150, meta)
                    q = {"quien": k, "tt": 0}
                    if not llego:
                        q.update(pose="anda", tt=int(dist * 1.9), izq=True)
                    else:
                        tl = t - (t0 + 0.8)
                        if tl < 0.08:
                            q.update(pose="quieto", aplasta=True)
                        elif tl < 0.16:
                            q.update(pose="quieto", estira=True)
                        elif cue and cue.get("nombra") and cue["ini"] + 0.15 + j * 0.45 <= t <= cue["ini"] + 1.5 + j * 0.45:
                            q.update(pose="saluda", tt=ms)
                        elif cue and cue.get("serio"):
                            q.update(pose="serio", mira=[-1, 0])
                        else:
                            q.update(pose="quieto", tt=ms + 450 * j, mira=[-1, 0])
                    m.append({"q": q, "x": x, "pies": SUELO, "esc": 10})
                if cue:
                    fr["extra"]["cartel"] = cue.get("cartel") or next(
                        (c.get("cartel") for c in reversed(e["cues"][:e["cues"].index(cue) + 1]) if c.get("cartel")),
                        e["cartel"])
                else:
                    fr["extra"]["cartel"] = e["cartel"]
                # la cámara: arriba el titular; en la frase de la salvedad baja, con 0,6 s de ease
                y = ZONAS["titular"]
                for c in e["cues"]:
                    if t >= c["ini"] - 0.2:
                        destino = ZONAS[c.get("zona", "titular")]
                        u = suave((t - (c["ini"] - 0.2)) / 0.6)
                        y = y + (destino - y) * u if not c.get("cartel") else destino
                fr["extra"]["y"] = y
                fr["extra"]["zoom"] = 1 + 0.035 * t / e["dur"]
            elif tipo_ == "cierre":
                m.append(compi(300, 10, "explica"))
                for i, (k, cx, y) in enumerate(CIERRE_REJILLA):
                    pose = "saluda" if cue and cue.get("pose") == "vota" else "quieto"
                    m.append({"q": {"quien": k, "pose": pose, "tt": ms + i * 211}, "x": cx, "pies": y, "esc": CIERRE_ESC})
                fr["extra"]["urna"] = True
                fr["extra"]["dni"] = any(c.get("dni") and t >= c["ini"] for c in e["cues"])
            else:
                m.append({"q": {"quien": "compi", "pose": "vota", "tt": ms}, "x": 830, "pies": 1640, "esc": 7})
                fr["cue"] = None
            fotogramas.append(fr)
    return fotogramas


def fondo_de(e):
    return {"intro": fondo_intro, "cierre": fondo_cierre, "final": fondo_final}.get(
        e["tipo"], lambda: fondo_propuesta(e))()


def monta(solo=None):
    escenas, total = prepara()
    if solo is not None:
        e = escenas[solo]
        escenas = [dict(e, ini=0.0)]
        total = e["dur"]
    voz = pista(escenas, total)
    fotogramas = plan(escenas, Boca(voz))

    sprites = Sprites()
    for fr in fotogramas:
        for m in fr["munecos"]:
            sprites.pide(m["q"])
    print(f"{len(fotogramas)} fotogramas, {len(sprites.pedidas)} poses distintas")
    sprites.carga()

    pitidos = []
    for e in escenas:
        if e["tipo"] == "intro":
            pitidos += [e["ini"] + e["cues"][2]["ini"] + i * 0.16 for i in range(len(ORDEN))]
        elif e["tipo"] == "propuesta":
            pitidos += [e["ini"] + 0.85, e["ini"] + 1.07]
    n = len(voz)
    fiesta = next((e["ini"] + e["cues"][-1]["ini"] for e in escenas if e["tipo"] == "cierre"), None)
    mus = musica(n, fiesta)
    # la voz manda: la música baja cuando habla Compi y sube en los huecos
    ventana = int(0.15 * SR)
    env = np.convolve(np.abs(voz), np.ones(ventana) / ventana, mode="same")
    ganancia = 0.42 - 0.27 * np.clip(env / 0.05, 0, 1)
    for t0, t1 in silencios(escenas):
        ganancia[max(0, int(t0 * SR)):int(t1 * SR)] = 0
    ganancia = np.convolve(ganancia, np.ones(ventana) / ventana, mode="same")
    mezcla = np.clip(voz + mus * ganancia + pitido(n, pitidos), -1, 1)
    SALIDA.mkdir(exist_ok=True)
    wav = SALIDA / "peli-compi.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mezcla * 32767).astype(np.int16).tobytes())

    nombre = "peli-compi.mp4" if solo is None else f"peli-compi-escena-{solo}.mp4"
    mp4 = SALIDA / nombre
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y",
                           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{ANCHO}x{ALTO}", "-r", str(FPS), "-i", "-",
                           "-i", str(wav), "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-tune", "animation",
                           "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                           "-c:a", "aac", "-b:a", "160k", "-shortest",
                           "-movflags", "+faststart", str(mp4)], stdin=subprocess.PIPE)

    fondos, bocadillos = {}, {}
    for i, fr in enumerate(fotogramas):
        e = fr["escena"]
        if id(e) not in fondos:
            fondos[id(e)] = fondo_de(e)
        lienzo = fondos[id(e)].copy()
        x = fr["extra"]
        if "cartel" in x:
            pinta_cartel(lienzo, x["cartel"], x["y"], x["zoom"])
        if e["tipo"] == "intro":
            d = ImageDraw.Draw(lienzo)
            visibles = {m["q"]["quien"] for m in fr["munecos"]}
            for k, cx, y in INTRO_REJILLA:
                if k in visibles:
                    nombre_bajo(d, cx, y + 16, k)
        if x.get("dni"):
            d = ImageDraw.Draw(lienzo)
            d.rectangle([64, 1052, ANCHO - 64, 1116], fill=TINTA)
            f = tipo("Gellix-Medium.otf", 38)
            d.text((96, 1062), "TRAE TU DNI FÍSICO", font=f, fill=CORAL_VIVO)
            d.text((96 + d.textlength("TRAE TU DNI FÍSICO", font=f) + 26, 1070), "ni foto, ni móvil",
                   font=tipo("Gellix-Regular.otf", 28), fill=PAPEL)
        if x.get("urna"):
            urna(lienzo, 600, SUELO, 9)
        for m in fr["munecos"]:
            pinta_muneco(lienzo, sprites, m)
        if fr["cue"]:
            compi_x = next(m["x"] for m in fr["munecos"] if m["q"]["quien"] == "compi")
            clave = (fr["cue"], int(compi_x) // 40)
            if clave not in bocadillos:
                bocadillos[clave] = bocadillo(fr["cue"], compi_x)
            lienzo.paste(bocadillos[clave], (0, 0), bocadillos[clave])
        ff.stdin.write(lienzo.tobytes())
        if i % 500 == 0:
            print(f"  {i}/{len(fotogramas)}", flush=True)
    ff.stdin.close()
    ff.wait()
    print(f"{mp4.relative_to(AQUI.parent)} · {total:.1f} s")


if __name__ == "__main__":
    solo = None
    if "--muestra" in sys.argv:
        solo = int(sys.argv[sys.argv.index("--muestra") + 1])
    monta(solo)
