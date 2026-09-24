#!/usr/bin/env python3
"""Monta el vídeo repaso de las propuestas ya lanzadas.

    pip install pillow && python3 carteles/video.py
    python3 carteles/video.py --faltan    # solo dice qué audios faltan

El guion vive en GUION-VIDEO.md y se lee de ahí: el orden, quién habla,
qué cartel va detrás y el texto de los subtítulos. Igual que la lista de
GIF vive en compi-gifs.html, las frases no están escritas en dos sitios:
si se cambia una en el guion, cambia en el vídeo.

EL LIENZO ES 1080 x 1620 Y NO 1080 x 1350, que es lo que miden los
carteles. La diferencia son 270 px de banda abajo para el subtítulo y el
nombre de quien habla. Se podría haber quemado el subtítulo encima del
cartel, pero el pie es justo donde van las caras de quien lleva la
propuesta, y taparlas en un vídeo que existe para que se vea quién habla
sería el peor sitio posible.

Y LOS SUBTÍTULOS NO SON UN EXTRA: esto se ve en un chat, en silencio y
de pie. Un vídeo de voces sin subtítulos es un vídeo que la mitad de la
gente no abre.

NO HAY ZOOM NI MOVIMIENTO DE CÁMARA, y es decisión, no pereza. El cartel
se queda quieto y lo único que se mueve es el subtítulo, al ritmo de quien
habla. Un travelling lento sobre cada pieza es exactamente el acabado de
agencia que este vídeo existe para no tener -- ver el encabezado de
GUION-VIDEO.md.

Los audios se toman tal cual llegan (nota de voz del chat incluida) y solo
se les iguala el volumen con loudnorm: siete móviles distintos grabando en
siete habitaciones distintas saltan de nivel de un corte a otro, y eso sí
cansa de oír.
"""

import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

AQUI = pathlib.Path(__file__).parent
GUION = AQUI / "GUION-VIDEO.md"
CARTELES = AQUI / "png"
VOCES = AQUI / "voz"
SALIDA = AQUI / "video"
TIPOS = AQUI.parent / "fuentes"

ANCHO, ALTO_CARTEL, BANDA = 1080, 1350, 270
MARGEN = 72
ALTO = ALTO_CARTEL + BANDA
FPS = 25
COLA = 0.35            # silencio al final de cada corte, para que no atropelle

PAPEL, PAPEL_2 = "#f6f2ea", "#efe9df"
TEXTO, CIAN, APAGADO = "#191820", "#0d6f92", "#5e574e"
LINEA = (74, 58, 46, 46)

# El subtítulo se parte en trozos que quepan en dos líneas de la banda y
# se reparten por número de caracteres: no es transcripción con tiempos,
# es una aproximación, y con frases de doce segundos se nota poco.
CHARS_LINEA = 46
LINEAS_CUE = 2
HUERFANAS = set("y o u de del a al en la el los las un una unos unas que se su sus "
                "por con sin para lo le les mi tu es son".split())

# Compi solo se mueve en las dos portadas. En los cortes de cartel ya
# está dibujado dentro del PNG y quieto, que es como se mandó la pieza:
# animarlo ahí sería contar otra cosa distinta de la que se envió.
GIFS = {"intro": "compi-hola", "cierre": "compi-voy-a-votar"}
# Los GIF traen su propio pie -- «sin-siglas.info · 29-S», que es lo que
# hace falta cuando se mandan sueltos por el chat --, y aquí ya está en
# la tapa y en el lema. Se recortan esos 32 px de abajo: la misma marca
# tres veces en un fotograma no la lee nadie dos.
GIF_ANCHO, GIF_XY, GIF_ALTO_UTIL = 460, (560, 740), 348


def tipo(nombre, tam):
    return ImageFont.truetype(str(TIPOS / nombre), tam)


def guion():
    """Los cortes del vídeo, en orden, tal y como están en el guion."""
    texto = GUION.read_text(encoding="utf-8")
    cortes = []
    patron = re.compile(
        r"^## (\d+) · ([a-z0-9-]+) · (.+?)\s*$((?:\n> .*)+)", re.M)
    for m in patron.finditer(texto):
        frase = " ".join(l[2:].strip() for l in m.group(4).strip().split("\n"))
        cortes.append({
            "n": int(m.group(1)),
            "pieza": m.group(2),
            "quien": m.group(3),
            "frase": re.sub(r"\s+", " ", frase).strip(),
        })
    cortes.sort(key=lambda c: c["n"])
    return cortes


def audio_de(pieza):
    for f in sorted(VOCES.glob(pieza + ".*")):
        if f.suffix.lower() in (".m4a", ".mp3", ".opus", ".ogg", ".wav", ".aac", ".flac"):
            return f
    return None


def duracion(f):
    salida = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "json", str(f)], capture_output=True, text=True, check=True).stdout
    return float(json.loads(salida)["format"]["duration"])


