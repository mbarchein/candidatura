# Estrategia de campaña · Sin siglas, solo compañerxs

Elecciones al Comité de Empresa de Nazaríes · **martes 29 de septiembre de 2026**
Documento escrito el 3 de septiembre y actualizado el 7 con el reto. Quedan 22 días.

---

## 1. Diagnóstico

**Lo que tenemos.** Once personas conocidas repartidas en seis áreas, credibilidad de estar
dentro, y cuatro de nosotros ya sentados en el Comité de Seguridad y Salud y dos en la Comisión
de Igualdad. Sabemos cómo se pide información a la empresa y en qué plazos hay que contestar.

**Lo que no tenemos.** Ni horas liberadas, ni presupuesto, ni un fichero de afiliados, ni
material que nos venga hecho de fuera. Todo lo que salga lo hacemos nosotros por la tarde.

**Contra quién competimos de verdad.** No contra otra lista: contra *«esto no sirve para
nada»*. La abstención es el rival. Cada pieza de campaña tiene que dejar al lector con la
sensación de que el 29 se decide algo comprobable, no un cargo.

**Nuestro punto débil.** Los cuatro compromisos que llevamos —Ambiente, Conciliación,
Comunicación, Escucha— son honestos, pero cualquiera los firmaría. Son adjetivos. No
diferencian y no se pueden comprobar. Ahí es donde se juega la campaña.

---

## 2. La idea que sostiene todos los carteles

> **Nos comprometemos a cosas que se pueden comprobar.**

Una sigla promete resultados. Nosotros prometemos **procedimiento verificable**: qué vamos a
pedir, con qué artículo, en qué plazo, y qué publicaremos cuando nos contesten.

Es el único terreno donde una lista independiente gana. No podemos prometer un convenio, pero
sí podemos ser los primeros que dicen *«esto lo pedimos el primer mes, y os enseñamos la
respuesta»*. Y podemos decir en el mismo cartel lo que no vamos a conseguir, que es algo que
una candidatura con aparato detrás no suele hacer.

**Cada compromiso abstracto se convierte en tres acciones con artículo y plazo.** Eso es todo
el giro de la campaña.

### Tres reglas de tono

1. Una acción concreta vale más que tres adjetivos.
2. Lo que se promete lleva plazo, o no se promete.
3. Lo que no se puede conseguir se dice **en el mismo cartel**, no en la letra pequeña.

---

## 3. Arquitectura de mensajes

| Nivel | Qué dice | Dónde vive |
|---|---|---|
| Marca | Sin siglas. Solo compañerxs. | Web + A3 (ya hechos) |
| Temas | Tres o cuatro acciones concretas por compromiso | `conciliacion`, `ambiente`, `condiciones-minimas`, `carga-de-trabajo`, `comunicacion`, `bici-y-patinete` |
| Programa | Las doce peticiones juntas, con su artículo | `lo-que-pedimos` |
| Prueba | Que somos comprobables y honestos | `buzon`, `lo-que-no-podemos`, `voces-del-buzon`, `semaforo`, `propuestas` |
| Conversión | Cómo, cuándo y por qué votar | `donde-encontrarnos`, `por-que-votar`, `ultima-llamada` |
| Enganche | Entra en la web y quédate tres minutos | `reto` |

Los carteles nuevos son **1080 × 1350 px, tema claro**, pensados para enviar por el canal
donde ya se habla.

Dos piezas se pueden mandar juntas como **díptico de 2160 × 1350**, las dos a tamaño completo y
sin recortar nada:

    ./carteles/exportar.sh diptico 2 12        # el de la izquierda, el de la derecha
    ./carteles/exportar.sh diptico 2 12 2x     # 4320 x 2700, para imprimir

Lo que hay que saber antes de usarlo: en la burbuja de un chat, 2160 px se ven a unos 400 y el
cuerpo de texto queda en menos de 4 px, o sea que **el díptico obliga a tocar y ampliar**. Sirve
para correo, para ordenador y para imprimir —en A3 apaisado cada mitad queda casi en A4, a 130
ppp con la versión normal y a 260 con la `2x`—. Para que se lea de un vistazo en el móvil, el
formato sigue siendo el vertical de uno en uno. **Ninguno lleva número de orden**: en la esquina va la fecha, `29-S`, que es
lo único que no cambia y lo que se ve en la miniatura del móvil antes de leer nada. Así se pueden
reordenar, quitar o añadir piezas sin que las ya enviadas queden mal. Los números del `?n=` del
fuente son identificadores para poder capturarlos, no el orden de envío.

---

## 4. Los cuatro golpes de efecto

### 4.1 El buzón anónimo → «Nos lo dijisteis vosotros»

**`buzon` (4 de septiembre).** Abrimos la campaña *preguntando*, no prometiendo. QR a un
formulario anónimo: sin nombre, sin área, sin correo. Una sola pregunta: qué cambiarías de tu
día a día.

**`voces-del-buzon` (22 de septiembre).** El pago: las respuestas más repetidas, sin retocar, cada una
con su etiqueta —*ya está pedido* / *va al programa* / *no podemos, y te decimos por qué*.

Por qué funciona: la campaña deja de ser un monólogo, el material se lo escribe la plantilla, y
el día 22 tenemos algo que ninguna otra lista puede tener. Coste: cero.

Implementación real: `buzon.html` con formulario de Netlify —el sitio ya está en Netlify—, así
que se recogen las respuestas sin backend ni servicio de terceros. Detalles al final.

### 4.2 El semáforo del mandato

**`semaforo` (23 de septiembre).** Un cartel-contrato con las once firmas y el tablero que
publicaremos cada trimestre durante los cuatro años: cada acción de los tres carteles de tema en
**conseguido / en negociación / se cayó / todavía por pedir**.

El cartel muestra el tablero **con todo en gris**, tal y como está el día 23: nada pedido
todavía. Convierte *«os iremos contando»* en un objeto que se puede comparar con el de enero.

**Y estuvo mal contado y mal montado hasta el 9 de septiembre.** Cuatro cosas, y las cuatro
importan en la única pieza que es un contrato:

1. Decía «**nueve casillas** y ninguna marcada». Eran nueve filas por tres columnas: **veintisiete
   casillas**. Contar mal en el cartel-contrato es lo último que nos podemos permitir.
2. Tenía **tres columnas** —pedido, en negociación, conseguido— cuando este apartado especifica
   cuatro estados. **Faltaba «se cayó», que es justamente la que sostiene toda la tesis**: un
   tablero sin columna para el fracaso es un folleto.
3. Titulaba «**las nueve acciones**» y `lo-que-pedimos` lleva doce. Ahora la cabecera no lleva
   número —«lo que vamos a pedir»— y el número duro va en la leyenda, que es donde se puede
   comprobar.
4. **No tenía ni una fila de dinero**, que es el tema de cinco de las once respuestas del buzón. En
   enero el tablero no se habría podido comprobar en lo único que la gente pidió.

Como queda: **cuatro columnas, doce filas, 48 casillas** y ninguna marcada. Con tres filas nuevas
—las tablas de 2026 y sus atrasos, la compensación de teletrabajo en nómina y sin absorber, y la
intensiva de julio con los días de vacaciones intactos— y la bajada diciendo en voz alta que **hay
una columna para lo que se caiga**.

Y una elegancia que sale de las cuatro columnas: **nada marcado significa que está todo por
pedir**, así que el cuarto estado del apartado —«todavía por pedir»— no necesita columna. Es la
ausencia de marca.

### 4.3 Compi

