/* ==================================================================
   COMPI · núcleo de dibujo
   ------------------------------------------------------------------
   Copia literal del muñeco de píxeles de index.html (paleta, rejilla,
   piezas y poses), sin la parte de animación ni la de perseguir al
   ratón: los carteles solo necesitan una pose congelada.

   Si tocas a Compi en index.html, vuelve a extraer este trozo; es el
   bloque que va desde el comentario de la paleta hasta POSES.fuga.

   Al final del fichero, lo único que no está en index.html:
   pintaCompi(), que pinta un fotograma en un canvas.
   ================================================================== */

/* ---- paleta: la del cartel, con dos tonos por superficie ---- */
const TINTA = {
  O:"#050c1c",                          /* contorno   */
  H:"#3b2a1d", h:"#61472f",             /* pelo       */
  S:"#f7d2ae", s:"#d9a67d",             /* piel       */
  W:"#ffffff", E:"#101c33",             /* ojo        */
  M:"#a04a4c",                          /* boca       */
  R:"#f4796b", r:"#f9a79d",             /* coral      */
  C:"#3fc9f0", c:"#1b9fc9", L:"#9ce2f6",/* camiseta   */
  P:"#2a4a80", p:"#1b3159",             /* pantalón   */
  B:"#e9f2fc", b:"#f4796b",             /* zapatilla  */
  V:"#b8c8dd", v:"#c9584c"              /* zapatilla en sombra */
};

/* ---- rejilla y anatomía (en píxeles de sprite) ---- */
const REJ_W = 27, REJ_H = 36;
const CX = 13, CAB = 7, TRONCO = 20, CADERA = 27, PISO = 35;

const QUIETO = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
const azar = a => a[Math.floor(Math.random()*a.length)];
const cepo = (v,a,b) => v<a ? a : v>b ? b : v;

/* ---- lienzo de píxeles compartido ---- */
let B = new Array(REJ_W*REJ_H).fill(null);
const limpiar = () => B.fill(null);
function px(x,y,k){
  x = Math.round(x); y = Math.round(y);
  if(x<0 || y<0 || x>=REJ_W || y>=REJ_H) return;
  B[y*REJ_W+x] = k;
}
function caja(x,y,w,h,k){
  x = Math.round(x); y = Math.round(y);
  for(let j=0;j<h;j++) for(let i=0;i<w;i++) px(x+i, y+j, k);
}
function trazo(x0,y0,x1,y1,g,k){
  const pasos = Math.max(1, Math.ceil(Math.max(Math.abs(x1-x0), Math.abs(y1-y0))));
  for(let i=0;i<=pasos;i++){
    const t = i/pasos;
    caja(x0+(x1-x0)*t, y0+(y1-y0)*t, g, g, k);
  }
}
/* el contorno no se dibuja: se deduce dilatando la silueta un píxel */
const VECINOS = [[1,0],[-1,0],[0,1],[0,-1]];
function contorno(){
  const nuevos = [];
  for(let y=0;y<REJ_H;y++){
    for(let x=0;x<REJ_W;x++){
      if(B[y*REJ_W+x]) continue;
      for(let n=0;n<4;n++){
        const nx = x+VECINOS[n][0], ny = y+VECINOS[n][1];
        if(nx<0||ny<0||nx>=REJ_W||ny>=REJ_H) continue;
        if(B[ny*REJ_W+nx]){ nuevos.push(y*REJ_W+x); break; }
      }
    }
  }
  for(let i=0;i<nuevos.length;i++) B[nuevos[i]] = "O";
}

/* ================== piezas del muñeco ================== */

