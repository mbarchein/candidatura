/* Marcadores compartidos: el del reto y el de la carrera.
 *
 *   GET  /api/ranking               ->  todas las marcas del reto, ordenadas
 *   POST /api/ranking               ->  guarda una marca si supera la anterior de ese alias
 *   GET  /api/ranking?juego=carrera ->  lo mismo, con el tablero del minijuego
 *   POST /api/ranking?juego=carrera
 *
 * Sin parámetro es el reto, como siempre, así que index.html no cambia.
 * Cada juego tiene su tablero aparte: sus puntos no se parecen en nada y
 * un alias cogido en uno no bloquea el otro. El redirect de netlify.toml
 * no se toca: una reescritura con 200 pasa la query tal cual a la función.
 *
 * Se guarda en Netlify Blobs, que en el plan gratuito va incluido. Los
 * datos viven en la cuenta de Netlify y no salen a ningún tercero.
 *
 * Sobre las trampas: esto es una página estática, así que todo el código
 * del juego corre en el navegador de quien juega y no hay forma de saber
 * si los puntos que llegan son de verdad. Las comprobaciones de abajo
 * paran a quien tira un curl con un número gordo, no a quien se lee el
 * código y manda valores creíbles. Por eso el premio se sortea entre
 * quienes jueguen y no se da al primero del marcador: quitado el
 * incentivo, no hay nada que blindar.
 */

import { getStore } from '@netlify/blobs';

const MAX_ALIAS = 24;

/* Las reglas del reto, tal como están en index.html. Si allí cambian,
   aquí también: son el techo con el que se valida. */
const PREGUNTAS = 12;
const BASE = 100, BONUS = 50, RACHA_TOPE = 100;
const POR_ACIERTO = BASE + BONUS + RACHA_TOPE;   // 250
/* Cada pregunta obliga a esperar el rótulo de acierto o fallo, así que
   una partida entera no puede durar menos de esto ni jugándola perfecta. */
const MS_MINIMOS = 12000;

/* Las reglas de la carrera, tal como están en juego.html. Igual que con
   el reto: si allí cambian, aquí también. */
const VOTO = 25;              // puntos por papeleta recogida
const VEL_MAX = 32;           // metros por segundo: el techo de velocidad del juego
const SEP_VOTO = 6;           // metros mínimos entre dos papeletas seguidas
const EXTRA = 100;            // puntos por churros o mollete
const SEP_EXTRA = 50;         // metros mínimos entre dos de esos
/* Una partida más corta que esto no se da por jugada. Tiene que ser el
   mismo mínimo que en juego.html, o el juego mandaría marcas que aquí
   se rechazan. */
const MS_MINIMOS_CARRERA = 2000;

const ID_VALIDO = /^[a-z0-9-]{8,48}$/;

const slug = a => a.toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '').slice(0, 40);