La mascota ya existe, ya cae bien y es lo que hace que una pieza se reenvíe. Aparece en todos
los carteles con una pose y una frase distintas, y hace de firma reconocible sin necesidad de
logotipo. Es la parte barata y la que más va a circular.

**Las hojas de pegatinas** son la extensión física de esto. Dos A4 para papel adhesivo de
impresora, catorce pegatinas cada uno, que se cortan con tijeras por la línea de puntos:

- `pegatinas.html` — **HUD del juego de Compi**: cuadro de diálogo de RPG, ficha de personaje con
  Compi a 40 mm, «1 vida extra el 29-S», dos «objeto conseguido» con la reivindicación y su
  artículo, y una barra de participación que no llega al 100 %.
- `pegatinas-frases.html` — **solo letra**, para quien no quiere un muñeco en el portátil:
  Archivo Black recortado por el campo de color, el `29-S` sangrando por arriba, `Vota` a sangre,
  las frases de los carteles con su artículo, `Pregúntame` manuscrito, y **una pegatina de QR al
  buzón** (comprobada: se decodifica desde 20 mm impresos, va a 30 por margen).

Tres reglas de producción que mandan sobre el diseño, y que son la razón de que la primera
versión no valiera:

1. **El color para 3 mm antes de la línea de corte.** Una impresora de oficina desvía 1-2 mm, así
   que el error de tijera cae en crema y queda el filete blanco de una pegatina troquelada.
2. **Radio de esquina 6 mm mínimo.** Por debajo, la esquina no se resuelve en un solo arco.
3. **Las piezas van en absoluto y giradas una a una**, ninguna comparte borde con otra. Una
   rejilla regular de tarjetas iguales se lee como tabla, no como hoja de pegatinas.

Coste: dos folios adhesivos. Se reparten a mano y en la hora de comité, nunca dejándolas por las
mesas de nadie.

**Los siete GIF** son la versión de Compi para el chat, que es donde de verdad se reenvía algo.
Están en `carteles/gif/`, miden 400 × 380 y pesan entre 10 y 21 KB:

| GIF | Para qué |
|---|---|
| `compi-hola` | abrir conversación · saluda y le sale un corazón |
| `compi-29-s` | recordar la fecha · baila |
| `compi-me-ganas` | picar a que jueguen al reto · guiño |
| `compi-toma-ya` | celebrar una buena marca |
| `compi-casi` | cuando alguien falla el reto · llora |
| `compi-ya-no-leo` | la desconexión, a las 19:00 · le sale el gotón |
| `compi-voy-a-votar` | **el domingo 27**, no el 29 · anda |
| `compi-detector` | **el detector de humo** · escucha, lo oye y pita en rojo |

**El detector de humo, y por qué la broma no va contra nadie.** Sale de descartar la idea del
GIF de un personaje de anime a costa del cartel del otro equipo. Ese habría sido gracioso una vez
y caro tres: convierte la campaña en un asunto entre dos listas —cuando el rival es la abstención,
apartado 1—, se lee como cachondeo de compañeros, y usa material ajeno teniendo mascota propia.

Lo que se manda en su lugar apunta **al criterio y no a las personas**. Nueve cuadros en tres
tiempos, y el GIF se cuenta solo:

| Cuadros | Globo | Compi |
|---|---|---|
| 1-3 | «Te escucho.» | tranquilo, camiseta cian |
| 4-5 | «¡Uy! Promesa imposible.» | sorpresa, brazos abiertos |
| 6-9 | «Detecto humo. ¡Pipipí!» | **en rojo**, brazos arriba, pitando por los lados |

Los dos cuadros del medio hacen falta: con uno solo, 185 ms no dan para leer «promesa imposible»
y la reacción se veía como un parpadeo. Y debajo, impresa **en el propio GIF**, la regla:

> salta con cualquier promesa **sin artículo y sin fecha**. también con las nuestras

Esa última línea es la pieza entera. Sin ella el GIF es una pulla; con ella es un criterio que se
lo puede aplicar cualquiera, nosotros incluidos, y por eso no se puede contestar. Va impresa en el
GIF y no en el mensaje que lo acompaña porque **un GIF se reenvía solo y el mensaje se queda
atrás**. Por eso este es el único que mide 400 × 432 en vez de 400 × 380: la regla no cabía.

Tres detalles de implementación, para quien lo toque:

1. La pose `detector` es **la única que recolorea la camiseta** —cian a coral—, porque la gracia
   tiene que leerse en la burbuja de un chat a 60 px de alto, donde la cara ya no se distingue.
   Solo ella pone `E.alarma`, y **comprobado reexportando los diecisiete carteles: no cambia ni un
   píxel.**
2. El galón coral del pecho se pierde sobre el rojo, y está bien: en alarma la camiseta es una
   mancha.
3. **La frase va por cuadro**, no una sola para todo el GIF. La primera versión llevaba una sola
   y el globo ya decía «¡pi, pi, pi!» mientras Compi seguía tranquilo, o sea que destripaba el
   chiste antes de que saltara. `compi-gifs.html` acepta ahora un array de frases, y los otros
   siete GIF no se tocan.

Se regeneran con `pip install pillow && python3 carteles/gifs.py`. Las frases y los tiempos viven
en `compi-gifs.html` y no en el script, para no tenerlos escritos en dos sitios: Chrome pinta de
una pasada la tira con todos los fotogramas de cada GIF y el script la corta y la monta.

Para que los detalles flotantes —corazón, chispas, gota, lágrimas— salieran en los GIF hubo que
añadirlos a `pintaCompi`, pero **van detrás de `op.extras`**: los carteles no los piden, así que su
render no cambia ni un píxel. Comprobado reexportando los trece.

Dos cosas al usarlos: llevan `sin-siglas.info` y `29-S` impresos, así que **son propaganda** y les
aplica igual el cierre del art. 8.4 —nada el lunes 28—.

**Y de ahí sale una contradicción que había en esta misma tabla:** `compi-voy-a-votar` estaba
asignado «al día 29», y el día 29 ese GIF **no se puede mandar**, porque lleva el `29-S` impreso
(`compi-gifs.html`, línea 124) y por nuestra propia regla es propaganda. Su último día legal es el
**domingo 27**. Corregido arriba, y dicho aquí porque es de las cosas que alguien manda sin pensar. Y WhatsApp convierte los GIF en vídeo en
bucle al mandarlos desde la galería: se ven igual, pero si alguien los quiere como pegatina hay
que sacarlos en otro formato.

    ./carteles/exportar.sh pegatinas

### 4.4 El reto · «¿cuánto nos conoces?»

**`reto` (7 de septiembre).** El juego ya está en la web: doce preguntas de quince segundos sobre
nosotros, sobre el comité y sobre cómo se vota, con ranking común y un premio pequeño que se
sortea entre quienes jueguen. El cartel existe para que entren a jugarlo.

Por qué está en el plan y no es un adorno: es la única pieza que **pide tres minutos en vez de
una lectura**, y quien juega sale sabiendo qué dura un mandato, quién cuenta los votos y con qué
antigüedad se vota. Es la vía más blanda que tenemos contra *«esto no sirve para nada»*, que es
el rival de verdad.

El cartel es el propio tablero del juego, con una pregunta de verdad del banco: **¿qué día se
vota?**. Es la única que se puede contestar mirando el cartel, porque el `29-S` va en la esquina
de todos, y eso es exactamente el chiste.

Dos reglas que no son de diseño:

1. **El sorteo no se condiciona al voto**, ni a votar, ni se pregunta a quién se vota. Va escrito
   en el cartel y en la web, no en la letra pequeña.