/* ojos: blanco de 4x3 con pupila de 2x2 que se mueve dentro */
function unOjo(X,y,ox,m,grande){
  const ty = grande ? y+6 : y+7, alto = grande ? 4 : 3;
  caja(X+ox, ty, 4, alto, "W");
  const ax = X+ox+1 + (m ? m.x : 0);
  const ay = ty + (grande ? 1 : 0) + (m ? m.y : 1);
  caja(ax, ay, 2, 2, "E");
  px(ax, ay, "W");                       /* brillo */
}
const OJOS = {
  abiertos(X,y,m,g){ unOjo(X,y,1,m,g); unOjo(X,y,6,m,g); },
  cerrados(X,y){ caja(X+1,y+8,4,1,"O"); caja(X+6,y+8,4,1,"O"); px(X+1,y+7,"O"); px(X+9,y+7,"O"); },
  arcos(X,y){
    px(X+2,y+7,"E"); px(X+3,y+7,"E"); px(X+1,y+8,"E"); px(X+4,y+8,"E");
    px(X+7,y+7,"E"); px(X+8,y+7,"E"); px(X+6,y+8,"E"); px(X+9,y+8,"E");
  },
  entornados(X,y){
    caja(X+1,y+8,4,2,"W"); caja(X+6,y+8,4,2,"W");
    caja(X+2,y+8,2,2,"E"); caja(X+7,y+8,2,2,"E");
    caja(X+1,y+7,4,1,"O"); caja(X+6,y+7,4,1,"O");
  },
  apretados(X,y){
    /* dos arcos hacia abajo: ojos cerrados con fuerza, de llorar */
    px(X+1,y+7,"E"); px(X+4,y+7,"E"); px(X+2,y+8,"E"); px(X+3,y+8,"E");
    px(X+6,y+7,"E"); px(X+9,y+7,"E"); px(X+7,y+8,"E"); px(X+8,y+8,"E");
  },
  equis(X,y){
    const X_ = [[0,0],[2,0],[1,1],[0,2],[2,2]];
    for(let i=0;i<5;i++){
      px(X+1+X_[i][0], y+7+X_[i][1], "E");
      px(X+6+X_[i][0], y+7+X_[i][1], "E");
    }
  },
  medios(X,y){
    caja(X+1,y+9,4,1,"W"); caja(X+6,y+9,4,1,"W");
    caja(X+2,y+9,2,1,"E"); caja(X+7,y+9,2,1,"E");
    caja(X+1,y+8,4,1,"H"); caja(X+6,y+8,4,1,"H");
  }
};
function boca(X,y,tipo){
  const m = y+11;
  if(tipo==="sonrisa"){
    caja(X+3,m,5,1,"M"); px(X+3,m-1,"M"); px(X+7,m-1,"M");
  } else if(tipo==="o"){
    caja(X+4,m,3,2,"M"); px(X+5,m,"r");
  } else if(tipo==="grito"){
    caja(X+3,m,5,2,"M"); caja(X+4,m+1,3,1,"R");
  } else if(tipo==="apretada"){
    caja(X+3,m,5,1,"M"); px(X+4,m,"W"); px(X+6,m,"W");
  } else if(tipo==="risa"){
    px(X+2,m-1,"M"); px(X+8,m-1,"M");
    caja(X+3,m,5,1,"W"); caja(X+3,m+1,5,1,"M"); px(X+5,m+1,"R");
  } else if(tipo==="berrido"){
    caja(X+3,m-1,5,1,"M"); caja(X+4,m,3,2,"M"); px(X+5,m,"R");
  } else if(tipo==="ondas"){
    px(X+3,m,"M"); px(X+4,m+1,"M"); px(X+5,m,"M"); px(X+6,m+1,"M"); px(X+7,m,"M");
  } else {
    caja(X+4,m,3,1,"M");
  }
}
const rubor = (X,y)=>{ px(X,y+10,"r"); px(X+1,y+10,"r"); px(X+9,y+10,"r"); px(X+10,y+10,"r"); };

