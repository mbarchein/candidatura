# Merchan · Sin siglas, solo compañerxs

Todo lo que se imprime o se reparte, en un solo sitio. Es una **copia**:
los fuentes y sus salidas viven en `carteles/`, y esto se rehace con

    ./merchan/recoger.sh

Si cambias una pieza, reexpórtala primero (el comando va en cada fila) y
luego recoge. No edites nada aquí dentro: la siguiente recogida lo pisa.

## pegatinas/ · para la copistería

A4 en papel adhesivo al 100 %, sin márgenes de impresora. Se imprime el
**PDF**; el PNG es solo para verla en pantalla o mandarla de muestra.
Todas llevan línea de corte punteada y 3 mm de filete crema, así que se
recortan con tijera sin troquel.

| Pieza | Qué lleva |
|---|---|
| `pegatinas.pdf` / `.png` | Compi de pie y el HUD de la candidatura: fichas, misiones, vidas |
| `pegatinas-frases.pdf` / `.png` | Sin mascota: frases de la campaña en letra grande |
| `pegatinas-compi-2.pdf` / `.png` | Ocho poses de Compi sin repetir, cada una con su petición y su artículo |
| `pegatinas-juego.pdf` / `.png` | El minijuego: portada, QR, el cansino, el PM, la lista corriendo, los obstáculos y los almuerzos |

Reexportar: `./carteles/exportar.sh pegatinas`

Llevan el 29-S o la web: son de campaña y se reparten antes del martes.

## juego/ · carátula de «La carrera hasta la urna»

| Pieza | Formato | Para qué |
|---|---|---|
| `caratula-juego.png` | 1080 × 1350 | Mandarla al chat con el enlace a sin-siglas.info/juego |
| `caratula-juego-2x.png` | 2160 × 2700 | Imprimirla: a A4 sale a unos 260 ppp. Lleva el martes 29: es de campaña |

Reexportar: `./carteles/exportar.sh caratula`

## peli/ · cartel del vídeo de las nueve propuestas

| Pieza | Formato | Para qué |
|---|---|---|
| `cartel-peli.png` | 1080 × 1350 | Mandarlo al chat: el QR y la dirección llevan a sin-siglas.info/peli |
| `cartel-peli-2x.png` | 2160 × 2700 | Imprimirlo. Lleva el martes 29: es de campaña |

Reexportar: `./carteles/exportar.sh peli`

## camisetas/ · para la imprenta textil

PNG con fondo transparente, 4200 × 5035 px: a 300 ppp son 35 × 42 cm, más
que cualquier estampado de pecho. Los muñecos van a escala entera, así
que el píxel sale cuadrado.

| Pieza | Para qué camiseta |
|---|---|
| `camiseta-clara.png` | Blanca o beis (dibujo en tinta) |
| `camiseta-oscura.png` | Negra o azul marino (dibujo en papel, con halo claro) |

Reexportar: `~/.venv-peli/bin/python carteles/camiseta.py`

## stickers-chat/ · stickers de WhatsApp

WEBP de 512 × 512 con fondo transparente y menos de 100 KB, que es lo que
pide WhatsApp. Se montan en el móvil con cualquier app de stickers.
Ninguno lleva el 29-S ni la web, así que se pueden seguir usando después
de la votación.

Reexportar: `python3 carteles/stickers.py`

## qr/ · códigos QR sueltos

SVG vectorial, en tinta y sin fondo: se ponen sobre papel claro a
cualquier tamaño sin perder nitidez.

| Pieza | Lleva a |
|---|---|
| `qr-juego.svg` | sin-siglas.info/juego |
| `qr-reto.svg` | sin-siglas.info/#quiz |
| `qr-buzon.svg` | sin-siglas.info/buzon |

Regenerar: `python3 carteles/qr.py`

## Lo que no está

Nada de `carteles/borradores/`, `carteles/voz/` ni `carteles/video/`:
están en `.gitignore` porque no se publican, y este repo es público.