2. **Antes de enviarlo hay que comprobar que la web responde y que el reto y el ranking
   funcionan.** Un cartel que invita a jugar y lleva a una página caída hace el mismo daño que un
   QR roto.

**El cartel lleva los dos QR: el del reto y el del buzón.** Es la única pieza de la serie con
dos códigos, y no es un descuido. El buzón se abrió el día 4 y el pago llega el 22; en medio hay
un fin de semana y ninguna pieza que lo recuerde, así que el envío que sí va a abrir la gente
—porque trae un juego— lleva también la petición de que escriban. El reto manda en el titular y
en el tablero; el buzón es la segunda puerta, con su color cian y su pregunta, la misma del
formulario.

Ojo con lo que dice de cada uno: el buzón **no cierra el 22**, sigue abierto después del 29. Lo
del 22 es que publicamos lo más repetido, y así está escrito en el cartel.

Los dos QR decodifican impresos y en pantalla de ordenador —comprobado leyéndolos del PNG
final—, pero **no a tamaño de miniatura en el móvil**, y menos ahora que van a 132 px en vez de
156. Quien lo mande pega también los dos enlaces en el mensaje.

---

### 4.5 El convenio propio, con la ruta puesta

**`convenio` (9 de septiembre).** La otra candidatura ha sacado un cartel proponiendo estudiar e
impulsar un convenio colectivo de empresa. Es una buena pieza y es una buena idea: poner por
escrito lo que hoy funciona por costumbre es **nuestra propia tesis en su envase más grande**.

Así que no se contesta, y no se menciona a nadie —sigue en pie la regla del apartado 6—. Lo que
hace `convenio` es coger la idea y ponerle lo único que le falta, que es lo de siempre: el
vehículo, el artículo y el mes.

**La distinción que sostiene el cartel.** Para mejorar por encima del convenio del sector hay dos
caminos, y no son el mismo:

- **Un acuerdo de empresa suma.** Se firma encima del convenio del sector, solo añade, y se puede
  firmar a trozos. Empieza a dar cosas dentro del mandato.
- **Un convenio de empresa sustituye.** En horarios, distribución de la jornada, turnos,
  vacaciones, clasificación profesional, modalidades de contratación y conciliación **desplaza** al
  del sector (art. 84.2 ET). Necesita mayoría del comité y la firma de la empresa, y no hay
  obligación de llegar a acuerdo.

Mismo destino, dos caminos. Nosotros pedimos abrir la negociación igual (art. 87.1 ET) y lo
decimos en el cartel; lo que no hacemos es dar a entender que se firma en un año.

**El teletrabajo se dijo mal dos veces, y la segunda fue peor.** La primera versión decía que el
convenio «no le pone ni un euro». La segunda lo corrigió a medias —«ya se paga, y está bien»— dando
por hecho que era una costumbre de la casa. **Las dos eran falsas, y la razón es que se buscó en el
artículo equivocado**: el art. 22.i es un permiso por no poder acceder al centro. El teletrabajo
está en el **art. 41**, y ahí sí hay cifra:

> «percibirán en concepto de compensación de gastos la cantidad **17,68 euros brutos mensuales**
> […] A partir del 1 enero del 2026 esta cantidad, de resultar aplicable, será de **18,21 euros
> brutos mensuales**. A partir del 1 enero del 2027 […] **18,76 euros**.»
> «Esta cantidad tiene naturaleza **extrasalarial, no compensable ni absorbible por ningún otro
> concepto**.»

**Por qué esto era el error más caro de la serie:** la lista rival está asesorada por una de las
firmantes de ese convenio, y la respuesta le cabe en una línea —«nuestro convenio te paga 18,21 € al
mes y ellos dicen que no te paga nada»—. Habría bastado para tirar la marca entera.

Dos condiciones que van con la cifra y que hay que decir: es **proporcional** si no teletrabajas la
jornada completa, y solo aplica al trabajo a distancia **regular**, que el art. 1 de la Ley 10/2021
define como el **30 % de la jornada** en tres meses. Quien teletrabaje un día a la semana queda
fuera.

**Y el dato que nadie ha puesto todavía en un cartel:** desde la reforma de 2021, el convenio de
empresa **ya no tiene prioridad aplicativa en salario** —el RDL 32/2021 suprimió la letra a) del
art. 84.2 ET—. O sea que en retribución, que es lo más repetido del buzón y la primera línea de su
lista, un convenio propio no desplaza al del sector: solo sirve si la empresa firma por encima, que
es exactamente la situación de hoy.

**Las tres acciones son mejoras por encima del convenio, y las tres están leídas en el BOE**
(BOE-A-2025-7766, XIX Convenio de consultoría y TIC), no en un resumen:

| Acción del cartel | De dónde sale |
|---|---|
| La intensiva también en julio | art. 20.2: el convenio **solo la da en agosto**, con tope de 36 h/semana |
| El teletrabajo **por escrito** | Ley 10/2021, arts. 6.1, 6.2 y 7 |
| Los 218,10 € de formación | art. 14: **no es automática** — «será reconocida en función del aprovechamiento anterior y del interés de los estudios para la empresa» |

Y lo que **no** lleva, a propósito: el 4 % / 3 % / 3 % de incremento. Esa cifra la dan cuatro
fuentes secundarias —Iberley, payfit, UGT y la sección de CCOO en Arsys— pero vive en el Anexo I y
no está leída en fuente primaria. **Si alguien la quiere en un cartel, se lee el anexo antes de
exportar.** Lo que sí está comprobado del art. 27 es la cláusula de revisión por IPC para 2028,
con tope del 2 %.

El cartel cierra con **«escuchar no es una promesa: el buzón lleva abierto desde el 4 de
septiembre»**, en tipografía de cuerpo y no en el mono pequeño de `.ultimo`. Es la contestación al
«escucharemos a la plantilla» del otro cartel, y va en cuerpo porque en mono chico se lee como
letra pequeña, que es justo lo contrario de lo que dice. No hace falta más: ellos prometen
escuchar cuando ganen, nosotros llevamos un mes con el buzón abierto y el pago sale el 22.

    ./carteles/exportar.sh 14
    ./carteles/exportar.sh diptico 12 14      # con «no te prometemos lo que no podemos»

### 4.6 `ambiente` partido en tres

**El cartel de ambiente hacía tres trabajos y ninguno bien.** Llevaba la evaluación de riesgos
psicosociales, las condiciones del puesto y los espacios de descanso, y el resultado pedía 1.451 px
en un lienzo de 1.350: no era un problema de maquetación, era que **eran tres carteles**. Se
partió, y cada uno mejoró al quedarse solo:

| Pieza | De qué va |
|---|---|
| `ambiente` | **Los sitios.** Zona de comida y zona de descanso, diferenciadas |
| `condiciones-minimas` | **Lo tangible.** Lo que se comprueba mirando tu propia mesa |
| `carga-de-trabajo` | **Lo que no se ve.** Carga, presión y plazos |

**Y dos frases que había que quitar de ahí sí o sí.** El cartel viejo decía «es obligatoria y
**casi nunca se hace bien**» y «no un **cuando haya presupuesto**». Las dos están prohibidas por el
apartado 6 de este documento, literalmente y con esas palabras. La regla se escribió después del
cartel y nadie volvió a corregirlo.

#### `ambiente` · los sitios

Zona de comida separada del puesto y zona de descanso distinta de la cocina. El argumento no es el
confort: es que **ahora mismo los encuentros son de pasillo o de cocina** y comer delante del
portátil no es una pausa.

