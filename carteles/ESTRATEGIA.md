# Estrategia de campaña · Sin siglas, solo compañerxs

Elecciones al Comité de Empresa de Nazaríes · **martes 29 de septiembre de 2026**
Documento escrito el 3 de septiembre. Quedan 26 días.

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
| Temas | Tres acciones concretas por compromiso | `conciliacion`, `ambiente`, `comunicacion` |
| Prueba | Que somos comprobables y honestos | `buzon`, `lo-que-no-podemos`, `voces-del-buzon`, `semaforo` |
| Conversión | Cómo, cuándo y por qué votar | `donde-encontrarnos`, `por-que-votar`, `vispera` |

Los carteles nuevos son **1080 × 1350 px, tema claro**, pensados para enviar por el canal
donde ya se habla. **Ninguno lleva número de orden**: en la esquina va la fecha, `29-S`, que es
lo único que no cambia y lo que se ve en la miniatura del móvil antes de leer nada. Así se pueden
reordenar, quitar o añadir piezas sin que las ya enviadas queden mal. Los números del `?n=` del
fuente son identificadores para poder capturarlos, no el orden de envío.

---

## 4. Los tres golpes de efecto

### 4.1 El buzón anónimo → «Nos lo dijisteis vosotros»

**`buzon` (4 de septiembre).** Abrimos la campaña *preguntando*, no prometiendo. QR a un
formulario anónimo: sin nombre, sin área, sin correo. Una sola pregunta: qué cambiarías de tu
día a día.

**`voces-del-buzon` (18 de septiembre).** El pago: las respuestas más repetidas, sin retocar, cada una
con su etiqueta —*ya está pedido* / *va al programa* / *no podemos, y te decimos por qué*.

Por qué funciona: la campaña deja de ser un monólogo, el material se lo escribe la plantilla, y
el día 18 tenemos algo que ninguna otra lista puede tener. Coste: cero.

Implementación real: `buzon.html` con formulario de Netlify —el sitio ya está en Netlify—, así
que se recogen las respuestas sin backend ni servicio de terceros. Detalles al final.

### 4.2 El semáforo del mandato

**`semaforo` (22 de septiembre).** Un cartel-contrato con las once firmas y el tablero que
publicaremos cada trimestre durante los cuatro años: cada acción de los tres carteles de tema en
**conseguido / en negociación / se cayó / todavía por pedir**.

El cartel muestra el tablero **con todo en gris**, tal y como está el día 22: nada pedido
todavía. Convierte *«os iremos contando»* en un objeto que se puede comparar con el de enero.

### 4.3 Compi

La mascota ya existe, ya cae bien y es lo que hace que una pieza se reenvíe. Aparece en todos
los carteles con una pose y una frase distintas, y hace de firma reconocible sin necesidad de
logotipo. Es la parte barata y la que más va a circular.

**Las hojas de pegatinas** son la extensión física de esto. Dos A4 para papel adhesivo de
impresora, catorce pegatinas cada uno, que se cortan con tijeras por la línea de puntos:

- `pegatinas.html` — con Compi: seis anchas con frase y ocho cuadradas.
- `pegatinas-frases.html` — solo tipografía, para quien no quiere un muñeco en el portátil: dos
  bandas de ancho completo, cuatro medianas con los titulares de los carteles y ocho cuadradas
  cortas (`Vota`, `29-S`, `Pregúntame`, `Once. Cero siglas.`).

Coste: dos folios adhesivos. Se reparten a mano y en la hora de comité, nunca dejándolas por las
mesas de nadie.

    ./carteles/exportar.sh pegatinas

---

## 5. Calendario

| Día | Pieza | Rol | Quién la manda |
|---|---|---|---|
| vie 4 sep | **Primero tú** · el buzón + QR | Apertura: pedimos antes de prometer | Rocío Galindo |
| mar 8 sep | **La conciliación no es un favor** | Tema | Leticia Algarra |
| vie 11 sep | **Se puede medir** · ambiente y salud | Tema | Raúl Navarro |
| mar 15 sep | **Que te lo cuenten antes** · comunicación | Tema | José Pablo Fernández |
| jue 17 sep | **Lo que un comité no te va a conseguir** | Diferenciación por honestidad | Mario Barchéin |
| vie 18 sep | **Esto no lo decimos nosotros** · buzón | Pago del golpe 1 | Rocío Galindo |
| mar 22 sep | **El semáforo del mandato** | Golpe 2 · lo firman los once | Rafael López |
| jue 24 sep | **No hace falta que pidas cita** | Movilización | María Emilia Castillo |
| vie 25 sep | **La próxima vez, en 2030** · por qué votar | Llamada al voto, sin pedirlo para nosotros | Fran Bolívar |
| lun 28 sep | **Mañana** | Conversión · cómo y dónde se vota | Violeta López |

Diez piezas en 26 días: **dos por semana**, y tres en la última, que es cuando hay que apretar.
Más de eso satura y la gente deja de abrirlas.

### Reglas de envío

- **Dos por semana, martes y viernes.** Nada un lunes a primera hora ni un viernes a última.
- **Lo manda una persona distinta cada vez**, y del área que le toca al tema: la conciliación
  la envía quien la vive, los espacios quien está en Seguridad y Salud. Un cartel reenviado por
  once personas a la vez parece publicidad; reenviado por una, parece una conversación.
- **Nunca por correo corporativo ni por listas de la empresa.** Se lee como comunicación de
  dirección y nos quita lo único que tenemos, que es no ser eso.
- **Cada envío lleva una línea escrita a mano por quien lo manda**, no el texto del cartel
  copiado.

---

## 6. Lo que no vamos a hacer

- No prometer subidas de sueldo ni nada que dependa del convenio.
- No atacar a otras candidaturas. Nuestro argumento se sostiene sin eso.
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
| Gente que pregunta a alguien de la lista sin que la abordemos | ≥ 15 |
| Participación el 29-S | por encima de la de las elecciones anteriores |

La respuesta del buzón es la única métrica que se puede leer en tiempo real y la única que
cambia el material: si el día 12 la conciliación se lleva la mitad de las respuestas, el cartel
06 abre con eso y el 07 lo pone primero en el tablero.

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
| Convocar asamblea de plantilla | arts. 77–80 ET |
| Sigilo sobre la información confidencial | art. 65.2 ET |
| Duración del mandato: cuatro años | art. 67.3 ET |
| Permiso de 20 horas anuales de formación | art. 23 ET |

---

## 9. Lo que hay que cerrar antes de enviar

Cosas que no dependen del diseño y que hay que confirmar entre los once:

1. **Desplegar `buzon.html`.** El QR de `buzon` apunta a `https://sin-siglas.info/buzon` y
   está verificado leyéndolo del PNG final, pero esa ruta devuelve 404 hasta que la página esté
   subida. **`buzon` no se puede enviar antes de desplegarla**: un QR que no lleva a ningún
   sitio se lo carga.
2. **La hora de comité de `donde-encontrarnos`.** Está propuesta como *primer jueves de mes, 13:30–14:30,
   en la cocina*. Hay que confirmar día y sitio, o cambiarlo antes de enviarlo.
3. **`voces-del-buzon`.** Es una plantilla: las citas se rellenan el día 18 con lo que haya llegado al
   buzón. No se puede enviar antes.
4. **Horario y lugar de la urna** para `vispera`: los publica la mesa electoral, no nosotros.

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