const CARAS = {
  normal(X,y,m){ OJOS.abiertos(X,y,m); boca(X,y,"linea"); rubor(X,y); },
  parpadeo(X,y){ OJOS.cerrados(X,y); boca(X,y,"linea"); rubor(X,y); },
  feliz(X,y){ OJOS.arcos(X,y); boca(X,y,"sonrisa"); rubor(X,y); },
  sorpresa(X,y,m){ OJOS.abiertos(X,y,m,true); boca(X,y,"o"); },
  asustado(X,y,m){ OJOS.abiertos(X,y,m,true); boca(X,y,"grito"); },
  corre(X,y){ OJOS.entornados(X,y); boca(X,y,"apretada"); },
  llora(X,y){ OJOS.apretados(X,y); boca(X,y,"berrido"); },
  risa(X,y){ OJOS.arcos(X,y); boca(X,y,"risa"); rubor(X,y); },
  serio(X,y,m){
    OJOS.abiertos(X,y,m);
    caja(X+1,y+6,4,1,"H"); caja(X+6,y+6,4,1,"H");   /* cejas rectas */
    boca(X,y,"linea");
  },
  mareado(X,y){ OJOS.equis(X,y); boca(X,y,"ondas"); },
  guino(X,y,m){ unOjo(X,y,1,m); caja(X+6,y+8,4,1,"O"); px(X+9,y+7,"O"); boca(X,y,"sonrisa"); rubor(X,y); },
  cansado(X,y){ OJOS.medios(X,y); boca(X,y,"linea"); }
};

/* cabeza: 11x13, pelo con brillo, patillas y sombra al lado derecho */
function cabeza(y, dx, cara, mira){
  const X = CX - 5 + dx;
  caja(X+2, y,   7, 1, "H");
  caja(X+1, y+1, 9, 1, "H");
  caja(X,   y+2, 11, 3, "H");
  caja(X+1, y+1, 3, 1, "h"); caja(X+1, y+2, 2, 1, "h"); px(X+1, y+3, "h");
  caja(X,   y+5, 2, 1, "H"); caja(X+9, y+5, 2, 1, "H");
  caja(X+2, y+5, 7, 1, "S");
  caja(X,   y+6, 11, 5, "S");
  caja(X+1, y+11, 9, 1, "S");
  caja(X+2, y+12, 7, 1, "S");
  caja(X+10, y+6, 1, 5, "s"); px(X+9, y+11, "s"); px(X+8, y+12, "s");
  px(X+1, y+6, "s"); px(X+9, y+6, "s");                   /* sienes */
  px(X+7, y-1, "H"); px(X+8, y-1, "H"); px(X+8, y-2, "H"); /* mechón */
  (CARAS[cara] || CARAS.normal)(X, y, mira);
}

/* tronco: camiseta cian con galón coral, eco de los chevrones del cartel */
function tronco(y, dx){
  const X = CX - 3 + dx;
  caja(X, y, 7, 7, "C");
  caja(X+6, y, 1, 7, "c");
  caja(X, y+6, 7, 1, "c");
  px(X, y+1, "L"); px(X, y+2, "L");
  caja(X+2, y, 3, 1, "S"); px(X+2, y, "s");
  px(X+1, y, "L"); px(X+5, y, "L");
  px(X+2,y+2,"R"); px(X+3,y+2,"R");
  px(X+3,y+3,"R"); px(X+4,y+3,"R");
  px(X+2,y+4,"R"); px(X+3,y+4,"R");
}

function brazo(lado, ty, dx, a){
  if(!a) return;
  const sx = (lado<0 ? CX-4 : CX+3) + dx, sy = ty + 2;
  const rad = a.ang * Math.PI/180;
  const ex = sx + Math.cos(rad)*a.len, ey = sy + Math.sin(rad)*a.len;
  const mx = sx + Math.cos(rad)*a.len*0.45, my = sy + Math.sin(rad)*a.len*0.45;
  trazo(sx, sy, mx, my, 2, lado<0 ? "c" : "C");
  trazo(mx, my, ex, ey, 2, lado<0 ? "s" : "S");
  caja(ex, ey, 2, 2, lado<0 ? "s" : "S");
}