**Y aquí hubo que corregir un exceso.** El **RD 486/1997, anexo V.3.2.º** dice que el local de
descanso **no se aplica** «cuando el personal trabaje en despachos o en lugares de trabajo
similares que ofrezcan posibilidades de descanso equivalentes». O sea: **en una oficina la sala de
descanso no es obligatoria.** Es petición, y el cartel lo dice en el panel del límite.

Lo que **sí** es obligatorio y sin excepción está en el mismo anexo, **V.3.4.º**: las trabajadoras
embarazadas y en lactancia «deberán tener la posibilidad de descansar tumbadas en condiciones
adecuadas». El cartel lo lleva como tercera fila y no afirma que aquí no exista: dice
**«preguntaremos dónde está»**, que es lo único que se puede decir sin haberlo comprobado.

#### `condiciones-minimas` · lo que se comprueba mirando tu mesa

Dos listas **etiquetadas a propósito**: arriba lo que la norma ya reconoce, con su cita; abajo lo
que se pide, sin cita porque no hay ninguna. Mezclarlas era lo que hacía que pareciera una carta a
los Reyes.

**Y aquí hay una promesa que el CSS no cumple, apuntada para arreglarla.** Esta pieza se justifica
por legibilidad —se lee con la mesa delante—, pero su lista va a **18,5 px** y el cuerpo general de
la serie (`--t-cuerpo`) es de **20 px**. Es más grande que el programa del 13 (17,5 px) y más
pequeña que todo lo demás. O sea: la pieza que existe para poder leerse es la que menos cuerpo
tiene. Hay que subirla, y probablemente hay que subir la escala entera.

| Ya te toca | Norma |
|---|---|
| Entre 17 y 27 ºC en trabajo de oficina | RD 486/1997, anexo III |
| Humedad entre el 30 % y el 70 % | RD 486/1997, anexo III |
| Silla de altura regulable, respaldo reclinable y ajustable | RD 488/1997, anexo 1.e) |
| Reposapiés «a disposición de quienes lo deseen» | RD 488/1997, anexo 1.e) |
| Pantalla orientable y sin reflejos, teclado aparte | RD 488/1997, anexo 1.a) y 1.b) |
| La revisión de la vista **te la tienen que ofrecer** | art. 4 RD 488/1997 · art. 22.1 LPRL |

**Cuidado con la de la vista, que la primera versión la dijo mal.** El art. 4.1 del RD 488/1997 dice
que la vigilancia «**deberá ofrecerse**» —antes de empezar con pantalla, luego periódicamente y
cuando aparezcan molestias—, y el art. 22.1 LPRL que «**sólo podrá llevarse a cabo cuando el
trabajador preste su consentimiento**». O sea: te la ofrecen y tú decides. Y el oftalmólogo es un
derecho **solo si esa revisión lo hace necesario** (art. 4.2), no automático. El cartel decía
«revisión de la vista antes de empezar y luego periódica», que se leía como un derecho a que te la
hagan. **Y el convenio no dice nada de gafas**, así que el cartel tampoco.

Lo que se pide, sin norma detrás y dicho como lo que es: el mismo monitor en todos los puestos —que
no dependa de cuándo entraste—, que el ofrecimiento de la vista llegue por escrito, y un calendario
de sustitución con fechas.

#### `carga-de-trabajo` · lo que no se ve

El titular es la frase que hacía entender el punto en la versión vieja, y sola vale más que la
explicación: **«vamos apretados» no es un dato.** De ahí sale todo: método validado, resultados
**por área** —una media de empresa tapa justo al equipo que está peor— y plan con fechas.

No promete que baje la carga. El panel del límite dice que la plantilla y los plazos del cliente no
los decide el comité, y que lo que sí se puede es **que la carga deje de ser una sensación y pase a
ser un número que alguien tiene que explicar**.

### 4.7 Bici y patinete · una sola idea

**`bici-y-patinete` (11 de septiembre).** Salió de una conversación con Violeta sobre movilidad y
acabó siendo otra cosa, mejor: **poder venir en bici o en patinete y dejarlo en un sitio cerrado.**
Nada más.

**La primera versión era un plan de movilidad y estaba mal.** Llevaba cuatro acciones —la jaula, el
abono de transporte exento de IRPF, el teletrabajo y el accidente *in itinere*—, todas ciertas y
todas con su artículo, y el cartel no se entendía: parecía una propuesta de política de movilidad
en vez de una petición concreta. Es el mismo error que ya se había corregido en `salarios-ipc`:
**una idea por pieza.**

Lo que se cayó, y a dónde va:

| Se cayó | Por qué | A dónde |
|---|---|---|
| Abono de transporte exento de IRPF | Es transporte público, no bici. Y es bueno | Programa escrito · `lo-que-pedimos` |
| El teletrabajo dentro del plan | Ya tiene sus líneas propias | `conciliacion`, `lo-que-pedimos` |
| El *in itinere* como accidente de trabajo | Verdad, pero abstracto | Comité de Seguridad y Salud |

**El abono de transporte, para que no se pierda:** el **art. 46 bis del Reglamento del IRPF** deja
que la empresa pague el transporte público de la plantilla —abono, tarjeta o título— y esas
cantidades están **exentas de IRPF hasta 1.500 € al año**, con un tope de **136,36 € al mes** en
tarjeta. También están fuera de la base de cotización. **En metálico no vale**: si te dan el dinero
para que te lo compres, es salario y tributa. O sea: la empresa puede cubrirle el bus a quien venga
en transporte público sin que le cueste impuestos a nadie. Le cuesta dinero a la empresa, así que
se negocia; pero es una mejora que no necesita subida salarial.

**Y no dice «ya pedida».** La versión anterior lo afirmaba. Era falso —el proceso se hace con el
comité constituido, después del 29— y era la única línea de toda la serie que afirmaba un hecho
nuestro en vez de una norma. Ahora el cartel lleva plazo: *«en la primera reunión del comité, por
escrito»*, y cierra con **«todavía no lo hemos pedido, y no vamos a decir que sí»**. Eso es más
fuerte que el falso acuse de recibo, porque es la única frase del formato que ninguna otra
candidatura escribiría.

**Base legal, leída del consolidado** (BOE-A-2025-24545, actualizado el 21-03-2026, ya con el
RDL 7/2026 dentro):

- **Art. 26.3 Ley 9/2025** — el plan contempla el «impulso de la movilidad activa», que es donde
  vive una jaula de bicis.
- **Art. 26.1** — obliga a *tener* plan a los centros de «más de 200 personas trabajadoras o 100
  por turno», en «el plazo de doce meses desde la entrada en vigor». Entró el 5-12-2025: la fecha
  es el **5 de diciembre de 2026**.
- **Art. 85.1 ET, párrafo 3.º**, que le añadió la disposición final tercera de esa ley:
  «existirá el **deber de negociar** medidas para promover la elaboración de planes de movilidad
  sostenible al trabajo». **Ese deber no tiene umbral de 200 personas**, y es el que sostiene el
  cartel si el centro no llega.

**Y el límite dicho en el propio cartel:** la jaula la paga la empresa, no la firma el comité.

Lo llevan **Rafael López** y **Mario Aranda**, con las dos caras en el pie.

### 4.8 La subida y el desempeño · la pieza incómoda

**`subida-y-desempeno`.** Contesta al tema más repetido del buzón —cinco de once respuestas hablan
de dinero, y dos justo de esto— y es la más difícil de escribir de toda la serie, porque **la
respuesta honesta es incómoda: que una subida absorba a la otra es legal.**

**Art. 7 del XIX Convenio, «Compensación. Absorción.», apartado 2**, leído en el BOE y literal:

