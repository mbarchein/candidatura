/* ==================================================================
   PELI · los muñecos de píxeles, fotograma a fotograma
   ------------------------------------------------------------------
   Lo llama peli.py. Lee por stdin una lista de peticiones

       [{ "quien":"compi", "pose":"anda", "tt":1240, "izq":false, "boca":1 }, ...]

   y devuelve por stdout, una por línea, la rejilla de 27 x 36 de cada una
   como 972 colores "#rrggbb" o "" separados por comas.

   Compi es el de compi.js sin tocar: se carga el fichero entero en un
   contexto de vm y se usan sus piezas. Los once son Compi con otra
   paleta y encima su pelo, su barba y sus gafas, sacados de las fotos
   de a3-candidatura/img. No son retratos: son lo justo para que en el
   chat se diga «esa es Rocío» por el pelo, que a 27 píxeles de ancho es
   lo único que se reconoce.

   `boca` es el habla: 1 abre la boca, 0 la cierra. peli.py la saca del
   volumen de la voz en cada fotograma, así que se mueve cuando suena.
   ================================================================== */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ctx = {
  window: { matchMedia: () => ({ matches: false }) },
  matchMedia: () => ({ matches: false }),
  performance: { now: () => 0 },
  Math, console
};
vm.createContext(ctx);
const fuente = fs.readFileSync(path.join(__dirname, "compi.js"), "utf8");

/* lo que va detrás de compi.js se ejecuta en su mismo ámbito, que es la
   única forma de llegar a B, caja, cabeza y compañía, declaradas con
   const en el nivel de arriba del fichero */