const json = (cuerpo, estado = 200) => new Response(JSON.stringify(cuerpo), {
  status: estado,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

/* Las marcas se guardan por id de navegador, no por alias: una persona
   metiendo veinte alias distintos sería una fila renombrada y no veinte.
   El slug que sale es el del alias, que es lo que el cliente usa para
   marcar cuál es la tuya en el tablero. */
const mejores = marcas => Object.entries(marcas)
  .map(([id, m]) => ({ slug: slug(m.alias) || id, alias: m.alias, puntos: m.puntos, ts: m.ts }))
  .sort((a, b) => b.puntos - a.puntos || a.ts - b.ts);
/* Se devuelve la lista entera y pagina el cliente. Con ciento y pico
   marcas son unos pocos kilobytes, y así quien va en el puesto 47 puede
   saltar a su página sin que el servidor tenga que decirle dónde está. */

/* Devuelven el error si la marca no se sostiene, o null si pasa. */
function revisaReto(m) {
  const total = Number(m.total);
  if (!Number.isInteger(total) || total < 1 || total > PREGUNTAS) return 'total fuera de rango';

  const puntos = Number(m.puntos), aciertos = Number(m.aciertos), racha = Number(m.racha);
  if (!Number.isInteger(puntos) || puntos < 0) return 'puntos no válidos';
  if (!Number.isInteger(aciertos) || aciertos < 0 || aciertos > total) return 'aciertos fuera de rango';
  if (!Number.isInteger(racha) || racha < 0 || racha > aciertos) return 'racha fuera de rango';

  /* un fallo no da puntos, así que todo lo que se suma sale de los aciertos */
  if (puntos > aciertos * POR_ACIERTO) return 'los puntos no cuadran con los aciertos';
  if (aciertos === 0 && puntos > 0) return 'puntos sin aciertos';

  const ms = Number(m.ms);
  if (!Number.isFinite(ms) || ms < MS_MINIMOS) return 'la partida ha durado demasiado poco';

  return null;
}

function revisaCarrera(m) {
  const votos = Number(m.votos), metros = Number(m.metros), extras = Number(m.extras ?? 0);
  if (!Number.isInteger(votos) || votos < 0) return 'votos no válidos';
  if (!Number.isInteger(extras) || extras < 0) return 'extras no válidos';
  if (!Number.isInteger(metros) || metros < 0) return 'metros no válidos';

  const ms = Number(m.ms);
  if (!Number.isFinite(ms) || ms < MS_MINIMOS_CARRERA) return 'la partida ha durado demasiado poco';

  /* ni a toda velocidad desde el primer segundo se llega más lejos */
  if (metros > ms / 1000 * VEL_MAX) return 'demasiados metros para lo que ha durado';
  /* las papeletas salen separadas, así que en tantos metros caben tantas
     como mucho; el +1 es la primera, que no necesita hueco delante */
  if (votos > Math.floor(metros / SEP_VOTO) + 1) return 'demasiados votos para esos metros';
  /* los churros y el mollete, igual pero mucho más espaciados */
  if (extras > Math.floor(metros / SEP_EXTRA) + 1) return 'demasiados extras para esos metros';

  /* sin rachas ni multiplicadores: los puntos salen exactos o no salen */
  if (Number(m.puntos) !== metros + votos * VOTO + extras * EXTRA) return 'los puntos no cuadran con metros, votos y extras';

  return null;
}

/* Un tablero por juego. La clave del reto sigue siendo 'marcas' para no
   perder lo que ya hay guardado; guarda() dice qué campos del cuerpo,
   aparte de alias, puntos y ts, merecen quedarse en la marca. */
const JUEGOS = {
  reto: {
    clave: 'marcas',
    revisa: revisaReto,
    guarda: c => ({ aciertos: Number(c.aciertos), racha: Number(c.racha), total: Number(c.total) }),
  },
  carrera: {
    clave: 'carrera',
    revisa: revisaCarrera,
    guarda: c => ({ votos: Number(c.votos), metros: Number(c.metros), extras: Number(c.extras ?? 0) }),
  },
};

export default async function (peticion) {
  const nombre = new URL(peticion.url).searchParams.get('juego') || 'reto';
  /* hasOwn y no JUEGOS[nombre] a secas: si no, ?juego=toString colaría */
  if (!Object.hasOwn(JUEGOS, nombre)) return json({ error: 'juego desconocido' }, 400);
  const juego = JUEGOS[nombre];
  const clave = juego.clave;

  /* todos los tableros en el mismo store, cada uno en su blob */
  const almacen = getStore({ name: 'reto', consistency: 'strong' });

  if (peticion.method === 'GET') {
    const marcas = (await almacen.get(clave, { type: 'json' })) || {};
    return json({ top: mejores(marcas), jugadas: Object.keys(marcas).length });
  }

  if (peticion.method !== 'POST') return json({ error: 'método no admitido' }, 405);

  let cuerpo;
  try { cuerpo = await peticion.json(); }
  catch { return json({ error: 'cuerpo ilegible' }, 400); }

  const id = String(cuerpo.id ?? '').toLowerCase();
  if (!ID_VALIDO.test(id)) return json({ error: 'identificador no válido' }, 400);

  const alias = String(cuerpo.alias ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_ALIAS);
  if (alias.length < 2) return json({ error: 'alias demasiado corto' }, 400);
  if (!slug(alias)) return json({ error: 'alias sin caracteres utilizables' }, 400);

  const fallo = juego.revisa(cuerpo);
  if (fallo) return json({ error: fallo }, 422);

  const puntos = Number(cuerpo.puntos);
  const marcas = (await almacen.get(clave, { type: 'json' })) || {};

  /* dos personas con el mismo alias dejarían dos filas iguales y el
     tablero ilegible, así que el primero que lo coge se lo queda */
  const pillado = Object.entries(marcas)
    .find(([otro, m]) => otro !== id && slug(m.alias) === slug(alias));
  if (pillado) return json({ error: 'ese alias ya lo está usando otra persona' }, 409);

  const previa = marcas[id];

  /* si no mejora la marca pero cambia el alias, se renombra y se
     conservan los puntos: así se puede corregir sin jugar otra vez */
  if (previa && previa.puntos >= puntos) {
    if (previa.alias === alias) {
      return json({ guardada: false, anterior: previa.puntos, top: mejores(marcas) });
    }
    marcas[id] = { ...previa, alias };
    await almacen.setJSON(clave, marcas);
    return json({ guardada: false, renombrada: true, anterior: previa.puntos, top: mejores(marcas) });
  }

  marcas[id] = {
    alias,
    puntos,
    ...juego.guarda(cuerpo),
    ts: Date.now(),
  };
  await almacen.setJSON(clave, marcas);

  return json({ guardada: true, top: mejores(marcas), jugadas: Object.keys(marcas).length });
}