> Dichas condiciones también serán **absorbibles**, hasta donde alcancen y en cómputo anual, **por
> los aumentos que en el futuro pudieran establecerse** en virtud de preceptos legales, Convenios
> Colectivos, contratos individuales de trabajo y por cualesquiera otras causas, **con la única
> excepción de aquellos conceptos que expresamente fuesen excluidos de absorción** en el texto del
> presente convenio.

Ese artículo decide el cartel entero. **No se puede denunciar nada**, porque no hay nada que
denunciar: lo permite el convenio que firmamos. Lo que se puede hacer es explicar el mecanismo —que
casi nadie conoce— y pedir lo único que lo arregla.

| Acción | Base |
|---|---|
| Las dos subidas se compensan entre sí | art. 7.2 del convenio · art. 26.5 ET |
| **La nómina en dos líneas**: tablas y desempeño, separadas | art. 64 ET |
| El criterio del desempeño por escrito, y el registro retributivo entero | art. 28.2 ET · RD 902/2020 |
| Una **cláusula de no absorción** | art. 7.2 del convenio (la excepción está en el propio artículo) · art. 87.1 ET |

**La acción 02 es la que gana la pieza y no cuesta nada.** Dos líneas en la nómina no las tiene que
pactar nadie con nadie: es información, y sin ella nadie puede saber si le han subido el sueldo o
le han subido lo que ya le tocaba. Es el ejemplo más limpio de todo el apartado 2 —procedimiento
verificable en vez de resultado prometido—.

**Y la 04 no nos la hemos inventado:** la excepción está escrita en el propio art. 7, así que pedir
una cláusula de no absorción es *usar* el convenio, no saltárselo.

Lo demás comprobado en el mismo texto: **art. 27.1** —el incremento va integrado en las tablas del
anexo I, no como cláusula de porcentaje— y **art. 27.5**, la revisión por IPC, que existe **solo
para 2028**, si el IPC acumulado 2025-2027 supera el incremento acumulado de tablas, **con tope del
2 %** y con efectos únicamente desde el 1-1-2028. Eso último va en el panel del límite: es la
respuesta exacta a las cinco respuestas del buzón que piden IPC.

**Lo que el cartel NO dice, y es deliberado:** que a nadie le hayan absorbido nada. Dice que puede
pasar y que no hay manera de saberlo, que es lo único que se puede afirmar sin haber visto una
nómina. La primera versión de esta pieza escrita de otra forma sería un bulo.

Lo firman **Laura Muñoz (Finance & Accounting) y Raúl Navarro (People & Values)**: las dos personas
de la lista a las que tiene sentido preguntarle por una nómina. Es la primera pieza con dos caras
en el pie.

### 4.9 La pieza dura · cuatro preguntas

**`cuatro-preguntas`.** El encargo era ser más agresivos y decir que a alguien no hay que votarle,
sin caer en lo chabacano. Esta es la versión que **no se puede contestar**.

No menciona a nadie. No hay una sola afirmación sobre la otra candidatura, ni sobre personas, ni
sobre siglas, así que el apartado 6 sigue intacto. Lo que hace es **darle al lector cuatro
preguntas y contestarlas nosotros primero**:

1. ¿En qué artículo te apoyas?
2. ¿Para cuándo? Dame la fecha.
3. ¿Y si la empresa dice que no?
4. ¿Qué no vas a poder conseguir?

El filo está en que las cuatro tienen respuesta en nuestro material y **ninguna la tiene un cartel
que promete un convenio sin fecha**. El «a quién no votar» va **por criterio y no por objetivo** —
*«a quien no te conteste a las cuatro; tampoco a nosotros»*—, y por eso se sostiene incluso si lo
lee la otra lista: no puede contestarlo sin darnos la razón.

**Por qué esta versión y no un ataque directo.** Un ataque a la otra candidatura nos cuesta lo
único que tenemos, que es no ser eso, y encima es contestable: cualquier afirmación sobre ellos
abre una discusión sobre nosotros. Una pregunta no se contesta atacando. Y las cuatro son las
mismas que nos hemos hecho nosotros para escribir la serie.

**Regla al enviarla, y no es de estilo:** es la única pieza de la serie que se puede leer como un
ataque. Va **sin reenvío múltiple** y **sin comentario de guerra encima** —una línea seca de quien
la manda y nada más—. Si alguien quiere discutirla, se discute en persona. Un cartel de preguntas
reenviado por once personas a la vez deja de ser una pregunta.

### 4.10 La cara de quien trae cada pieza

La otra candidatura pone **un retrato en la esquina de todos sus carteles**, siempre el mismo. Es
buena idea y funciona: una cara para el pulgar antes de leer nada.

Nuestra versión no es copiarla, es la que nos pega: **la cara cambia por pieza y viene con el
puesto**, en el pie, al lado de quien la trae. Eso es literalmente lo que dice la marca —once
personas de seis áreas, no un aparato— y una candidatura con una sola cara no lo puede hacer.

Estrenado en `movilidad` con Violeta, y en `subida-y-desempeno` con dos caras a la vez. Las fotos son las mismas 260 × 260 del A3
(`a3-candidatura/img/`), así que no hay que recortar nada nuevo; el pie las pide con
`.pie__medio--cara` y un aro del color de acento del cartel.

Queda **decidir si se lleva a los otros catorce**. A favor: la serie gana cara y deja de ser
anónima. En contra: en tres piezas el pie va con dos nombres —`donde-encontrarnos`, `propuestas`,
`convenio`— y ahí habría que elegir uno o poner dos caras; y `semaforo` y `lo-que-pedimos` los
firman los once, así que ahí no pega una sola cara.

## 5. Calendario

| Día | Pieza | Rol | Quién la manda |
|---|---|---|---|
| vie 4 sep | **Primero tú** · el buzón + QR | Apertura: pedimos antes de prometer | Rocío Galindo |
| lun 7 sep | **A que no nos conoces** · el reto | Enganche: jugar, y de paso escribir al buzón | Mario Aranda |
| mié 9 sep | **Un convenio propio se empieza por aquí** | Coge la idea del convenio y le pone la ruta | Mario Barchéin |
| mar 8 sep | **La conciliación no es un favor** | Tema · abre diciendo que no prometemos lo imposible | Leticia Algarra |
| jue 10 sep | **No te prometemos lo que no podemos** | Lo que pide el buzón, con artículo y límite | Laura Muñoz |
| vie 11 sep | **¿Dónde dejo la bici?** · bici y patinete | Una petición concreta, con plazo y sin darla por pedida | Rafael López |
| vie 11 sep | **Un sitio donde desconectar sin salir** · ambiente | Tema · los sitios | Raúl Navarro |
| mar 15 sep | **Que te lo cuenten antes** · comunicación | Tema | José Pablo Fernández |
| jue 17 sep | **Lo que un comité no te va a conseguir** | Diferenciación por honestidad | Mario Barchéin |
| vie 18 sep | **No hace falta que pidas cita** | Movilización | María Emilia Castillo |
| mar 22 sep | **Esto no lo decimos nosotros** · buzón | Pago del golpe 1 | Rocío Galindo |
| mié 23 sep | **El semáforo del mandato** | Golpe 2 · lo firman los once | Rafael López |
| jue 24 sep | **La próxima vez, en 2030** · por qué votar | Llamada al voto, sin pedirlo para nosotros | Fran Bolívar |
| vie 25 sep | **El martes se vota** · última llamada | Conversión · cómo y dónde se vota | Violeta López |
| lun 28 sep | — nada — | **Prohibido por el art. 8.4 del RD 1844/1994** | — |

Once piezas, y la última el **viernes 25**. El buzón se cierra y se publica el 22, no el 18, para
dar más margen a que llegue gente.

