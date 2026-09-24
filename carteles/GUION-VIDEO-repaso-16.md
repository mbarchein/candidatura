# Vídeo repaso · las siete propuestas que llevamos lanzadas

Se manda por el canal de siempre, en vertical, **1080 × 1620** y alrededor de **90 segundos**.
Siete propuestas, siete voces distintas, y cada una la cuenta quien la lleva.

**Por qué con voz y no un montaje.** El 16 nos llegó un aviso de un compañero: *«dejad de usar la
IA y usad un tono más cercano, porque cuesta entender los mensajes»*. Un carrusel de siete
carteles con música es más producido, no menos, y confirmaría justo eso. Siete personas de la
casa contando lo suyo en diez segundos no se puede confundir con una máquina, y es literalmente
lo que dice el lema: sin siglas, solo compañerxs.

**Lo que no sale en el vídeo, y es a propósito.** Faltan tres propuestas por mandar —`igualdad`,
`parking` y `jornada-4-dias`—, así que **no se nombran**. El cierre las anuncia sin contarlas, y
el resumen completo sigue siendo `las-diez` el día 25.

---

## Cómo se graba

Un audio por persona, y ya está. **Con el móvil, nota de voz del chat, vale perfectamente**: se
monta igual y suena a lo que es.

1. **En una habitación con puerta**, sentado, y el móvil a un palmo de la barbilla. Nada de
   manos libres ni coche.
2. **No lo leas: cuéntalo.** El texto de abajo es lo que hay que decir, no cómo hay que decirlo.
   Cambia las palabras que no sean tuyas —si tú no dices «pedimos», di «vamos a pedir»—. Si te
   sale mejor con tus palabras, mejor que el guion.
3. **Espera un segundo antes de empezar y otro al acabar.** Es lo único técnico que pedimos.
4. **Repítelo dos o tres veces y manda el que menos vergüenza te dé.** No hace falta que salga
   perfecto; de hecho, perfecto es el problema.
5. Los tropiezos pequeños se quedan. Un «eh» no se corta.

El audio se guarda en `carteles/voz/` con el nombre de su pieza —`carteles/voz/cumpleanos.m4a`,
`carteles/voz/dietas.opus`—. Da igual el formato.

---

## El guion

Entre paréntesis, lo que debería durar. Si te sale en once segundos no pasa nada; si te sale en
veinte, sobra media frase.

## 0 · intro · Mario Aranda

> Somos once compañeros y compañeras de la casa presentándonos al comité. Estas son las siete propuestas que
> llevamos mandadas, contadas por quien lleva cada una.

(7 s · sobre la portada, sin cartel)

## 1 · cumpleanos · M.ª Emilia Castillo

> Un día libre por tu cumpleaños. Y dos líneas que casi nunca vienen: si cae en fin de semana, lo
> mueves. Si cae dentro de tus vacaciones, también. Sin esas dos líneas, a un tercio de la
> plantilla no le sirve de nada.

(12 s)

## 2 · medico · Violeta López

> Si vas al médico por lo público, esa hora está cubierta. Si vas por lo privado, porque te dan
> cita antes, esa misma hora la pones tú. No pedimos una hora más: pedimos que dé igual por dónde
> entres.

(12 s)

## 3 · cuidado-hijos · José Pablo Fernández

> En esta no pedimos nada, porque ya la tienes. Si tienes un hijo menor de ocho años, tienes ocho
> semanas sin sueldo y dos pagadas. Son dos permisos distintos y se piden en sitios distintos.
> Míralo, que casi nadie sabe que existe.

(13 s)

## 4 · verano-intensiva · Leticia Algarra

> En julio también hace cuarenta grados. El convenio da intensiva solo en agosto y nosotros
> pedimos los dos meses. Son las mismas horas del año, movidas de sitio: no se trabaja menos, se
> trabaja cuando se puede.

(12 s)

## 5 · dietas · Laura Muñoz

> Cuando viajas por trabajo, el tren, el vuelo y el hotel ya los paga la empresa. Lo que sigues
> poniendo tú es la comida, moverte por la ciudad y lo que salga sin avisar. Pedimos que en los
> viajes a cliente eso tampoco lo adelantes tú.

(13 s)

## 6 · bici-y-patinete · Rafael López

> Si vienes en bici o en patinete, no tienes dónde dejarlo. No hay plaza marcada ni sitio cerrado,
> y con lo que cuestan, nadie se arriesga a dejarlo suelto. Pedimos un aparcamiento cerrado. Es de
> lo más barato que hay y se nota el primer día.

(13 s)

## 7 · ambiente · Raúl Navarro

> Comer delante del portátil no es una pausa. Pedimos dos sitios distintos: uno para comer y otro
> para no hacer nada. Ahora nos vemos de pasillo, y media hora sentados juntos arregla más cosas
> de las que parece.

(12 s)

## 8 · cierre · Rocío Galindo

> Quedan tres propuestas por salir estos días. Y el 29 se vota.

(6 s · sobre la despedida, sin cartel)

---

## Cómo se monta

Cuando estén los audios en `carteles/voz/`:

    python3 carteles/video.py            # monta lo que haya y avisa de lo que falte
    python3 carteles/video.py --faltan   # solo la lista de lo que falta

Sale en `carteles/video/repaso-propuestas.mp4`. El guion de arriba es la única fuente: de aquí
salen el orden, quién habla, qué cartel va detrás y los subtítulos. Si cambias una frase aquí,
cambia en el vídeo.

**Los subtítulos van siempre**, y no es un extra de accesibilidad que quede bien decir: esto se
ve en un chat, en silencio y de pie. Por eso el vídeo es de 1080 × 1620 y no de 1080 × 1350: el
cartel se queda entero arriba y abajo hay una banda propia para el texto y el nombre de quien
habla. Tapar el pie del cartel con un subtítulo habría escondido justo las caras.