const extra = String.raw`
CARAS.habla = (X,y,m) => { OJOS.abiertos(X,y,m); boca(X,y,"o"); rubor(X,y); };
/* la boca a medio abrir: la tercera de las tres del habla, entre la línea y la o */
CARAS.hablaMedia = (X,y,m) => { OJOS.abiertos(X,y,m); caja(X+4,y+11,3,1,"M"); px(X+5,y+12,"M"); rubor(X,y); };
CARAS.hablaFeliz = (X,y) => { OJOS.arcos(X,y); boca(X,y,"o"); rubor(X,y); };

/* explicar: de pie, una mano que acompaña lo que dice y la otra quieta */
POSES.explica = function(tt){
  const f = Math.floor(tt/420) % 4;
  const s = Math.sin(tt/900);
  return { fase:f, dy: s>0.7?-1:0, cara: s>0.96 ? "parpadeo" : "normal",
    bI:{ang:100,len:5}, bD:{ang:[40,20,55,30][f],len:5},
    pI:{ang:96,len:4}, pD:{ang:84,len:4} };
};
/* señalar el cartel: el brazo arriba y hacia fuera, como vota pero sin
   papeleta y con la mano abierta hacia donde está lo que cuenta */
POSES.senala = function(tt){
  const s = Math.sin(tt/900);
  return { fase:0, dy: s>0.6?-1:0, cara: s>0.95 ? "parpadeo" : "normal",
    bI:{ang:100,len:5}, bD:{ang:310,len:7},
    pI:{ang:96,len:4}, pD:{ang:84,len:4} };
};

/* ---------- los once: pelo, barba y gafas por encima de Compi ---------- */
function peloDetras(p, hy, dx){
  const X = CX - 5 + dx;
  if(p.melena){                        /* liso, cae por detrás de los hombros */
    const hasta = hy + p.melena;
    for(let y=hy+2; y<=hasta; y++){
      caja(X-1, y, 2, 1, "H"); caja(X+10, y, 2, 1, "H");
      if(y > hy+11){ caja(X+1, y, 9, 1, "h"); }     /* la espalda, detrás del tronco */
    }
  }
  if(p.rizos){                         /* volumen: bucles de dos filas, no pelo de punta */
    const hasta = hy + p.rizos;
    for(let y=hy-1; y<=hasta; y++){
      const r = y - hy;
      let a = ((r+8) % 4 < 2) ? 3 : 2;
      if(y === hasta) a = 1;
      caja(X-a, y, a, 1, "H"); caja(X+11, y, a, 1, "H");
      if(((r+8) % 4) === 1){ px(X-a+1, y, "h"); px(X+11+a-2, y, "h"); }
      if(y > hy+11) caja(X+1, y, 9, 1, "h");
    }
    caja(X+1, hy-3, 9, 1, "H");
    caja(X-1, hy-2, 13, 5, "H");
    px(X+2, hy-2, "h"); px(X+6, hy-2, "h"); px(X+9, hy-1, "h"); px(X+4, hy-1, "h");
  }
}
function peloDelante(p, hy, dx){
  const X = CX - 5 + dx;
  if(p.corto){       /* pelo corto pegado a la cabeza: el de Raúl. Sin el mechón de
                        Compi ni filas de más, que encima de la cabeza se leían como un moño */
    px(X+7, hy-1, null); px(X+8, hy-1, null); px(X+8, hy-2, null);
    px(X, hy+5, "S"); px(X+10, hy+5, "S");
  }
  if(p.moño){ caja(X+3, hy-4, 5, 3, "H"); caja(X+4, hy-5, 3, 1, "H"); px(X+4, hy-4, "h"); }
  if(p.entradas){ px(X+3, hy+1, "S"); px(X+7, hy+1, "S"); caja(X+4, hy+2, 3, 1, "S"); caja(X+2, hy+2, 7, 1, "S"); }
  if(p.flequillo){ caja(X, hy+5, 3, 1, "H"); caja(X+8, hy+5, 3, 1, "H"); px(X, hy+6, "H"); px(X+10, hy+6, "H"); }
  if(p.rizos){ px(X+1, hy+5, "H"); px(X+9, hy+5, "H"); px(X, hy+6, "H"); px(X+10, hy+6, "H"); }
  if(p.melena){ caja(X, hy+5, 1, 4, "H"); caja(X+10, hy+5, 1, 4, "H"); }
  const piel = (x,y) => { const k = B[y*REJ_W+x]; return k==="S" || k==="s"; };
  const barba = (x,y,k) => { if(x>=0 && y>=0 && x<REJ_W && y<REJ_H && (piel(x,y) || y>hy+12)) px(x,y,k); };
  if(p.barba === "larga"){
    for(let y=hy+9; y<=hy+19; y++){
      const w = y<=hy+12 ? 11 : Math.max(3, 11 - (y-hy-12)*1.2);
      const x0 = Math.round(X + (11-w)/2);
      for(let x=x0; x<x0+w; x++) if(!(y===hy+11 && x>=X+4 && x<=X+6)) barba(x, y, (x+y)%3 ? "Y" : "y");
    }
  } else if(p.barba === "poblada"){
    for(let y=hy+9; y<=hy+13; y++) for(let x=X; x<=X+10; x++){
      if(y===hy+11 && x>=X+3 && x<=X+7) continue;
      if(y===hy+13 && (x<X+2 || x>X+8)) continue;
      if(y===hy+9 && x>X+1 && x<X+9) continue;
      barba(x, y, (x+y)%4 ? "Y" : "y");
    }
  } else if(p.barba === "corta"){
    /* barba de pocos días por toda la mandíbula, con bigote: es lo que
       separa a Mario Aranda de Raúl, que va afeitado */
    for(let y=hy+8; y<=hy+10; y++){ barba(X, y, "Y"); barba(X+10, y, "Y"); }
    barba(X+1, hy+10, "y"); barba(X+9, hy+10, "y");
    caja(X+3, hy+10, 5, 1, "Y");
    for(let x=X+1; x<=X+9; x++) if(x < X+3 || x > X+7) barba(x, hy+11, "y");
    for(let x=X+1; x<=X+9; x++) barba(x, hy+12, (x%2) ? "Y" : "y");
    for(let x=X+2; x<=X+8; x++) barba(x, hy+13, "y");
  }
  if(p.gafas){
    /* montura redonda y fina: arriba, los lados y el puente. La fila de
       abajo cae pegada a la boca y se leía como un bigote, así que solo
       quedan las dos esquinas de abajo, que es lo que redondea el aro */
    caja(X+1, hy+6, 4, 1, "g"); caja(X+6, hy+6, 4, 1, "g");
    px(X, hy+7, "g"); px(X, hy+8, "g"); px(X, hy+9, "g");
    px(X+5, hy+7, "g");
    px(X+10, hy+7, "g"); px(X+10, hy+8, "g"); px(X+10, hy+9, "g");
    px(X+1, hy+10, "g"); px(X+4, hy+10, "g"); px(X+6, hy+10, "g"); px(X+9, hy+10, "g");
  }
}
function estampado(p, ty, dx){
  if(!p.estampado) return;
  const X = CX - 3 + dx;
  const P = p.estampado === "rombos" ? [[1,2],[3,4],[5,2],[2,5],[4,1]] : [[1,2],[4,1],[2,4],[5,4],[3,6],[0,5]];
  for(const [i,j] of P) px(X+i, ty+j, "Q");
}

/* pintaCompi sin canvas: el mismo orden de capas, y los once por encima */
function dibuja(modo, tt, op){
  const M = { izq: !!op.izq, mira: op.mira || null, trozos: [] };
  const E = (POSES[modo] || POSES.quieto)(tt, M);
  if(op.boca === 1) E.cara = "hablaMedia";
  if(op.boca === 2) E.cara = (E.cara === "feliz" || E.cara === "risa") ? "hablaFeliz" : "habla";
  /* aplastar al frenar: el cuerpo baja un píxel y los brazos caen */
  if(op.aplasta){ E.dy = (E.dy || 0) + 1; E.bI = {ang:110,len:5}; E.bD = {ang:70,len:5}; }
  if(op.estira){ E.dy = (E.dy || 0) - 1; }
  const p = op.persona;
  const dy  = Math.round(E.dy || 0);
  const inc = Math.round(E.lean || 0);
  const hy  = CAB + dy + Math.round(E.cabY || 0);
  const ty  = TRONCO + dy;
  const cy  = CADERA + dy;
  const cx  = inc + Math.round(E.cabX || 0);

  limpiar();
  if(p) peloDetras(p, hy, cx);
  if(E.sillon) sillonDetras(ty, cy);
  pierna(-1, cy, E.pI);
  pierna(1,  cy, E.pD);
  brazo(-1, ty, inc, E.bI);
  caja(CX-2+inc, cy, 5, 1, "P"); px(CX+2+inc, cy, "p");
  tronco(ty, inc, p ? false : !E.sinGalon);
  if(p) estampado(p, ty, inc);
  cabeza(hy, cx, E.cara || "normal", E.mira || M.mira);
  if(p) peloDelante(p, hy, cx);
  brazo(1, ty, inc, E.bD);
  if(E.sillon) sillonDelante(ty, cy);
  if(E.abanico) abanico(hy, cx, E.fase);
  if(E.maleta)  maleta(inc, dy);
  if(E.justificante) justificante(inc, dy);
  if(E.papeleta) papeleta(inc, dy);
  if(E.puntoVioleta) puntoVioleta(inc, dy);
  if(E.despertador) despertador(inc, dy);
  if(E.patinete) patinete(inc, dy);
  if(E.coche)   coche(inc);
  if(E.gorro)   gorro(hy, cx);
  if(E.tarta)   tarta(Math.round(E.dy || 0), E.fase);
  if(E.sudor)   sudorFrente(hy, cx);
  if(E.gotaGorda) gotaGorda(hy, cx);
  if(E.polvo && op.polvo){ glifo("polvo", CX-9, PISO-2, "V"); glifo("polvo", CX+7, PISO-2, "V"); }
  if(E.nota)   glifo("nota",   CX+8, hy-4, "C");
  if(E.admira) glifo("admira", CX+7, hy-5, "R");
  if(E.corazon)  glifo("corazon", CX+7, hy-3, "R");
  if(E.chispa){  glifo("chispa",  CX+7, hy-5, "C"); glifo("chispa", CX-10, hy-2, "C"); }
  contorno();
  return { B: B.slice(), dy, izq: M.izq };
}
`;
vm.runInContext(fuente + "\n" + extra + "\n;this.dibuja = dibuja; this.TINTA = TINTA; this.REJ_W = REJ_W; this.REJ_H = REJ_H;", ctx);