`conciliacion`, que va primero, lleva las dos líneas que antes solo estaban en `propuestas`: el
panel del final se titula **«no prometemos lo que no se puede»** y debajo va una línea con que el
buzón sigue abierto y seguirá abierto después del 29. Así la primera pieza de tema ya trae el tono
de toda la campaña, y no hay que esperar al día 10 para que alguien lo lea.

### El atasco del 8 de septiembre

**A día 8 no se ha enviado nada desde la presentación de la lista.** El buzón salió el día 4 y
recogió once respuestas; después, nada. Eso deja el calendario de este apartado como una
intención y no como un registro.

**Y la cuenta de huecos que había aquí estaba mal.** Decía «nueve huecos de envío», pero eso solo
sale usando miércoles y jueves —que es lo que hace la tabla de arriba, contradiciendo la regla de
«dos por semana, martes y viernes»—. Con la regla en la mano, del 9 al 25 quedan **cinco**:

    viernes 11 · martes 15 · viernes 18 · martes 22 · viernes 25

Cinco huecos. Y a día de hoy hay **diecinueve carteles hechos**. O se relaja la regla y hay nueve,
o se respeta y hay cinco; lo que no se puede es planificar con nueve y creer que se cumple la regla.
Las dos opciones son legítimas, pero **hay que elegir una**, porque las diecinueve piezas no caben
ni en cinco ni en nueve y meterlas a tres por semana convierte la campaña en publicidad, que es
justo lo que no somos.

De ahí sale `lo-que-pedimos`: las doce peticiones en un cartel, cada una en una línea con su
artículo. **Resume los tres carteles de tema**, así que permite no enviar alguno de ellos y dejar
los huecos para lo que nadie más puede mandar —el pago del buzón, el semáforo, la honestidad y la
movilización final—. Tres de sus líneas no las lleva ninguna otra candidatura: el acuerdo escrito
de trabajo a distancia con los gastos compensados, las veinte horas de formación que ya son un
permiso retribuido, y el registro de jornada publicado por área.

Queda fuera, y a propósito: el **protocolo de acoso y el canal interno de denuncias**. Los dos son
obligatorios y se negocian con la representación, así que son buena propuesta, pero no material de
cartel: van al programa escrito y se hablan en la asamblea.

**El reto es la excepción al ritmo de martes y viernes**, y va suelto un lunes a propósito: el
juego y el ranking ya están publicados, y cuanto antes se mande, más margen tiene el tablero para
llenarse antes de cerrar el sorteo. No sustituye a ninguna pieza de tema.

**El lunes 28 no se manda nada, y no es una decisión de estilo:** el art. 8.4 del RD 1844/1994
corta la propaganda electoral a las cero horas del día anterior al de la votación. Ver el
apartado 10.

### El calendario que sale de la auditoría del 9 de septiembre

Cuatro asesores externos —movilización, creatividad, relaciones laborales y oposición— revisaron la
serie el 9 de septiembre. De ahí salieron seis errores legales verificados en fuente primaria, dos
piezas nuevas de participación, una de dinero, y este calendario. Va con miércoles y jueves, o sea
que **relaja la regla de martes y viernes a sabiendas** (ver la cuenta de huecos, arriba).

| Día | Pieza | Por qué ahí |
|---|---|---|
| jue 10 | `conciliacion` | Iba el 8 y ya va tarde. Trae el tono, y ahora con la cláusula de los 23 días |
| vie 11 | `tablas-2026` | **Dinero comprobable y ya vencido.** No propone nada: es una obligación de abril |
| mar 15 | `voto-por-correo` | Quita una barrera en vez de dar una razón. Y el plazo se agota el 24 |
| jue 17 | `convenio` | El terreno que abrió la otra lista. Tiene que ir antes de cualquier pieza que diga «convenio» |
| vie 18 | `condiciones-minimas` | La credibilidad más barata: se comprueba mirando tu propia silla |
| mar 22 | `voces-del-buzon` | Fecha no negociable. Solo existe si el buzón sigue recibiendo |
| mié 23 | `semaforo` | Justo después del pago, para que el tablero contenga lo que la gente pidió |
| jue 24 | `a-que-hora-bajas` | El compromiso de hora, a cuatro días. Y es el último día del voto por correo |
| vie 25 | `ultima-llamada` | Conversión, con hora y sitio de la urna |

**Fuera de los nueve, y no por fallo:** `ambiente`, `carga-de-trabajo`, `comunicacion`,
`bici-y-patinete`, `propuestas`, `lo-que-pedimos`, `lo-que-no-podemos`, `cuatro-preguntas`,
`salarios-ipc`, `por-que-votar`, `donde-encontrarnos`, `buzon` y `reto`. Valen para el programa
escrito, la asamblea, la web, el A3 en pared y la conversación de pasillo. **Un cartel que no se
envía no es un cartel perdido**; un envío de más sí convierte la campaña en publicidad.

Dos de esas trece están bloqueadas por una razón concreta: `donde-encontrarnos` sigue con la hora de
comité sin confirmar (apartado 9.2) y `cuatro-preguntas` apuesta a que nuestras citas son perfectas,
lo que solo es cierto desde hoy.

### Lo que hay que cerrar antes del jueves 10

1. **La hora y el sitio de la urna**, a la mesa. Bloquea `ultima-llamada` del día 25.
2. **La participación de las elecciones anteriores**, a la mesa. Si es baja, es el mejor cartel que
   podríamos mandar y nadie la ha pedido.
3. **La fecha del acta de proclamación definitiva.** El art. 8.4 abre la ventana ese día: si el
   buzón salió el 4 y la proclamación fue posterior, esa pieza quedó fuera de ventana.
4. **El plazo exacto del voto por correo**, confirmado con la mesa. El art. 10.1 dice «cinco días
   antes»; el jueves 24 es nuestro cálculo, no su publicación.
5. **La plantilla del centro.** Decide si el comité tiene cinco o nueve asientos (art. 66.1 ET) y
   si el crédito horario es de 15 o 20 horas (art. 68.e).
6. **`semaforo` no se puede enviar como está.** Dice «nueve casillas» y son veintisiete; tiene tres
   columnas cuando el apartado 4.2 especifica cuatro —falta «se cayó», que es la que sostiene la
   tesis—; titula «las nueve acciones» y `lo-que-pedimos` lleva doce; y no tiene **ni una fila de
   dinero**, que es el tema de cinco de las once respuestas del buzón.
7. **El reto tiene tres partidas jugadas** (`/api/ranking`, campo `jugadas`) contra un objetivo de
   30. El enlace funciona —está en `/#quiz`, no en `/reto`—, así que el problema no es técnico: es
   que no se ha mandado.

### Reglas de envío

- **Dos por semana, martes y viernes.** Nada un lunes a primera hora ni un viernes a última.
- **Lo manda una persona distinta cada vez**, y del área que le toca al tema: la conciliación
  la envía quien la vive, los espacios quien está en Seguridad y Salud. Un cartel reenviado por
  once personas a la vez parece publicidad; reenviado por una, parece una conversación.
- **Nunca por correo corporativo ni por listas de la empresa** para mandar carteles. Se lee como
  comunicación de dirección y nos quita lo único que tenemos, que es no ser eso.
  **Excepción decidida y consultada: la firma de correo** (`pie-correo`, con el buzón y el reto).
  No es un envío, es un pie que va en lo que ya se escribe, así que no ocupa el tiempo de nadie ni
  se lee como comunicado. Lleva `29-S` impreso, o sea que **es propaganda y hay que quitarla el
  domingo 27 por la noche**: el lunes 28 no puede circular (art. 8.4, apartado 10).
