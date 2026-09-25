#!/usr/bin/env bash
# Junta en merchan/ lo que se entrega: pegatinas, carátula del juego,
# camisetas, stickers del chat y QR.
#
#   ./merchan/recoger.sh
#
# COPIA, no mueve. Los fuentes y sus salidas se quedan en carteles/,
# porque exportar.sh escribe allí y el resto de piezas los enlaza por
# ruta relativa (la carátula y las hojas cargan qr-juego.svg, por
# ejemplo). merchan/ es solo el paquete para pasarlo a la copistería o
# al chat: se puede borrar y volver a sacar con esto cuando se quiera.
#
# Antes de recoger, reexporta lo que haya cambiado:
#   ./carteles/exportar.sh pegatinas
#   ./carteles/exportar.sh caratula
#   ~/.venv-peli/bin/python carteles/camiseta.py
#   python3 carteles/stickers.py
#
# Nada de carteles/borradores, carteles/voz ni carteles/video: están en
# .gitignore porque no se publican, y este repo es público.
set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CARTELES="$AQUI/../carteles"

# destino → ficheros de carteles/. Si se añade una pieza, va aquí y en
# el README
declare -A PIEZAS=(
  [pegatinas]="pegatinas.pdf png/pegatinas.png
               pegatinas-frases.pdf png/pegatinas-frases.png
               pegatinas-compi-2.pdf png/pegatinas-compi-2.png
               pegatinas-juego.pdf png/pegatinas-juego.png"
  [juego]="png/caratula-juego.png png/caratula-juego-2x.png"
  [camisetas]="png/camiseta-clara.png png/camiseta-oscura.png"
  [qr]="qr-juego.svg qr-reto.svg qr-buzon.svg"
)

# se comprueba todo antes de copiar nada: un paquete a medias es peor
# que ninguno, porque se manda sin darse cuenta de que falta algo
falta=0
for dest in "${!PIEZAS[@]}"; do
  for f in ${PIEZAS[$dest]}; do
    [ -f "$CARTELES/$f" ] || { echo "falta carteles/$f" >&2; falta=1; }
  done
done
compgen -G "$CARTELES/stickers/*.webp" >/dev/null || { echo "faltan carteles/stickers/*.webp" >&2; falta=1; }
[ "$falta" = 0 ] || exit 1

# cada subcarpeta se vacía antes de copiar, para que una pieza que se
# quita de la lista no se quede dentro del paquete con fecha vieja
for dest in "${!PIEZAS[@]}" stickers-chat; do
  rm -rf "${AQUI:?}/$dest"
  mkdir -p "$AQUI/$dest"
done

for dest in "${!PIEZAS[@]}"; do
  for f in ${PIEZAS[$dest]}; do cp "$CARTELES/$f" "$AQUI/$dest/"; done
done
# los del chat van todos: salen de stickers.py y el pack es lo que haya
cp "$CARTELES"/stickers/*.webp "$AQUI/stickers-chat/"

for dest in pegatinas juego camisetas stickers-chat qr; do
  printf '%-14s %2d ficheros\n' "$dest/" "$(find "$AQUI/$dest" -type f | wc -l)"
done
