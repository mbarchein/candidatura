#!/usr/bin/env bash
# Exporta los carteles a PNG de 1080x1350 exactos.
#
#   ./carteles/exportar.sh            todos los carteles
#   ./carteles/exportar.sh 2 6        solo esos dos
#   ./carteles/exportar.sh pegatinas  las dos hojas A4 de pegatinas, a PDF y PNG
#
# Los números son identificadores del fuente (el ?n= de carteles.html),
# no el orden de envío: los carteles no llevan numeración impresa para
# poder reordenarlos o añadir piezas sin que los ya enviados queden mal.
#
# Chrome captura el viewport tal cual, así que la ventana se pide del
# tamaño del lienzo y el cartel va pegado a la esquina (eso lo hace
# ?n= en carteles.html). --force-device-scale-factor=1 evita que un
# escritorio con HiDPI saque el PNG al doble de tamaño.
set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUENTE="$AQUI/carteles.html"
SALIDA="$AQUI/png"
PERFIL="$(mktemp -d)"
trap 'rm -rf "$PERFIL"' EXIT

# nombre de fichero por cartel, sin número: el orden lo decide
# ESTRATEGIA.md, no el nombre del PNG
declare -A NOMBRE=(
  [1]=buzon [2]=conciliacion [3]=ambiente [4]=comunicacion
  [5]=lo-que-no-podemos [6]=voces-del-buzon [7]=semaforo
  [8]=donde-encontrarnos [9]=ultima-llamada [10]=por-que-votar
  [11]=reto [12]=propuestas [13]=lo-que-pedimos
)

# la hoja de pegatinas es A4 y va por otro sitio: lo que hace falta es
# el PDF para llevarlo a imprimir, y un PNG solo para poder mirarlo
if [ "${1:-}" = "pegatinas" ]; then
  mkdir -p "$SALIDA"
  for hoja in pegatinas pegatinas-frases; do
    google-chrome --headless --disable-gpu --user-data-dir="$PERFIL" \
      --allow-file-access-from-files --virtual-time-budget=5000 \
      --no-pdf-header-footer --print-to-pdf="$AQUI/$hoja.pdf" \
      "file://$AQUI/$hoja.html" 2>/dev/null
    google-chrome --headless --disable-gpu --hide-scrollbars \
      --force-device-scale-factor=1 --window-size=794,1123 \
      --user-data-dir="$PERFIL" --allow-file-access-from-files \
      --virtual-time-budget=5000 --screenshot="$SALIDA/$hoja.png" \
      "file://$AQUI/$hoja.html" 2>/dev/null
    printf '%s · %s · %s\n' "$hoja" \
      "$(file -b "$AQUI/$hoja.pdf" | cut -d, -f1)" \
      "$(file -b "$SALIDA/$hoja.png" | cut -d, -f2 | tr -d ' ')"
  done
  exit 0
fi

# el díptico: dos carteles a tamaño completo, uno al lado del otro, en un
# lienzo de 2160x1350. Se manda como una sola imagen y se imprime en A3
# apaisado, donde cada mitad queda casi en A4
if [ "${1:-}" = "diptico" ]; then
  IZQ="${2:-2}"; DER="${3:-12}"
  # el cuarto argumento, 2x, saca 4320x2700: a 2160 px el A3 apaisado sale a
  # 130 ppp, que se ve blando impreso; al doble va a 260
  ESCALA=1; SUFIJO=""
  if [ "${4:-}" = "2x" ]; then ESCALA=2; SUFIJO="-2x"; fi
  mkdir -p "$SALIDA"
  destino="$SALIDA/diptico-${NOMBRE[$IZQ]}-${NOMBRE[$DER]}$SUFIJO.png"
  google-chrome --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=$ESCALA --window-size=2160,1350 \
    --user-data-dir="$PERFIL" --allow-file-access-from-files \
    --virtual-time-budget=5000 --screenshot="$destino" \
    "file://$FUENTE?d=$IZQ,$DER" 2>/dev/null
  printf '%s · %s\n' "$(basename "$destino")" "$(file -b "$destino" | cut -d, -f2 | tr -d ' ')"

  # el PDF va en vector y a tamaño nativo (571,5 x 357,2 mm): la imprenta lo
  # ajusta a A3 apaisado sin perder nitidez. Solo se saca una vez, no por
  # escala, porque el vector no tiene resolución
  if [ "$ESCALA" = "1" ]; then
    pdf="$AQUI/diptico-${NOMBRE[$IZQ]}-${NOMBRE[$DER]}.pdf"
    google-chrome --headless --disable-gpu --user-data-dir="$PERFIL" \
      --allow-file-access-from-files --virtual-time-budget=5000 \
      --no-pdf-header-footer --print-to-pdf="$pdf" \
      "file://$FUENTE?d=$IZQ,$DER" 2>/dev/null
    printf '%s · %s\n' "$(basename "$pdf")" "$(file -b "$pdf" | cut -d, -f1)"
  fi
  exit 0
fi

CUALES=("$@")
[ ${#CUALES[@]} -eq 0 ] && CUALES=(1 2 3 4 5 6 7 8 9 10 11 12 13)

mkdir -p "$SALIDA"
for n in "${CUALES[@]}"; do
  destino="$SALIDA/${NOMBRE[$n]}.png"
  google-chrome --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1080,1350 \
    --user-data-dir="$PERFIL" --allow-file-access-from-files \
    --virtual-time-budget=4000 \
    --screenshot="$destino" "file://$FUENTE?n=$n" 2>/dev/null
  printf '%s · %s\n' "${NOMBRE[$n]}" "$(file -b "$destino" | cut -d, -f2 | tr -d ' ')"
done
