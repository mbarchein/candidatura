/* Marcador compartido del reto.
 *
 *   GET  /api/ranking  ->  todas las marcas, ordenadas
 *   POST /api/ranking  ->  guarda una marca si supera la anterior de ese alias
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

const CLAVE = 'marcas';          // un solo blob con todas las marcas
const MAX_ALIAS = 24;

/* Las reglas del juego, tal como están en index.html. Si allí cambian,
   aquí también: son el techo con el que se valida. */
const PREGUNTAS = 12;
const BASE = 100, BONUS = 50, RACHA_TOPE = 100;
const POR_ACIERTO = BASE + BONUS + RACHA_TOPE;   // 250
/* Cada pregunta obliga a esperar el rótulo de acierto o fallo, así que
   una partida entera no puede durar menos de esto ni jugándola perfecta. */
const MS_MINIMOS = 12000;

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

/* Devuelve el error si la marca no se sostiene, o null si pasa. */
function revisa(m) {
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

export default async function (peticion) {
  const almacen = getStore({ name: 'reto', consistency: 'strong' });

  if (peticion.method === 'GET') {
    const marcas = (await almacen.get(CLAVE, { type: 'json' })) || {};
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

  const fallo = revisa(cuerpo);
  if (fallo) return json({ error: fallo }, 422);

  const puntos = Number(cuerpo.puntos);
  const marcas = (await almacen.get(CLAVE, { type: 'json' })) || {};

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
    await almacen.setJSON(CLAVE, marcas);
    return json({ guardada: false, renombrada: true, anterior: previa.puntos, top: mejores(marcas) });
  }

  marcas[id] = {
    alias,
    puntos,
    aciertos: Number(cuerpo.aciertos),
    racha: Number(cuerpo.racha),
    total: Number(cuerpo.total),
    ts: Date.now(),
  };
  await almacen.setJSON(CLAVE, marcas);

  return json({ guardada: true, top: mejores(marcas), jugadas: Object.keys(marcas).length });
}