/* la pierna acepta ángulo (posturas quietas) o pie y rodilla sueltos
   (andar y correr), que es la única forma de que los pies no se pisen */
function pierna(lado, cy, a){
  if(!a) return;
  const hx = lado<0 ? CX-2 : CX+1;
  let ex, ey;
  if(a.dx !== undefined){ ex = hx + a.dx; ey = cy + a.dy; }
  else { const rad = a.ang*Math.PI/180; ex = hx + Math.cos(rad)*a.len; ey = cy + Math.sin(rad)*a.len; }
  const kx = a.kx !== undefined ? hx + a.kx : (hx+ex)/2;
  const ky = a.ky !== undefined ? cy + a.ky : (cy+ey)/2;
  const tono = lado<0 ? "p" : "P";
  trazo(hx, cy, kx, ky, 2, tono);
  trazo(kx, ky, ex, ey, 2, tono);
  const zx = Math.round(ex) + (lado<0 ? -1 : 0);
  caja(zx, Math.round(ey)+1, 3, 1, lado<0 ? "V" : "B");
  caja(zx, Math.round(ey)+2, 3, 1, lado<0 ? "v" : "b");
}

/* glifos de un puñado de píxeles para los detalles */
const GLIFO = {
  punto:    [[0,0]],
  polvo:    [[0,0],[1,0],[0,1]],
  nota:     [[1,0],[2,0],[1,1],[1,2],[0,3],[1,3]],
  estrella: [[1,0],[0,1],[1,1],[2,1],[1,2]],
  chispa:   [[1,0],[0,1],[2,1],[1,2]],
  corazon:  [[0,0],[2,0],[0,1],[1,1],[2,1],[1,2]],
  gota:     [[1,0],[0,1],[1,1],[0,2],[1,2]],
  admira:   [[0,0],[0,1],[0,3]]
};
function glifo(tipo, x, y, k){
  const g = GLIFO[tipo] || GLIFO.punto;
  for(let i=0;i<g.length;i++) px(x+g[i][0], y+g[i][1], k);
}

