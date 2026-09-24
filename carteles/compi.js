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
  V:"#b8c8dd", v:"#c9584c",             /* zapatilla en sombra */
  U:"#8a4fd0", u:"#6a35a8"              /* violeta · solo el punto violeta */
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
  cansado(X,y){ OJOS.medios(X,y); boca(X,y,"linea"); },
  /* soplar: los arcos de la cara feliz con la boca en O. Con los ojos
     abiertos parecía sorpresa, que es otra cosa */
  sopla(X,y){ OJOS.arcos(X,y); boca(X,y,"o"); rubor(X,y); }
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

/* tronco: camiseta cian con galón coral, eco de los chevrones del cartel.

   El galón se puede quitar (galon=false) y solo lo quita la pose de la
   tarta: las llamas son coral y caen justo a la altura del galón, así
   que con él puesto las tres velas se leen como salpicaduras en la
   camiseta en vez de como velas. Sin él, tres columnas blancas sobre
   cian y tres puntas coral encima. Comprobado reexportando los
   veintisiete carteles: ninguno más lo quita, así que ninguno cambia. */
function tronco(y, dx, galon){
  const X = CX - 3 + dx;
  caja(X, y, 7, 7, "C");
  caja(X+6, y, 1, 7, "c");
  caja(X, y+6, 7, 1, "c");
  px(X, y+1, "L"); px(X, y+2, "L");
  caja(X+2, y, 3, 1, "S"); px(X+2, y, "s");
  px(X+1, y, "L"); px(X+5, y, "L");
  if(galon === false) return;
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

/* el sillón, en dos mitades: el respaldo y el asiento van DETRÁS del
   muñeco y los brazos DELANTE, que es lo único que hace que se lea como
   estar sentado en algo y no de pie contra una pared. Coral, que es el
   otro color de la casa y separa el mueble de la camiseta cian */
function sillonDetras(ty, cy){
  caja(CX-7, ty-6, 15, 13, "R");          /* respaldo, por encima del hombro */
  caja(CX-7, ty-6, 15, 1,  "r");          /* filo de arriba, más claro */
  px(CX-7, ty-5, "r"); px(CX-7, ty-4, "r");
  caja(CX-9, cy+1, 19, 4, "r");           /* asiento, más ancho que el respaldo */
  caja(CX-9, cy+5, 19, 1, "v");           /* sombra del asiento */
  caja(CX-8, cy+6, 2, 2, "v");            /* patas */
  caja(CX+7, cy+6, 2, 2, "v");
}
function sillonDelante(ty, cy){
  caja(CX-9, ty+4, 3, 5, "R");            /* brazo izquierdo */
  caja(CX-9, ty+4, 3, 1, "r");
  caja(CX+7, ty+4, 3, 5, "R");            /* brazo derecho */
  caja(CX+7, ty+4, 3, 1, "r");
  caja(CX-9, ty+8, 3, 1, "v");
  caja(CX+7, ty+8, 3, 1, "v");
}

/* el abanico. Va DELANTE del brazo, que es lo que hace que se lea como
   agarrado y no como pegado detrás.

   Silueta plana y no un sector barrido: a siete píxeles de radio la
   geometría sale como una mancha redonda, y lo que hace que se lea un
   abanico a este tamaño es el contraste de anchura -- ancho arriba,
   cuello estrecho abajo -- más las varillas y la empuñadura asomando.

   Y DEPENDE DEL FOTOGRAMA. La primera versión solo movía el brazo y el
   abanico se quedaba clavado, o sea que en el GIF no se abanicaba: movía
   la mano debajo de un abanico quieto. Ahora tiene dos posiciones,
   abierto y medio cerrado, y baja un píxel al cerrarse. */
function abanico(hy, dx, f){
  const X = CX + 6 + dx, y0 = hy + 2 + (f ? 1 : 0);
  const TELA = f
    ? [[1,6],[1,6],[1,6],[1,6],[2,5],[2,4],[3,3],[3,2]]     /* medio cerrado */
    : [[0,7],[0,7],[0,7],[1,6],[1,5],[2,4],[2,3],[3,2]];    /* abierto */
  for(let i=0;i<TELA.length;i++){
    caja(X + TELA[i][0], y0 + i, TELA[i][1], 1, i < 3 ? "r" : "R");
  }
  /* las varillas se calculan de la propia silueta, así siguen a las dos
     posiciones sin tener que escribirlas dos veces */
  for(let i=0;i<TELA.length-1;i++){
    const off = TELA[i][0], an = TELA[i][1];
    px(X + off + 1, y0 + i, "v");
    if(an > 3) px(X + off + an - 2, y0 + i, "v");
  }
  caja(X + 3, y0 + 8, 2, 2, "v");          /* empuñadura, bajo la mano */
}

/* la tarta con las velas. Va DELANTE de todo, como el abanico, y por lo
   mismo: sostenida por las dos manos, que asoman a los lados del plato.

   Y DEPENDE DEL FOTOGRAMA, también por lo mismo. Si las llamas no se
   mueven, en el GIF Compi pone cara de soplar y no pasa nada: sopla
   debajo de tres velas clavadas. Las dos posiciones son de pie y
   tumbadas hacia la izquierda, que es hacia donde sopla.

   Las velas van a x = CX-3, CX y CX+3, o sea tres y no cinco: a nueve
   píxeles de bizcocho, cinco velas se leen como una cresta. Y miden
   tres píxeles, no dos: la primera versión las puso de dos y quedaron
   enterradas en el galón del pecho, que es coral y está a esa altura.

   Y LA LLAMA VA EN CORAL, no en color piel. La segunda versión la puso
   en "S" y desapareció: a esa altura la llama cae contra la barbilla,
   que es exactamente ese color. Coral sobre camiseta cian se ve desde
   la miniatura, que es donde este cartel se juega el chiste.

   Los brazos van abiertos y cortos -- ang 108/72, len 6 -- para que las
   manos caigan A LOS LADOS del plato y no debajo. Con len 7 las tapaba
   el plato entero y la tarta parecía flotar. */
function tarta(dy, f){
  const yb = 26 + dy;                      /* fila del glaseado */
  /* las velas primero, que van detrás del bizcocho por abajo */
  for(let i=-3;i<=3;i+=3){
    caja(CX+i, yb-3, 1, 3, "W");           /* tres píxeles de vela */
    px(CX+i, yb-2, "L");                   /* la raya de cera */
    if(f){                                 /* soplada: la llama se tumba */
      px(CX+i-1, yb-4, "R"); px(CX+i-2, yb-4, "r");
    } else {                               /* de pie */
      px(CX+i, yb-5, "r"); px(CX+i, yb-4, "R");
    }
  }
  caja(CX-4, yb,   9, 1, "r");             /* glaseado */
  caja(CX-4, yb+1, 9, 2, "R");             /* bizcocho */
  px(CX-4, yb+1, "r");                     /* luz por la izquierda */
  caja(CX-5, yb+3, 11, 1, "V");            /* plato */
  /* y el filo oscuro del plato, que es lo que de verdad separa la tarta
     del cuerpo: dentro de la silueta no hay contorno, así que sin esta
     fila el bizcocho se lee como un cinturón coral */
  caja(CX-5, yb+4, 11, 1, "O");
}


/* el gorro de cumpleaños: cono de dos bandas, filo abajo y borla arriba.
   Va LADEADO A LA DERECHA -- el eje del cono cae un píxel fuera del de la
   cabeza -- que es lo único que lo separa de un sombrero puesto recto.

   Cinco filas y no seis: con seis, la borla se sale del lienzo por arriba
   cuando la pose no baja el cuerpo, y px() la tira sin avisar. */
function gorro(hy, dx){
  const X = CX - 5 + dx, hx = X + 6;
  const FILAS = [[0,1],[-1,3],[-1,3],[-2,5],[-2,5]];
  for(let i=0;i<FILAS.length;i++){
    caja(hx + FILAS[i][0], hy - 6 + i, FILAS[i][1], 1, i % 4 < 2 ? "R" : "r");
  }
  caja(hx - 3, hy - 1, 7, 1, "v");         /* el filo, que sobresale */
  px(hx, hy - 7, "W");                     /* la borla */
}

/* la maleta de cabina. Va DELANTE del brazo, igual que el abanico y por
   lo mismo: detrás se lee como un mueble que hay al lado, no como algo
   que Compi lleva agarrado.

   Y EL ASA TELESCOPA CON EL FOTOGRAMA, que es lo que aquí hace de
   «el objeto depende del cuadro». La maleta se apoya en el suelo y no
   puede subir y bajar con el balanceo del cuerpo, así que lo que se
   estira es el tubo: la empuñadura va pegada al puño y el tubo cubre lo
   que quede hasta la tapa. Sin eso, al respirar Compi la levantaba en
   vilo tres píxeles del suelo.

   Cinco píxeles de ancho y no siete: a siete, la maleta y el pie derecho
   quedan a uno y los dos contornos se tocan, que en la miniatura se lee
   como que va montado encima de ella.

   Coral, por la misma razón que el sillón: es el otro color de la casa y
   es lo único que separa el bulto de la camiseta cian y del pantalón. */
function maleta(dx, dy){
  const X = CX + 6 + dx;                      /* al costado, fuera de la silueta */
  const puno = 24 + dy;                       /* la fila del puño, la del brazo derecho */
  const tapa = 28;                            /* la maleta no se mueve: está en el suelo */
  caja(X+1, puno-1, 4, 1, "V");               /* la empuñadura, justo encima del puño */
  caja(X+2, puno+2, 1, tapa-puno-2, "V");     /* el tubo, lo que quede hasta la tapa */
  caja(X, tapa,   5, 5, "R");                 /* el cuerpo */
  caja(X, tapa,   5, 1, "r");                 /* la tapa, más clara */
  caja(X, tapa+2, 5, 1, "v");                 /* la cremallera */
  px(X, tapa+1, "r"); px(X, tapa+3, "r");     /* la luz por la izquierda, como en la camiseta */
  px(X, tapa+5, "v"); px(X+4, tapa+5, "v");   /* las dos ruedas, a ras del zapato */
}

/* el patinete, al costado y agarrado por el manillar. Mismo criterio que
   la maleta y por lo mismo: va DELANTE del brazo, porque detrás se lee
   como un trasto que hay apoyado en la pared y no como algo que Compi
   lleva.

   EL MÁSTIL VA EN LA PUNTA DE LA PLATAFORMA, no en el centro. Centrado
   parece una fregona: lo que dice «patinete» es el ángulo recto entre la
   tabla larga y el palo en un extremo.

   Y la plataforma va en coral por la misma razón que la maleta y el
   sillón: es lo único que la separa del pantalón y de la zapatilla, que
   a esta altura del sprite son los dos azules oscuros. */
function patinete(dx, dy){
  const X = CX + 5 + dx;
  const puno  = 24 + dy;                       /* la fila del puño derecho */
  const suelo = 33;                            /* no flota: está en el suelo */
  caja(X+1, puno, 4, 1, "V");                  /* el manillar, a la altura del puño */
  caja(X+2, puno+1, 1, suelo-puno-1, "V");     /* el mástil, hasta la tabla */
  caja(X+1, suelo, 6, 1, "R");                 /* la plataforma */
  px(X+1, suelo, "r");                         /* luz por la izquierda */
  px(X+1, suelo+1, "v"); px(X+6, suelo+1, "v");/* las dos ruedas, a ras del zapato */
}

/* EL COCHE, ya aparcado, al costado. Va DELANTE del brazo, como la
   maleta y el patinete, y por lo mismo: detrás se lee como un coche que
   pasa por la calle del fondo y no como el de Compi.

   LA SEÑAL CON LA P FUE EL PRIMER INTENTO Y SE CAYÓ. Una señal dice
   DÓNDE se aparca; el cartel va de que ya has aparcado, que es otra
   cosa. Con el coche al lado y la cara a gusto, el muñeco cuenta el
   final de la historia y no el sitio.

   Y VA A ESCALA DE ICONO, no a la de Compi. En una rejilla de 27
   píxeles un coche en proporción mediría el doble del lienzo, así que
   se dibuja como el despertador de `compensacion` o la maleta de
   `dietas` -- que a tamaño real serían un armatoste y un juguete -- y
   funciona por lo mismo: lo que se reconoce es la silueta.

   Ocho de ancho y cinco de alto, y de ahí no se pasa: a nueve el
   contorno del coche toca el del zapato y en la miniatura se lee como
   que va montado encima. El techo más estrecho que el cuerpo, la luna
   blanca y las dos ruedas oscuras son lo único que hace falta para que
   se lea «coche» antes que «bulto».

   No respira con Compi: está aparcado. La carrocería se queda en su
   fila mientras el cuerpo sube y baja el píxel del balanceo. */
function coche(dx){
  const X = CX + 5 + dx, Y = 29;
  caja(X+2, Y,   4, 1, "R");              /* el techo, más estrecho */
  caja(X+1, Y+1, 6, 1, "R");              /* la cabina */
  caja(X+3, Y+1, 2, 1, "W");              /* la luna */
  caja(X,   Y+2, 8, 1, "R");              /* el cuerpo */
  px(X,   Y+2, "r");                      /* luz por la izquierda, como en la camiseta */
  px(X+7, Y+2, "W");                      /* el faro */
  caja(X,   Y+3, 8, 1, "v");              /* el faldón, en sombra */
  caja(X+1, Y+4, 2, 1, "p");              /* las dos ruedas, a ras del zapato */
  caja(X+5, Y+4, 2, 1, "p");
}

/* EL PUNTO VIOLETA. Un tótem de verdad -- cartel, poste y base-- y no
   un cartel en la mano, y esa es toda la idea: lo que se pide es un
   SITIO al que ir, no alguien que pase con una pancarta. Un objeto
   clavado en el suelo se lee como sitio; sostenido en alto, como
   manifestación.

   Va DELANTE del brazo, como todo lo demás, porque detrás se lee como
   un cartel pegado a la pared del fondo.

   El corazón blanco y no unas letras: «PUNTO VIOLETA» en un cartel de
   siete píxeles de ancho es ruido gris. El corazón es el glifo que ya
   existe, mide 3 x 3 y se reconoce a tamaño de miniatura, que es donde
   se juega esto.

   Y el violeta va en la chapa y NO en la camiseta de Compi: si se le
   pinta el peto, deja de ser Compi atendiendo el punto y pasa a ser
   Compi disfrazado. El muñeco es el mismo de siempre; lo que cambia es
   que está al lado. */
function puntoVioleta(dx, dy){
  const X = CX + 6 + dx, Y = 12 + dy, SUELO = 34;
  caja(X,   Y,   7, 8, "U");              /* la chapa */
  caja(X,   Y,   1, 8, "u");              /* filo oscuro por la izquierda */
  caja(X+2, Y+3, 3, 3, "U");              /* hueco para que el corazón respire */
  glifo("corazon", X+2, Y+3, "W");
  caja(X+3, Y+8, 1, SUELO-Y-8, "V");      /* el poste */
  caja(X+2, SUELO, 3, 1, "V");            /* la base */
  px(X+2, SUELO, "v");
}

/* el justificante del médico: una hoja en la mano derecha con el
   MEMBRETE EN CORAL arriba. Es el chiste del cartel hecho píxel -- la
   hoja es la misma y lo único que cambia es la banda de arriba -- así
   que el membrete ocupa dos filas de las ocho y se ve antes que el
   papel.

   Va DELANTE del brazo, como la maleta y el abanico: detrás se lee como
   un folio pegado a la pared.

   Seis de ancho y no cinco: a cinco, las rayas del texto quedan en tres
   píxeles y a tamaño de miniatura se leen como ruido, no como
   escritura. Y a seis todavía quedan dos píxeles de margen en la rejilla,
   que es lo que impide que px() se coma el borde derecho sin avisar. */
function justificante(dx, dy){
  const X = CX + 6 + dx, Y = 19 + dy;
  caja(X,   Y,   6, 2, "R");              /* el membrete, lo único que cambia */
  caja(X,   Y+2, 6, 6, "W");              /* la hoja */
  caja(X+1, Y+3, 4, 1, "V");              /* dos rayas de texto */
  caja(X+1, Y+5, 3, 1, "V");
  px(X, Y, "r");                          /* luz por la izquierda, como en la camiseta */
}

/* la papeleta en la mano alzada. Va DELANTE del brazo, como el
   justificante y la maleta, y por lo mismo: detrás se lee como un papel
   pegado a la pared.

   LLEVA LA CRUZ MARCADA Y ESO NO ES ADORNO. Una hoja en blanco a este
   tamaño es un folio cualquiera -- el mismo dibujo que el justificante
   del cartel del médico--; con la equis dentro se lee «papeleta» en la
   burbuja de un chat, antes de distinguir la cara.

   Arranca justo encima del puño, que con el brazo a 296 grados y len 9
   cae en (20,14): la hoja ocupa de y=8 a y=13, o sea que le queda
   apoyada por abajo y ASOMA POR ENCIMA DE LA CABEZA sin taparle la
   cara. Se probaron cinco combinaciones de ángulo, largo y posición; es
   la única en la que el papel sube del todo y la cara sigue entera. */
function papeleta(dx, dy){
  const X = CX + 6 + dx, Y = 8 + dy;
  caja(X,   Y,   5, 6, "W");              /* la hoja */
  caja(X+1, Y+1, 3, 1, "V");              /* la raya de arriba */
  px(X+1, Y+2, "R"); px(X+3, Y+2, "R");   /* la equis */
  px(X+2, Y+3, "R");
  px(X+1, Y+4, "R"); px(X+3, Y+4, "R");
  px(X, Y, "r");                          /* luz por la izquierda, como en la camiseta */
}

/* el despertador de dos campanas. Va DELANTE del brazo, como todo lo
   que Compi sostiene.

   Dos campanas y patas, y no un reloj redondo: a siete píxeles de ancho
   una circunferencia se lee como una moneda o como un plato. La
   silueta del despertador clásico -- dos orejas arriba, dos patas
   abajo -- se reconoce en miniatura ANTES de que se distinga la esfera,
   que es donde se juega esto.

   Las agujas van EN V y no en L, que fue el primer intento: tres
   píxeles en ángulo recto se leen como una letra pegada a la esfera. En
   V -- las diez y diez de toda la vida, que es como se dibuja un reloj
   cuando tiene que reconocerse pequeño -- se lee reloj y no letra. */
function despertador(dx, dy){
  const X = CX + 6 + dx, Y = 19 + dy;
  px(X+1, Y, "V"); px(X+5, Y, "V");       /* las campanas */
  caja(X,   Y+1, 7, 6, "V");              /* el marco */
  caja(X+1, Y+2, 5, 4, "W");              /* la esfera */
  px(X+2, Y+3, "R"); px(X+4, Y+3, "R");   /* las dos agujas, en V */
  px(X+3, Y+4, "R");                      /* y el eje */
  px(X+1, Y+7, "V"); px(X+5, Y+7, "V");   /* las patas */
  px(X, Y+1, "v");                        /* luz por la izquierda */
}

/* el sudor en la frente: tres píxeles sueltos sobre la piel, dos en la
   frente y uno en la sien. Sin brillo encima de cada gota: dos píxeles
   en vertical pegados al pelo se leen como un mechón azul, no como
   sudor. Va DESPUÉS de la cabeza, encima de la piel */
function sudorFrente(hy, dx){
  const X = CX - 5 + dx, y = hy;
  px(X+3, y+6, "C");
  px(X+7, y+6, "C");
  px(X+1, y+7, "C");
}

/* la gota gorda: la de manual, en el costado de la cabeza. Punta arriba,
   panza abajo, brillo dentro y sombra en el culo. Es el único detalle de
   Compi que se sale de la silueta a propósito, porque el chiste del
   cartel es literal -- «sudar la gota gorda» -- y tiene que verse a
   tamaño de miniatura */
function gotaGorda(hy, dx){
  const X = CX - 9 + dx, y = hy + 4;
  px(X+1, y, "C");                        /* la punta */
  caja(X,   y+1, 3, 1, "C");
  caja(X,   y+2, 4, 2, "C");              /* la panza */
  caja(X+1, y+4, 2, 1, "c");              /* sombra del culo */
  px(X, y+2, "L");                        /* brillo */
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
  admira:   [[0,0],[0,1],[0,3]],
  /* el pitido del detector: un arquito que abre a cada lado de la cabeza.
     Van en dos glifos y no en uno espejado porque px() no sabe voltear */
  ondaD:    [[0,0],[1,1],[0,2]],
  ondaI:    [[1,0],[0,1],[1,2]]
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
  detector(tt){
    /* EL DETECTOR DE HUMO · nueve cuadros en tres tiempos: tres
       escuchando, dos de caerle la ficha y cuatro de alarma. Los dos del
       medio son los que hacen falta -- con uno solo, 185 ms no dan para
       leer «promesa imposible» y la reacción se veía como un parpadeo.

       Es la única pose que repinta la camiseta, porque la gracia entera
       es que el rojo se lea en la burbuja de un chat a 60 px de alto,
       donde la cara ya no se distingue. */
    const f = Math.floor(tt/185) % 9;
    if(f < 3){
      return { fase:0, dy:0, lean: f===1 ? -1 : 0, cara:"normal",
        bI:{ang:100,len:5}, bD:{ang:80,len:5}, pI:{ang:96,len:4}, pD:{ang:84,len:4} };
    }
    if(f < 5){
      return { fase:0, dy: f===3 ? -1 : -2, cara:"sorpresa", admira:true,
        bI:{ang: f===3 ? 150 : 164, len:5}, bD:{ang: f===3 ? 30 : 16, len:5},
        pI:{ang:100,len:4}, pD:{ang:80,len:4} };
    }
    const ancho = f % 2 === 1;
    return { fase:0, dy: ancho ? -1 : -2, cara:"asustado",
      alarma:true, pitido: ancho ? 2 : 1,
      bI:{ang:238,len:6}, bD:{ang:302,len:6},
      pI:{ang:106,len:4}, pD:{ang:74,len:4} };
  },
  calor(tt){
    /* pasando calor y abanicándose: la cara cansada de siempre, el gotón
       y el abanico en la mano derecha, que se mueve dos posiciones. No
       hay más ciclo porque a este tamaño el movimiento del abanico ya se
       lee y mover el resto lo ensucia */
    const f = Math.floor(tt/220) % 2;
    return { fase:f, dy: f ? 0 : 1, cabY:1, cara:"cansado",
      sudor:true, gotaGorda:true, abanico:true,
      bI:{ang:96,len:5}, bD:{ang: f ? 320 : 304, len:6},
      pI:{ang:95,len:4}, pD:{ang:85,len:4} };
  },
  maleta(tt){
    /* de pie y con la maleta de cabina al costado: el viaje que todavía
       no ha salido, que es justo de lo que va el cartel -- el dinero se
       pide ANTES de subirse al tren.

       No anda, aunque sería lo suyo. Con la mano pegada al asa, mover
       las piernas deja la maleta clavada en el sitio: se lee como que la
       arrastra a peso y no como que rueda. Así que el único movimiento
       es el balanceo lento de `quieto` y el parpadeo, y de que eso no
       despegue la mano del asa se encarga el tubo, que telescopa.

       El brazo derecho va a 25 grados y no colgando: es lo que saca el
       puño fuera de la silueta y lo pone a la altura de la empuñadura.
       Con el brazo caído, el asa le nacía del muslo. */
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, maleta:true,
      cara: s>0.94 ? "parpadeo" : "normal",
      bI:{ang:100,len:5}, bD:{ang:25,len:5},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  padre(tt){
    /* de pie, contento y con el brazo de fuera bajado y ABIERTO hacia
       donde va el hijo, no pegado al costado.

       Es una pose y no `quieto` porque `quieto` usa la cara «normal»,
       que lleva boca de línea recta: a este tamaño y con un crío al
       lado, eso no se lee como serenidad, se lee como que lo lleva
       castigado. Con los arcos y la sonrisa de `feliz` el mismo cuerpo
       cuenta lo contrario.

       El brazo derecho a 58 grados y len 6 saca la mano fuera de la
       silueta por abajo, que es lo que hace que los dos muñecos se lean
       como un grupo y no como dos figuras que coinciden en la fila. */
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, cara:"feliz",
      bI:{ang:100,len:5}, bD:{ang:58,len:6},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  tarta(tt){
    /* soplando las velas, con gorro. Los brazos van abiertos y abajo, no
       juntos por delante: las manos tienen que salir a los DOS EXTREMOS
       del plato, que es lo que hace que la tarta se lea sostenida y no
       apoyada en la barriga */
    const f = Math.floor(tt/260) % 2;
    return { fase:f, dy:0, cara:"sopla", gorro:true, tarta:true, sinGalon:true,
      bI:{ang:108,len:6}, bD:{ang:72,len:6},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  patinete(tt){
    /* de pie y con el patinete agarrado, igual que `maleta` y por la misma
       razón: no anda. Con la mano pegada al manillar, mover las piernas
       deja el patinete clavado en el sitio y se lee como que lo arrastra
       a peso, no como que rueda. Así que solo el balanceo lento.

       El brazo derecho a 70 y len 6: a len 5 el puño cae dentro de la
       silueta y el manillar parece que sale del costado */
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, cara:"feliz", patinete:true,
      bI:{ang:100,len:5}, bD:{ang:70,len:6},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  plaza(tt){
    /* de pie al lado de su coche ya aparcado, y la cara hace media
       pieza: aquí no se reclama nada, se llega y se aparca. El cartel va
       de que venir a trabajar no cueste dinero NI LAS VUELTAS DE CADA
       MAÑANA, y eso solo se lee en el muñeco si está a gusto -- con la
       cara `normal`, la boca de línea recta lo deja esperando a que le
       abran.

       Quieto, como `maleta` y `patinete`: el coche está parado, y mover
       las piernas al lado de un objeto fijo se lee como que pasa de
       largo, que es justo lo contrario de lo que cuenta el cartel.

       Y los brazos son los de `quieto`, no los de `medico`: aquí no
       sostiene nada. El coche se apoya en el suelo, así que no hace
       falta sacar el puño del contorno para que se lean juntos. */
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, cara: s>0.94 ? "parpadeo" : "feliz",
      coche:true,
      bI:{ang:100,len:5}, bD:{ang:80,len:5},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  medico(tt){
    /* de pie, con el justificante en la mano derecha. NO HAY CICLO, solo
       el balanceo de `quieto`: este cartel va de un trámite, no de una
       urgencia, y mover el papel se lee como que lo está agitando para
       reclamar algo. Aquí no se reclama, se enseña.

       Y la cara va normal, no `cansado`: poner a Compi pachucho
       convierte la pieza en «estoy malo» cuando va de que la hora ya
       está concedida y solo cambia el sello. El brazo derecho sube a 62
       para que el puño caiga en el borde izquierdo de la hoja y se lea
       agarrada, no apoyada */
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, cara:"normal", justificante:true,
      bI:{ang:100,len:5}, bD:{ang:62,len:5},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  vota(tt){
    /* la mano arriba con la papeleta. No hay ciclo, solo el balanceo
       lento de `quieto`: el gesto de votar es el brazo quieto en alto,
       y moverlo lo convierte en saludar.

       El brazo derecho va a 296 grados y len 9, y ese 9 es la única
       licencia de la pose: los demás brazos miden 5 o 6. A esos largos
       la mano no sube -- a 270 y len 6 el puño cae DENTRO de la cara--
       y el gesto no se lee. A 9 el brazo se estira en diagonal, el puño
       sale limpio del contorno y la papeleta asoma por encima de la
       cabeza, que es lo que cuenta el gesto en una miniatura.

       Y la cara va `feliz`, no `normal`: esto no es una reclamación, es
       una mano levantada en una reunión. */
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, cara:"feliz", papeleta:true,
      bI:{ang:100,len:5}, bD:{ang:296,len:9},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  violeta(tt){
    /* de pie AL LADO del tótem, ni señalándolo ni sujetándolo. Es la
       misma quietud de `maleta` y `patinete`, y aquí importa más: la
       pieza va de que haya un sitio fijo, así que el muñeco tiene que
       leerse como que está ahí, no como que está haciendo algo.

       Cara `normal` y no `feliz`: el punto violeta no es una caseta de
       feria. Tampoco `serio`, que a este tamaño se lee como enfado y lo
       que se quiere es que alguien se acerque.

       El brazo derecho a 62 grados, como el de `medico`: saca el puño
       del contorno y lo deja por delante del poste, que es lo que
       impide que el muñeco y el tótem se lean como una sola mancha. */
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, cara: s>0.94 ? "parpadeo" : "normal",
      puntoVioleta:true,
      bI:{ang:100,len:5}, bD:{ang:62,len:5},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  reloj(tt){
    /* de pie con el despertador en la mano, igual que `medico` con el
       justificante y por lo mismo: aquí no se reclama, se enseña. El
       cartel va de saber la cuenta ANTES, no de protestar después, así
       que no hay ciclo -- solo el balanceo lento y el parpadeo.

       Brazo derecho a 62 grados, que es el que deja el puño justo bajo
       las patas del reloj: agarrado por abajo y no flotando al costado. */
    const s = Math.sin(tt/900);
    return { fase: s>0?1:0, dy: s>0.6?-1:0, cara: s>0.94 ? "parpadeo" : "normal",
      despertador:true,
      bI:{ang:100,len:5}, bD:{ang:62,len:5},
      pI:{ang:96,len:4}, pD:{ang:84,len:4} };
  },
  sillon(tt){
    /* sentado en la butaca, descansando de verdad: no hay ciclo de
       animación, solo un pestañeo lento -- lo que se quiere transmitir es
       que no está haciendo nada, así que moverlo lo estropea */
    const s = Math.sin(tt/1200);
    return { fase:0, dy:3, sillon:true,
      cara: s > 0.94 ? "parpadeo" : "feliz",
      bI:{ang:150,len:5}, bD:{ang:30,len:5},
      pI:{dx:-2, dy:3, kx:-3, ky:1}, pD:{dx:2, dy:3, kx:3, ky:1} };
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
  if(E.sillon) sillonDetras(ty, cy);
  pierna(-1, cy, E.pI);
  pierna(1,  cy, E.pD);
  brazo(-1, ty, inc, E.bI);
  caja(CX-2+inc, cy, 5, 1, "P"); px(CX+2+inc, cy, "p");
  tronco(ty, inc, !E.sinGalon);
  cabeza(hy, inc + Math.round(E.cabX || 0), E.cara || "normal", E.mira || M.mira);
  brazo(1, ty, inc, E.bD);
  if(E.sillon) sillonDelante(ty, cy);
  if(E.abanico) abanico(hy, inc + Math.round(E.cabX || 0), E.fase);
  if(E.maleta)  maleta(inc, dy);
  if(E.justificante) justificante(inc, dy);
  if(E.papeleta) papeleta(inc, dy);
  if(E.puntoVioleta) puntoVioleta(inc, dy);
  if(E.despertador) despertador(inc, dy);
  if(E.patinete) patinete(inc, dy);
  if(E.coche)   coche(inc);
  if(E.gorro)   gorro(hy, inc + Math.round(E.cabX || 0));
  if(E.tarta)   tarta(Math.round(E.dy || 0), E.fase);
  if(E.sudor)   sudorFrente(hy, inc + Math.round(E.cabX || 0));
  if(E.gotaGorda) gotaGorda(hy, inc + Math.round(E.cabX || 0));
  if(E.nota)   glifo("nota",   CX+8, hy-4, "C");
  if(E.admira) glifo("admira", CX+7, hy-5, "R");

  /* detalles flotantes -- corazón, chispas, gotón de sudor, lágrimas,
     estrellas, polvo -- solo si se piden con op.extras. Los carteles no los
     piden, así que su render no cambia ni un píxel; los GIF sí, que ahí el
     corazón del saludo y la gota del cansancio son media gracia */
  if(op.extras){
    if(E.corazon)  glifo("corazon", CX+7, hy-3, "R");
    if(E.chispa){  glifo("chispa",  CX+7, hy-5, "C"); glifo("chispa", CX-10, hy-2, "C"); }
    if(E.gota)     glifo("gota",    CX+6, hy+2, "C");
    /* el gotón por la izquierda: con el abanico en la mano derecha, el de
       siempre quedaba debajo de las varillas y no se veía */
    if(E.gotaIzq)  glifo("gota",    CX-9, hy+2, "C");
    if(E.estrellas){ glifo("estrella", CX+6, hy-4, "R"); glifo("estrella", CX-10, hy-3, "C"); }
    if(E.llanto){  glifo("gota",    CX-7, hy+8, "C");  glifo("gota", CX+6, hy+8, "C"); }
    if(E.polvo){   glifo("polvo",   CX-9, PISO-2, "V"); glifo("polvo", CX+7, PISO-2, "V"); }
    if(E.pitido){
      for(let i=0;i<E.pitido;i++){
        glifo("ondaD", CX+7+i*2, hy+1, "v");
        glifo("ondaI", CX-9-i*2, hy+1, "v");
      }
    }
  }
  contorno();

  /* la sombra del suelo, igual que en la web pero sin el aire del salto */
  ctx.clearRect(0, 0, An, Al);
  const aire = -Math.min(0, dy);
  const an = Math.max(4, 9 - aire);
  const alfa = Math.max(0.12, 0.40 - aire*0.06);
  const x0 = (CX - (an>>1))*esc, y0 = PISO*esc;
  ctx.fillStyle = "rgba(4,10,26,"+(alfa*0.55).toFixed(2)+")";
  ctx.fillRect(x0, y0, an*esc, esc);

  /* la camiseta en alarma: el detector de humo es la única pose que
     recolorea, y solo ella pone E.alarma, así que ningún cartel cambia.
     El galón coral del pecho se queda coral sobre coral -- o sea, se
     pierde -- y está bien: en alarma la camiseta es una mancha roja */
  const ALARMA = { C:"R", c:"v", L:"r" };
  const alarma = !!E.alarma;

  /* volcado por tramos de color, como en index.html */
  for(let y=0;y<REJ_H;y++){
    let x = 0;
    while(x < REJ_W){
      const k = B[y*REJ_W+x];
      if(!k){ x++; continue; }
      let n = 1;
      while(x+n < REJ_W && B[y*REJ_W+x+n] === k) n++;
      ctx.fillStyle = TINTA[(alarma && ALARMA[k]) ? ALARMA[k] : k];
      ctx.fillRect((M.izq ? (REJ_W - x - n) : x)*esc, y*esc, n*esc, esc);
      x += n;
    }
  }
}