def espaciado(draw, xy, texto, fuente, fill, tracking):
    """Gellix no trae tracking, y el rótulo de la campaña lo lleva."""
    x, y = xy
    for c in texto:
        draw.text((x, y), c, font=fuente, fill=fill)
        x += draw.textlength(c, font=fuente) + tracking
    return x


def ancho_espaciado(draw, texto, fuente, tracking):
    return sum(draw.textlength(c, font=fuente) for c in texto) + tracking * (len(texto) - 1)


def fondo(corte):
    """El fotograma fijo del corte: cartel arriba, banda abajo."""
    lienzo = Image.new("RGB", (ANCHO, ALTO), PAPEL)
    cartel = CARTELES / (corte["pieza"] + ".png")

    if cartel.exists():
        lienzo.paste(Image.open(cartel).convert("RGB").resize((ANCHO, ALTO_CARTEL)), (0, 0))
    else:
        # intro y cierre no tienen cartel, así que se dibuja uno: misma
        # tapa, mismo margen y mismo cuerpo de titular que la serie, para
        # que las dos portadas no parezcan de otra campaña
        d = ImageDraw.Draw(lienzo, "RGBA")
        f = tipo("Gellix-Medium.ttf", 21)
        espaciado(d, (MARGEN, 74), "SIN SIGLAS · SOLO COMPAÑERXS", f, CIAN, 3.4)
        marca = "29-S"
        x0 = ANCHO - MARGEN - ancho_espaciado(d, marca, f, 3.4)
        espaciado(d, (x0, 74), marca, f, CIAN, 3.4)
        d.rectangle([MARGEN, 118, ANCHO - MARGEN, 120], fill=LINEA)

        f = tipo("Gellix-Medium.ttf", 96)
        for i, l in enumerate(["SIN SIGLAS.", "SOLO", "COMPAÑERXS."]):
            d.text((MARGEN, 300 + i * 100), l, font=f, fill=CIAN if i == 2 else TEXTO)
        d.text((MARGEN, 640), "29 de septiembre · sin-siglas.info",
               font=tipo("Gellix-Regular.ttf", 34), fill=APAGADO)

    d = ImageDraw.Draw(lienzo, "RGBA")
    d.rectangle([0, ALTO_CARTEL, ANCHO, ALTO], fill=PAPEL_2)
    d.rectangle([0, ALTO_CARTEL, ANCHO, ALTO_CARTEL + 2], fill=LINEA)

    f = tipo("Gellix-Medium.ttf", 21)
    nombre = corte["quien"].upper()
    x0 = (ANCHO - ancho_espaciado(d, nombre, f, 3.4)) / 2
    espaciado(d, (x0, ALTO_CARTEL + 34), nombre, f, CIAN, 3.4)
    return lienzo


def envolver(texto):
    lineas, actual = [], ""
    for palabra in texto.split():
        if actual and len(actual) + 1 + len(palabra) > CHARS_LINEA:
            lineas.append(actual)
            actual = palabra
        else:
            actual = (actual + " " + palabra).strip()
    if actual:
        lineas.append(actual)
    return lineas


def cabe(texto):
    return len(envolver(texto)) <= LINEAS_CUE


def equilibrar(texto):
    """Dos líneas parejas en vez de una llena y otra con una palabra.

    Envolver a lo ancho deja cosas como «... estos días. Y / el 29 se
    vota.», y esa «Y» suelta al final del renglón hace tropezar al leer.
    """
    lineas = envolver(texto)
    if len(lineas) != 2:
        return lineas
    palabras = texto.split()
    opciones = [(palabras[:i], palabras[i:]) for i in range(1, len(palabras))]
    validas = [(a, b) for a, b in opciones
               if len(" ".join(a)) <= CHARS_LINEA and len(" ".join(b)) <= CHARS_LINEA]
    if not validas:
        return lineas
    def coste(par):
        a, b = " ".join(par[0]), " ".join(par[1])
        # cortar justo detrás de «y», «de» o «que» deja el renglón colgando
        cuelga = par[0][-1].lower().strip(",") in HUERFANAS
        return abs(len(a) - len(b)) + (40 if cuelga else 0)

    a, b = min(validas, key=coste)
    return [" ".join(a), " ".join(b)]


def empaquetar(piezas):
    """Junta piezas seguidas mientras quepan en un cue."""
    cues, buf = [], ""
    for pieza in piezas:
        junto = (buf + " " + pieza).strip()
        if buf and not cabe(junto):
            cues.append(buf)
            buf = pieza
        else:
            buf = junto
    if buf:
        cues.append(buf)
    return cues