/* ================== poses ================== */
const POSES = {
  quieto(tt){
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, cara:"normal",
      bI:{ang:100,len:5}, bD:{ang:80,len:5}, pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  baile(tt){
    const f = Math.floor(tt/165) % 4;
    const A = [
      {dy:0,  lean:0,  bI:{ang:112,len:5}, bD:{ang:68,len:5},  pI:{ang:98,len:4},  pD:{ang:82,len:4}},
      {dy:-2, lean:-1, bI:{ang:248,len:6}, bD:{ang:25,len:6},  pI:{ang:112,len:4}, pD:{ang:74,len:4}},
      {dy:0,  lean:0,  bI:{ang:168,len:6}, bD:{ang:12,len:6},  pI:{ang:120,len:4}, pD:{ang:60,len:4}},
      {dy:-2, lean:1,  bI:{ang:155,len:6}, bD:{ang:292,len:6}, pI:{ang:106,len:4}, pD:{ang:68,len:4}}
    ][f];
    A.fase = f; A.cara = f%2 ? "feliz" : "normal"; A.nota = (f===1);
    return A;
  },
  anda(tt){
    const f = Math.floor(tt/155) % 4;
    const PI = [ {dx:-1,dy:4}, {dx:-1,dy:4}, {dx:-1.5,dy:3,kx:-2,ky:2.2}, {dx:-1,dy:4} ][f];
    const PD = [ {dx:1.5,dy:3,kx:2,ky:2.2}, {dx:1,dy:4}, {dx:1,dy:4}, {dx:1,dy:4} ][f];
    return { fase:f, dy: f%2 ? 0 : -1, lean:1, cara:"normal",
      bI:{ang: f<2?140:105, len:5}, bD:{ang: f<2?48:88, len:5},
      pI:PI, pD:PD };
  },
  corre(tt, M){
    const f = Math.floor(tt/92) % 4;
    const PI = [ {dx:-1.5,dy:2.4,kx:-0.5,ky:2.2}, {dx:-1,dy:4.2,kx:-1,ky:2.2},
                 {dx:0.5,dy:4.2,kx:0.5,ky:2.2},   {dx:-1,dy:3,kx:-1.5,ky:1.8} ][f];
    const PD = [ {dx:2,dy:4.2,kx:1.8,ky:2.2},     {dx:1,dy:3,kx:2,ky:1.8},
                 {dx:0.5,dy:2.4,kx:0.2,ky:2.2},   {dx:1.5,dy:4.2,kx:1.5,ky:2.2} ][f];
    return { fase:f, dy: f%2 ? 0 : -2, lean:1, cabX:1, polvo:true,
      cara: (M && M.esquiva > performance.now()) ? "corre" : "asustado",
      bI:{ang: f<2?206:150, len:5}, bD:{ang: f<2?18:84, len:5},
      pI:PI, pD:PD };
  },
  alerta(){
    return { fase:0, dy:-2, lean:-1, cara:"sorpresa", admira:true,
      bI:{ang:172,len:4}, bD:{ang:8,len:4}, pI:{ang:106,len:4}, pD:{ang:74,len:4} };
  },
  pillado(tt){
    const w = Math.sin(tt/90);
    return { fase:0, dy:0, lean:Math.round(w*1.6), cabX:Math.round(w*1.2),
      cara:"mareado", estrellas:true,
      bI:{ang:245,len:5}, bD:{ang:295,len:5}, pI:{ang:110,len:4}, pD:{ang:70,len:4} };
  },
  celebra(tt){
    const f = Math.floor(tt/115) % 2;
    return { fase:f, dy: f?-3:-1, cara:"feliz", chispa:true,
      bI:{ang:248,len:6}, bD:{ang:292,len:6},
      pI:{ang: f?118:98, len:4}, pD:{ang: f?62:82, len:4} };
  },
  chasco(tt){
    /* llorar: hipido, hombros que tiemblan y dos churretes */
    const f = Math.floor(tt/150) % 4;
    return { fase:f, dy: f%2 ? 1 : 0, cabY:1,
      lean: f===1 ? -1 : f===3 ? 1 : 0,
      cara:"llora", llanto:true, lagrima: f===0 || f===2,
      bI:{ang:104,len:5}, bD:{ang:76,len:5}, pI:{ang:93,len:4}, pD:{ang:87,len:4} };
  },
  saluda(tt){
    const f = Math.floor(tt/150) % 2;
    return { fase:f, dy: f?-1:0, cara:"feliz", corazon: f===1,
      bI:{ang:104,len:5}, bD:{ang: f?300:336, len:6},
      pI:{ang:97,len:4}, pD:{ang:83,len:4} };
  },
  risa(tt){
    /* le has puesto el cursor encima: se retuerce de cosquillas */
    const f = Math.floor(tt/110) % 4;
    return { fase:f, dy: f%2 ? -1 : 0,
      lean: f===1 ? 1 : f===3 ? -1 : 0,
      cabX: f===1 ? 1 : f===3 ? -1 : 0,
      cara:"risa", chispa: f===0,
      bI:{ang: f<2 ? 150 : 118, len:5}, bD:{ang: f<2 ? 30 : 62, len:5},
      pI:{ang: f%2 ? 112 : 100, len:4}, pD:{ang: f%2 ? 68 : 80, len:4} };
  },
  serio(tt){
    /* se planta y se pone serio: quieto del todo, que se note */
    return { fase:0, dy:0, cara:"serio",
      bI:{ang:99,len:5}, bD:{ang:81,len:5},
      pI:{dx:-1,dy:4}, pD:{dx:1,dy:4} };
  },
  chuleo(tt){
    const f = Math.floor(tt/190) % 2;
    return { fase:f, dy: f?-1:0, lean: f?1:0, cara:"guino",
      bI:{ang:120,len:5}, bD:{ang: f?302:278, len:6},
      pI:{ang:100,len:4}, pD:{ang:80,len:4} };
  },
  cansado(tt){
    const s = Math.sin(tt/700);
    return { fase: s>0?1:0, dy: s>0?0:1, cabY:1, cara:"cansado", gota: s>0.92,
      bI:{ang:96,len:5}, bD:{ang:84,len:5}, pI:{ang:95,len:4}, pD:{ang:85,len:4} };
  }
};
POSES.vuelve = POSES.anda;
POSES.carcajada = POSES.risa;                 /* se le escapa la risa */
POSES.fuga = function(tt, M){                 /* y sale por patas */
  const E = POSES.corre(tt, M);
  E.cara = "corre";
  return E;
};

/* ==================================================================
   pintaCompi · un solo fotograma, para los carteles
   ------------------------------------------------------------------
   canvas  el <canvas> destino; se le fija el tamaño según la escala
   modo    nombre de pose de POSES ("quieto", "saluda", "chuleo"...)
   tt      milisegundo de la pose que se quiere congelar: cada pose es
           cíclica, así que este número elige el fotograma
   esc     píxeles de pantalla por píxel de sprite
   op      { mira:{x,y} } desvía la pupila; { izq:true } lo voltea
   ================================================================== */
function pintaCompi(canvas, modo, tt, esc, op){
  op = op || {};
  const M = { izq: !!op.izq, mira: op.mira || null, trozos: [] };
  const An = REJ_W * esc, Al = REJ_H * esc;
  canvas.width = An; canvas.height = Al;
  canvas.style.width = An + "px"; canvas.style.height = Al + "px";
  const ctx = canvas.getContext("2d");

  const E = (POSES[modo] || POSES.quieto)(tt, M);
  const dy  = Math.round(E.dy || 0);
  const inc = Math.round(E.lean || 0);
  const hy  = CAB + dy + Math.round(E.cabY || 0);
  const ty  = TRONCO + dy;
  const cy  = CADERA + dy;

  limpiar();
  pierna(-1, cy, E.pI);
  pierna(1,  cy, E.pD);
  brazo(-1, ty, inc, E.bI);
  caja(CX-2+inc, cy, 5, 1, "P"); px(CX+2+inc, cy, "p");
  tronco(ty, inc);
  cabeza(hy, inc + Math.round(E.cabX || 0), E.cara || "normal", E.mira || M.mira);
  brazo(1, ty, inc, E.bD);
  if(E.nota)   glifo("nota",   CX+8, hy-4, "C");
  if(E.admira) glifo("admira", CX+7, hy-5, "R");
  contorno();

  /* la sombra del suelo, igual que en la web pero sin el aire del salto */
  ctx.clearRect(0, 0, An, Al);
  const aire = -Math.min(0, dy);
  const an = Math.max(4, 9 - aire);
  const alfa = Math.max(0.12, 0.40 - aire*0.06);
  const x0 = (CX - (an>>1))*esc, y0 = PISO*esc;
  ctx.fillStyle = "rgba(4,10,26,"+(alfa*0.55).toFixed(2)+")";
  ctx.fillRect(x0, y0, an*esc, esc);

  /* volcado por tramos de color, como en index.html */
  for(let y=0;y<REJ_H;y++){
    let x = 0;
    while(x < REJ_W){
      const k = B[y*REJ_W+x];
      if(!k){ x++; continue; }
      let n = 1;
      while(x+n < REJ_W && B[y*REJ_W+x+n] === k) n++;
      ctx.fillStyle = TINTA[k];
      ctx.fillRect((M.izq ? (REJ_W - x - n) : x)*esc, y*esc, n*esc, esc);
      x += n;
    }
  }
}
