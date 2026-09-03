#!/usr/bin/env bash
# Exporta los carteles a PNG de 1080x1350 exactos.
#
#   ./carteles/exportar.sh          todos
#   ./carteles/exportar.sh 2 6      solo el 02 y el 06
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

# nombre de fichero por cartel: el número manda, el nombre es para
# reconocerlo cuando lo vas a enviar
declare -A NOMBRE=(
  [1]=01-buzon [2]=02-conciliacion [3]=03-ambiente [4]=04-comunicacion
  [5]=05-lo-que-no-podemos [6]=06-voces-del-buzon [7]=07-semaforo
  [8]=08-donde-encontrarnos [9]=09-vispera
)

CUALES=("$@")
[ ${#CUALES[@]} -eq 0 ] && CUALES=(1 2 3 4 5 6 7 8 9)

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