/* pelo, barba y ropa de cada uno, a ojo de las fotos del A3 */
const BEIS = { C:"#e8dcc6", c:"#cbbda4", L:"#f6efe2" };
const PERSONAS = {
  munoz:     { pelo:["#4a2c1c","#6e4630"], moño:true,
               ropa:{ C:"#262c4c", c:"#171b33", L:"#f2ede4" } },
  navarro:   { pelo:["#1a1310","#342620"], corto:true },
  galindo:   { pelo:["#8c3b1b","#b55a2c"], rizos:15 },
  fernandez: { pelo:["#5a3d28","#7a563b"], melena:17, barba:"larga", barbaColor:["#34251b","#4a3526"] },
  lopezm:    { pelo:["#b0753a","#cf9555"], entradas:true, ropa:{ C:"#24305a", c:"#172042", L:"#3a4a7c" } },
  bolivar:   { pelo:["#2a1c14","#44302a"], barba:"poblada" },
  algarra:   { pelo:["#6c3820","#93532f"], rizos:10, gafas:true, gafasColor:"#6b6f7c" },
  barchein:  { pelo:["#3b2618","#5a3d27"], rizos:11, barba:"poblada", barbaColor:["#4a2e1a","#633f25"],
               ropa:{ C:"#6b4a2a", c:"#523720", L:"#86613d", Q:"#e0b04a" }, estampado:"lunares" },
  aranda:    { pelo:["#6a4630","#8a5f42"], barba:"corta", barbaColor:["#5a3f2e","#7a5a44"] },
  lopeza:    { pelo:["#8a6440","#aa8258"], melena:11, flequillo:true },
  castillo:  { pelo:["#1d1512","#35271f"], melena:17,
               ropa:{ C:"#f1e6cf", c:"#d8c9ab", L:"#fbf6ea", Q:"#6f8fbf" }, estampado:"rombos" }
};