def trozos(frase):
    """Parte la frase en cues de dos líneas.

    Cortar cada 92 caracteres deja cues que acaban en «si cae en fin de»,
    que es peor que no poner nada: obliga a leer el siguiente para cerrar
    la idea y quien lee va a la mitad de velocidad que quien habla. Así
    que se corta por donde corta quien habla -- punto, dos puntos, punto
    y coma -- y solo si una frase no cabe entera se busca una coma.
    """
    piezas = [p.strip() for p in re.findall(r"[^.;:]+[.;:]?", frase) if p.strip()]
    cues = []
    for cue in empaquetar(piezas):
        if cabe(cue):
            cues.append(cue)
            continue
        comas = [c.strip() for c in re.findall(r"[^,]+,?", cue) if c.strip()]
        for trozo in empaquetar(comas):
            if cabe(trozo):
                cues.append(trozo)
            else:
                lineas = envolver(trozo)
                cues += [" ".join(lineas[i:i + LINEAS_CUE])
                         for i in range(0, len(lineas), LINEAS_CUE)]
    return ["\\N".join(equilibrar(c)) for c in cues]


def reloj(s):
    h, s = divmod(max(s, 0), 3600)
    m, s = divmod(s, 60)
    return "%d:%02d:%05.2f" % (h, m, s)


def ass(frase, dur, destino):
    cues = trozos(frase)
    pesos = [max(len(c.replace("\\N", " ")), 1) for c in cues]
    total = sum(pesos)
    destino.write_text(
        "[Script Info]\nScriptType: v4.00+\nPlayResX: %d\nPlayResY: %d\nWrapStyle: 2\n\n"
        "[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold,"
        " Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline,"
        " Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
        "Style: banda,Gellix,42,&H00201819,&H00201819,&H00EAF2F6,0,0,0,0,100,100,0,0,1,0,0,"
        "2,90,90,84,1\n\n"
        "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
        % (ANCHO, ALTO)
        + "".join(
            "Dialogue: 0,%s,%s,banda,,0,0,0,,%s\n" % (
                reloj(dur * sum(pesos[:i]) / total),
                reloj(dur * sum(pesos[:i + 1]) / total),
                c)
            for i, c in enumerate(cues)),
        encoding="utf-8")


def corte_mp4(corte, audio, tmp, destino):
    dur = duracion(audio) + COLA
    fondo(corte).save(tmp / "fondo.png")
    ass(corte["frase"], dur, tmp / "subs.ass")
    entradas = ["-loop", "1", "-framerate", str(FPS), "-i", str(tmp / "fondo.png")]
    gif = GIFS.get(corte["pieza"])
    if gif:
        entradas += ["-ignore_loop", "0", "-i", str(AQUI / "gif" / (gif + ".gif"))]
    entradas += ["-i", str(audio)]

    subs = "subtitles=%s:fontsdir=%s,format=yuv420p" % (tmp / "subs.ass", TIPOS)
    if gif:
        filtro = ("[1:v]crop=iw:%d:0:0,scale=%d:-1[c];[0:v][c]overlay=%d:%d[f];[f]%s[v]"
                  % (GIF_ALTO_UTIL, GIF_ANCHO, GIF_XY[0], GIF_XY[1], subs))
    else:
        filtro = "[0:v]%s[v]" % subs

    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", *entradas,
        "-t", "%.3f" % dur,
        "-filter_complex", filtro,
        "-map", "[v]", "-map", "%d:a" % (2 if gif else 1),
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,apad",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
        "-shortest", str(destino)], check=True)
    return dur


def main():
    cortes = guion()
    faltan = [c for c in cortes if audio_de(c["pieza"]) is None]

    if "--faltan" in sys.argv:
        for c in cortes:
            marca = "·  falta" if c in faltan else "ok      "
            print("%s  %-18s %s" % (marca, c["pieza"], c["quien"]))
        return

    hay = [c for c in cortes if c not in faltan]
    if not hay:
        print("No hay ni un audio en %s. Ver GUION-VIDEO.md." % VOCES)
        return

    SALIDA.mkdir(exist_ok=True)
    tmp = pathlib.Path(tempfile.mkdtemp())
    try:
        trozos_mp4, total = [], 0.0
        for c in hay:
            f = tmp / ("%02d-%s.mp4" % (c["n"], c["pieza"]))
            total += corte_mp4(c, audio_de(c["pieza"]), tmp, f)
            trozos_mp4.append(f)
            print("  %-18s %s" % (c["pieza"], c["quien"]))

        lista = tmp / "lista.txt"
        lista.write_text("".join("file '%s'\n" % f for f in trozos_mp4), encoding="utf-8")
        final = SALIDA / "repaso-propuestas.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
            "-i", str(lista), "-c", "copy", str(final)], check=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print("\n%s · %d cortes · %d s · %dx%d" % (final, len(hay), round(total), ANCHO, ALTO))
    for c in faltan:
        print("   falta la voz de %-18s (%s)" % (c["pieza"], c["quien"]))


if __name__ == "__main__":
    main()