- **Cada envío lleva una línea escrita a mano por quien lo manda**, no el texto del cartel
  copiado.

---

## 6. Lo que no vamos a hacer

- No prometer subidas de sueldo ni nada que dependa del convenio.
- No atacar a otras candidaturas. Nuestro argumento se sostiene sin eso.
- **No atacar a la empresa, y menos a responsables concretos.** Ni «depende de cómo le pille el
  día a tu responsable», ni «casi nunca se hace bien», ni poner en su boca un «cuando haya
  presupuesto». Hoy hay flexibilidad y funciona: lo que pedimos es que esté escrita, porque lo
  escrito no cambia con las personas. El agravio nos quita la razón y encima es falso; el
  procedimiento se sostiene solo.
- No usar el correo de empresa, ni las listas, ni el horario de nadie para repartir material.
- No pedirle a nadie que diga a quién vota, ni preguntarlo, ni insinuarlo.
- No publicar nada del buzón que permita identificar a quien lo escribió, ni aunque sea
  gracioso.
- No usar el logotipo de Nazaríes como si la empresa respaldara la lista: solo como el sitio
  donde son las elecciones, igual que en el A3.

---

## 7. Cómo sabemos si va bien

| Señal | Objetivo antes del 29 |
|---|---|
| Respuestas en el buzón | ≥ 25 (basta para que `voces-del-buzon` tenga contenido real) |
| Temas distintos en el buzón | ≥ 6 (si sale uno solo, el programa se reordena) |
| Partidas jugadas en el reto | ≥ 30 (se lee en `/api/ranking`, campo `jugadas`) |
| Gente que pregunta a alguien de la lista sin que la abordemos | ≥ 15 |
| Participación el 29-S | por encima de la de las elecciones anteriores |

La respuesta del buzón es la única métrica que se puede leer en tiempo real y la única que
cambia el material: si el día 12 la conciliación se lleva la mitad de las respuestas, el cartel
06 abre con eso y el 07 lo pone primero en el tablero.

**Lo que hay a 8 de septiembre: once respuestas en cuatro días.** Cinco hablan de dinero —IPC y
pérdida de poder adquisitivo, y dos de ellas de que los trienios se absorben con el complemento
de empresa—, tres de jornada de verano y calor por las tardes, y las otras tres de carga de
trabajo, de preguntar al equipo al cerrar un proyecto y de herramientas. Van seis temas
distintos, que era el objetivo, y el ritmo llega a las 25 si no se para.

Eso ha cambiado dos cosas del plan. Una: **el tema más pedido es justo el que un comité no puede
decretar**, y de ahí sale la pieza del día 10. Dos: `conciliacion` pasa de tres acciones a cuatro
y entra la **jornada intensiva en julio, no solo en agosto**, que es lo más pedido del buzón en
horarios y no estaba.

**Y esa petición, tal y como estaba escrita, costaba un día de vacaciones.** El **art. 21.1 del
convenio** da 23 días laborables, pero baja a **22** a las empresas «que disfruten de **dos o más
meses de jornada intensiva**». Julio más agosto son dos meses. Era la petición estrella de la
campaña, iba en cuatro carteles, y si la detecta antes el asesor de la otra lista nos deja sin lo
único que tenemos.

Corregido en los cuatro: ahora se pide **con la cláusula delante** —«julio, y los 23 días
intactos»— y eso convierte el problema en la mejor prueba de la serie de que nos hemos leído el
convenio. **Falta comprobar** si la empresa ya concede dos o más días no laborables adicionales,
porque en ese caso ya se está en 22 y el argumento cambia otra vez.

La cuarta acción se apoya en que la intensiva **no es reducir jornada, es redistribuirla**: son
las mismas horas del año movidas, y esa distribución se pacta entre la empresa y la representación
(art. 34.2 ET), con el calendario laboral anual como sitio donde ponerlo (art. 34.6 ET). Por eso
se puede pedir sin prometer nada que cueste dinero, y por eso no se mezcla con «jornada más
corta», que sí es convenio.

Y tres: `propuestas` cierra con **una línea por cada tema que ha llegado y no es de dinero**, con
lo que se puede hacer con él —qué se pide, con qué artículo, o que no es materia de comité y aun
así se traslada—. **Ninguna respuesta remite a otro cartel ni a otra acción**: cada línea dice el
acto concreto y su artículo, porque «acción 04 de conciliación» obliga a buscar y se lee como un
índice, no como un compromiso. Son cinco líneas en tipografía pequeña y no son la propuesta: son
la prueba de que no se ha tirado nada. Quien escribió del calor, del cliente que marca el día a
día o de las herramientas se tiene que reconocer en el cartel, o el buzón deja de recibir
respuestas.

Ojo con las etiquetas: *ya está pedido* es del cartel del día 22 y significa pedido **a la
empresa**. Todavía no hay comité, así que aquí no se usa: se dice en qué cartel está la acción.

**Y esta regla estuvo mal escrita unas horas, así que queda el aviso.** El 9 de septiembre se
redactó la propuesta de la jaula de bicis y se dio por hecho que estaba enviada, con lo que
`bici-y-patinete` llegó a decir «ya pedida, el 9 de septiembre» y esta regla se reescribió para
darle cabida. **No estaba enviada, y el proceso real va después del 29.** Las dos cosas se
deshicieron.

La regla no era «no hay comité»: era **«no digas pedido si no lo has pedido»**, y esa manda
siempre. Cualquier línea que afirme un hecho nuestro —y no una norma— es la única de la serie que
se puede desmentir con un «a mí no me ha llegado nada». Con plazo sí; en pasado, solo con el correo
enviado y la fecha delante.

La tira son dos columnas con cabecera —*lo demás que nos habéis pedido* / *y qué vamos a hacer*—,
la izquierda en tipografía de texto y la derecha en mono cian, las dos alineadas a la misma
izquierda. La primera versión iba todo en mono, con la respuesta pegada al margen derecho y sin
cabeceras: se leía como una tabla sin encabezados y había que adivinar qué era cada lado.

Y la tira cierra con **«el buzón sigue abierto, y seguirá abierto después del 29»**, en tipografía
de cuerpo y no en mono pequeño. Sin esa línea, cinco temas resueltos en letra chica con la
respuesta a la derecha se leen como un cajón donde va lo que no interesa; con ella, se leen como
un acuse de recibo de algo que sigue en marcha. Es la diferencia entre cerrar la conversación y
mantenerla abierta, que es de lo que vive el buzón.

---

## 8. Base legal de las propuestas

Los carteles citan el artículo de cada acción. No es adorno: es lo que separa *«pediremos más
flexibilidad»* de *«pediremos el protocolo escrito que el art. 34.8 ET permite negociar»*. La
lista completa, para que cualquiera de los once la pueda defender si le preguntan:

| Acción | Base |
|---|---|
| Protocolo escrito de flexibilidad y trabajo a distancia | art. 34.8 ET (adaptación de jornada) |
| Registro de jornada y resumen de horas | art. 34.9 ET (a disposición de la representación legal) |
| Política escrita de desconexión digital | art. 20 bis ET · art. 88 LOPDGDD (se elabora oída la representación) |
| Evaluación de riesgos psicosociales con método validado | art. 16 LPRL · RD 39/1997 (métodos FPSICO del INSST, CoPsoQ-istas21) |
| Revisión de los puestos con pantalla | RD 488/1997 (PVD) · RD 486/1997 (lugares de trabajo) |
| Informe previo del comité antes de aplicar cambios | art. 64.5 ET |
| Información periódica de plantilla, contratos y siniestralidad | art. 64 ET |
| Tablón de anuncios de la representación | art. 81 ET |
| Acceso al registro retributivo y a la auditoría retributiva | art. 28.2 ET · RD 902/2020 |
| Acuerdo escrito de trabajo a distancia, con gastos compensados | Ley 10/2021, arts. 7, 11 y 12 |
| Copia al comité de todos los acuerdos de trabajo a distancia | Ley 10/2021, art. 6.2 (diez días) |
| Convocar asamblea de plantilla | arts. 77–80 ET |
| Sigilo sobre la información confidencial | art. 65.2 ET |
| Duración del mandato: cuatro años | art. 67.3 ET |
| Permiso retribuido de 20 horas anuales de formación | art. 23.3 ET |
| Pedir la apertura de una negociación de empresa | art. 87.1 ET (el comité está legitimado para negociar) |
| Plan de movilidad sostenible al trabajo, negociado con el comité | art. 26 Ley 9/2025 · art. 2.1.s) (se elabora en el marco de la negociación colectiva) |
| Umbral y plazo del plan de movilidad | art. 26 Ley 9/2025: más de 200 personas por centro o 100 por turno · **RDL 7/2026** baja el plazo a 12 meses (5-12-2026) |
| Abono de transporte público exento de IRPF | art. 46 bis RIRPF: 1.500 €/año, 136,36 €/mes en tarjeta. En metálico, no exento |
| Qué materias desplaza un convenio de empresa al del sector | art. 84.2 ET (**sin la letra a): el RDL 32/2021 le quitó el salario**) |
| Jornada intensiva: el convenio solo la da en agosto | art. 20.2 del XIX Convenio de consultoría y TIC (36 h/semana) |
| **El teletrabajo sí se retribuye**: 18,21 €/mes en 2026, extrasalarial y **no absorbible** | **art. 41** del XIX Convenio (17,68 € desde la firma; 18,76 € en 2027; proporcional si no es jornada completa; solo trabajo a distancia regular, art. 1 Ley 10/2021) |
| **Dos meses de jornada intensiva bajan las vacaciones de 23 a 22 días** | art. 21.1 del XIX Convenio |
| Bolsa de 218,10 € para formación, **no automática** | art. 14 del XIX Convenio (la reconoce la empresa «en función del aprovechamiento anterior y del interés de los estudios») |
| El convenio del sector agota su vigencia el 31-12-2027 | art. 4 del XIX Convenio |
| Revisión por IPC en 2028, con tope del 2 % | art. 27 del XIX Convenio |
| Comprobar la absorción de los trienios | art. 26.5 ET (compensación y absorción) |
| Vigilar el cumplimiento y reclamar si no se cumple | art. 64.7.a ET (vigilancia y acciones legales) |

---

## 9. Lo que hay que cerrar antes de enviar

Cosas que no dependen del diseño y que hay que confirmar entre los once:

1. **Desplegar `buzon.html`.** El QR de `buzon` apunta a `https://sin-siglas.info/buzon` y
   está verificado leyéndolo del PNG final, pero esa ruta devuelve 404 hasta que la página esté
   subida. **`buzon` no se puede enviar antes de desplegarla**: un QR que no lleva a ningún
   sitio se lo carga.
2. **La hora de comité de `donde-encontrarnos`.** Está propuesta como *primer jueves de mes, 13:30–14:30,
   en la cocina*. Hay que confirmar día y sitio, o cambiarlo antes de enviarlo.
3. **`voces-del-buzon`.** Es una plantilla: las citas se rellenan el día 22 con lo que haya llegado al
   buzón. No se puede enviar antes.
4. **Horario y lugar de la urna** para `ultima-llamada`: los publica la mesa electoral, no nosotros.
5. **Qué es el premio del reto y cuándo se cierra el sorteo.** El cartel y la web dicen «pequeño»
   y «cuando cerremos el juego», que es honesto pero no mueve a nadie a jugar hoy. En cuanto haya
   objeto y fecha, se pone en la web y se puede mandar como recordatorio.

---

## 10. Hasta cuándo se puede hacer campaña

**Art. 8.4 del RD 1844/1994**, literal:

> Proclamados los candidatos definitivamente, los promotores de las elecciones, los
> presentadores de candidatos y los propios candidatos podrán efectuar **desde el mismo día de
> tal proclamación, hasta las cero horas del día anterior al señalado para la votación**, la
> propaganda electoral que consideren oportuna, **siempre y cuando no se altere la prestación
> normal del trabajo**. Esta limitación no se aplicará a las empresas que tengan hasta 30
> trabajadores.

Tres consecuencias para este plan:

1. **La ventana se abre el día de la proclamación definitiva, no antes.** Hay que mirar el acta
   de la mesa y confirmar la fecha: cualquier pieza enviada antes de ese día queda fuera de la
   ventana del artículo.
2. **La ventana se cierra a las cero horas del lunes 28**, o sea al acabar el domingo 27. El
   lunes 28 es día sin propaganda. Por eso el último cartel es el del viernes 25 y por eso dice
   «el martes se vota» y no «mañana».
3. **«Sin alterar la prestación normal del trabajo»** es la otra mitad del artículo, y es la que
   sostiene lo que ya decíamos: nada de correo corporativo, nada de listas de la empresa, nada de
   pararle la mañana a nadie. Se manda por el canal donde ya se habla y se lee cuando se pueda.

La excepción de las empresas de hasta 30 trabajadores no nos aplica: hay comité de empresa, y el
comité solo existe desde 50 personas.

El Estatuto, por su parte, solo fija el plazo mínimo del proceso: **«entre la proclamación de
candidatos y la votación mediarán al menos cinco días»** (art. 74.3 ET). No regula la campaña ni
menciona jornada de reflexión; eso está solo en el reglamento.

**Confirmadlo con la mesa electoral de todos modos.** Es quien publica el calendario y quien fija
la fecha y hora de la votación, y el cómputo del cierre depende de esa fecha.

---

## Anexo · el buzón, en concreto

`buzon.html` es una página del propio sitio con un formulario de **Netlify Forms**: basta el
atributo `data-netlify="true"` para que Netlify recoja los envíos en su panel sin backend
ninguno. No pide nombre, ni área, ni correo.

Un detalle técnico, por si alguien lo pregunta: Netlify guarda la IP de quien envía en cada
respuesta y no se puede desactivar. En la práctica no identifica a nadie —en la oficina toda la
plantilla sale por la misma IP pública, y desde casa haría falta pedir los datos al operador con
una orden judicial—. Lo único que permite es ver que dos respuestas vienen del mismo sitio, lo
que solo importaría si alguien envía desde casa y en una de ellas se delata por el contenido.

Aun así una IP es dato personal, así que: quien tenga acceso al panel no se dedica a mirarlas, y
lo de `voces-del-buzon` sigue en pie —no se publica nada que permita atar una respuesta a una persona.

Para que funcione:

1. Subir `buzon.html` con el resto del sitio. Netlify detecta el formulario al desplegar.
2. En el panel de Netlify, **Forms**, aparece `buzon` con las respuestas.
3. Activar el aviso por correo a una sola persona de la lista, para no tener que entrar a mirar.

Límite del plan gratuito: 100 respuestas al mes. De sobra para tres semanas.

Comprobado el 3 de septiembre: `sin-siglas.info` ya resuelve y sirve la web desde Netlify, y
`/buzon` responde 404 solo porque la página todavía no está subida.

Si preferís no usar Netlify, sirve igual un formulario anónimo de Google o de Microsoft: solo
hay que cambiar `URL` en `qr.py`, regenerar el QR y reexportar `buzon`.