function paleta(p){
  const T = Object.assign({}, ctx.TINTA);
  if(!p) return T;
  T.H = p.pelo[0]; T.h = p.pelo[1];
  const bc = p.barbaColor || p.pelo;
  T.Y = bc[0]; T.y = bc[1];
  T.g = p.gafasColor || "#2b2f3a";
  Object.assign(T, BEIS, p.ropa || {});
  return T;
}

const peticiones = JSON.parse(fs.readFileSync(0, "utf8"));
const salida = [];
for(const r of peticiones){
  const p = r.quien === "compi" ? null : PERSONAS[r.quien];
  if(r.quien !== "compi" && !p) throw new Error("no conozco a " + r.quien);
  const T = paleta(p);
  const d = ctx.dibuja(r.pose, r.tt || 0, { izq: r.izq, boca: r.boca || 0, persona: p,
    mira: r.mira ? { x: r.mira[0], y: r.mira[1] } : null, aplasta: r.aplasta, estira: r.estira, polvo: true });
  const W = ctx.REJ_W, H = ctx.REJ_H;
  const fila = new Array(W*H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const k = d.B[y*W+x];
    fila[y*W + (d.izq ? W-1-x : x)] = k ? T[k] : "";
  }
  salida.push(fila.join(",") + "|" + d.dy);
}
process.stdout.write(salida.join("\n"));
