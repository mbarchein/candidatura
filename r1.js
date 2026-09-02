
/* ==================================================================
   1) DATOS DE LA CANDIDATURA  ←←←  EDITA SOLO ESTE BLOQUE
   ------------------------------------------------------------------
   Cada ficha del equipo, los monogramas del hero y las preguntas del
   quiz salen de aquí. Rellena lo que tengas y deja "" o null en lo
   que falte: la web lo oculta y el quiz no pregunta por ello.

     puesto     -> el cargo, tal y como sale en el directorio
     anios      -> años en Nazaríes (número)
     frase      -> en primera persona, breve y directa
     fraseCompi -> lo que diría de esa persona un compañero
     foto       -> retrato del bloque FOTOS de arriba
     comites    -> "seguridad" y/o "igualdad"

   Pendiente: el código de empleado de Francisco Javier Bolívar y de
   Laura Muñoz, las frases de todos y quién está en cada comité.
   ================================================================== */
const CANDIDATOS = [
  { n: 1, nombre:"Laura Muñoz Sola",                  codigo:"", mono:"LM", corto:"Laura Muñoz",           puesto:"Finance & Accounting Lead",        anios:null, suplente:false,
    frase:"",
    fraseCompi:"Sus años en la empresa le han dado experiencia y conocimiento para ayudarte, resolver tus dudas y defender lo que necesitamos para seguir creciendo juntos.",
    foto:FOTOS.munoz, comites:[] },
  { n: 2, nombre:"Raúl Navarro Raya",                 codigo:"RNA", mono:"RN", corto:"Raúl Navarro",          puesto:"People & Values Specialist",       anios:null, suplente:false,
    frase:"",
    fraseCompi:"Raúl empatiza y trata de buscar siempre la mejor solución ante cualquier problema.",
    foto:FOTOS.navarro, comites:[] },
  { n: 3, nombre:"María del Rocío Galindo Dengra",    codigo:"RGL", mono:"RG", corto:"Rocío Galindo",         puesto:"Customer Success Director",        anios:null, suplente:false,
    frase:"",
    fraseCompi:"Con Rocío puedes hablar de cualquier cosa, y te escucha de verdad.",
    foto:FOTOS.galindo, comites:[] },
  { n: 4, nombre:"José Pablo Fernández Guerra",       codigo:"PFE", mono:"JP", corto:"José Pablo Fernández",  puesto:"Engineering Technical Lead",       anios:null, suplente:false,
    frase:"Cada semana forma a los que llegan y escucha lo que traen. Cada día, a quien viene con una duda o un problema.",
    fraseCompi:"",
    foto:FOTOS.fernandez, comites:[] },
  { n: 5, nombre:"Rafael Ángel López Molina",         codigo:"RLM", mono:"RL", corto:"Rafael López",          puesto:"Engineering Technical Lead",       anios:13, suplente:false,
    frase:"Desde 2013 en la casa. Lo que mejor sabe hacer es escuchar un problema y darle orientación y solución.",
    fraseCompi:"",
    foto:FOTOS.lopezm, comites:[] },
  { n: 6, nombre:"Francisco Javier Bolívar Lupiáñez", codigo:"", mono:"FB", corto:"Fran Bolívar",          puesto:"Engineering Technical Lead",       anios:null, suplente:false,
    frase:"",
    fraseCompi:"Fran estaba de vacaciones el día de la foto: sale en la pantalla del fondo. Lo conocerás más de la Stamm que del organigrama.",
    foto:FOTOS.bolivar, comites:[] },
  { n: 7, nombre:"Leticia Algarra Ulierte",           codigo:"LAL", mono:"LA", corto:"Leticia Algarra",       puesto:"Project Management Specialist",    anios:8, suplente:false,
    frase:"",
    fraseCompi:"Leticia, cuidando de sus equipos cada día desde hace 8 años.",
    foto:FOTOS.algarra, comites:[] },
  { n: 8, nombre:"Mario Jesús Barchéin Molina",       codigo:"MBM", mono:"MB", corto:"Mario Barchéin",        puesto:"Engineering Technical Lead",       anios:null, suplente:false,
    frase:"",
    fraseCompi:"El abuelo de la candidatura: nadie lleva más años aquí, y sigue luchando por mejorar las condiciones de los trabajadores.",
    foto:FOTOS.barchein, comites:[] },
  { n: 9, nombre:"Mario Jesús Aranda Otero",          codigo:"MAA", mono:"MA", corto:"Mario Aranda",          puesto:"People & Values Specialist",       anios:null, suplente:false,
    frase:"",
    fraseCompi:"Mario Aranda, siempre cercano y a tu lado.",
    foto:FOTOS.aranda, comites:[] },
  { n:10, nombre:"Violeta López Amate",               codigo:"VLE", mono:"VL", corto:"Violeta López",         puesto:"Professional Services Specialist", anios:null, suplente:true ,
    frase:"",
    fraseCompi:"Violeta estaba de vacaciones el día de la foto. La conocerás más de la Stamm que del organigrama; su frase llegará con el bronceado.",
    foto:FOTOS.lopeza, comites:[] },
  { n:11, nombre:"María Emilia Castillo Álvarez",     codigo:"ECA", mono:"MC", corto:"María Emilia Castillo", puesto:"Professional Services Specialist", anios:null, suplente:true ,
    frase:"",
    fraseCompi:"Marie entró con 21 años y hoy forma a las nuevas incorporaciones.",
    foto:FOTOS.castillo, comites:[] }
];

/* ================== utilidades ================== */
const $  = (s,r=document)=>r.querySelector(s);
const el = (tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n;};
const corto = p => p.corto || p.nombre;
/* todas las descripciones van en tercera persona, sea de su puño o de un
   compañero: se lee siempre igual y da igual en qué campo esté */
const describe = p => p.frase || p.fraseCompi || "";
const barajar = a => { const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
const primeros = (a,n)=>barajar(a).slice(0,n);

function retrato(p, cls){
  const box = el("div", cls);
  if(p.foto){
    const img = document.createElement("img");
    img.src = p.foto; img.alt = p.nombre; img.loading = "lazy";
    box.appendChild(img);
  } else {
    box.textContent = p.mono || p.codigo;
  }
  return box;
}

/* ================== hero: las once piezas ================== */
(function crew(){
  const ul = $("#crew"); if(!ul) return;
  CANDIDATOS.forEach((p,i)=>{
    const li = el("li","crew__item");
    const a  = el("a"); a.href = "#p"+i;
    a.appendChild(retrato(p,"crew__disc"));
    a.appendChild(el("span","crew__name",corto(p)));
    li.appendChild(a); ul.appendChild(li);
  });
})();

/* ================== foto de grupo ================== */
(function grupo(){
  const fig = $("#grupo"), img = $("#foto-grupo");
  if(fig && img){ img.src = FOTO_GRUPO; fig.hidden = false; }
  const logo = $("#logo-nazaries");
  if(logo) logo.src = LOGO_NAZARIES;
  const logoPos = $("#logo-nazaries-pos");
  if(logoPos) logoPos.src = LOGO_NAZARIES_POS;
})();

/* ================== volver arriba ================== */
(function arriba(){
  const b = $("#arriba"); if(!b) return;
  const brusco = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  let visible = false;
  addEventListener("scroll", ()=>{
    const debe = window.scrollY > 700;
    if(debe !== visible){ visible = debe; b.classList.toggle("is-on", debe); }
  }, {passive:true});
  b.addEventListener("click", ()=>{
    window.scrollTo({top:0, behavior: brusco ? "auto" : "smooth"});
  });
})();

/* ================== fichas del equipo ================== */
(function equipo(){
  const ul = $("#people"); if(!ul) return;
  CANDIDATOS.forEach((p,i)=>{
    const li = el("li","person" + (p.suplente ? " person--sup" : "")); li.id = "p"+i;

    const top = el("div","person__top");
    top.appendChild(el("span","person__n", String(p.n)));
    top.appendChild(retrato(p,"person__mono"));
    const id = el("div");
    id.appendChild(el("p","person__name",p.nombre));
    const meta = [p.puesto || "Puesto por completar"];
    if(p.codigo) meta.unshift(p.codigo);
    if(p.anios) meta.push(p.anios + (p.anios===1?" año":" años"));
    if(p.suplente) meta.push("suplente");
    id.appendChild(el("p","person__meta",meta.join(" · ")));
    top.appendChild(id);
    li.appendChild(top);

    const cita = describe(p);
    li.appendChild(cita
      ? el("p","person__quote","“"+cita+"”")
      : el("p","person__quote person__quote--todo","Su frase, en cuanto la escriba."));

    const tags = el("div","tags");
    if((p.comites||[]).includes("seguridad")) tags.appendChild(el("span","tag","Comité de Seguridad y Salud"));
    if((p.comites||[]).includes("igualdad"))  tags.appendChild(el("span","tag tag--coral","Comisión de Igualdad"));
    if(tags.children.length) li.appendChild(tags);

    ul.appendChild(li);
  });
})();

/* ================== malla de nodos (eco del cartel) ================== */
function malla(canvas, densidad){
  if(!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  let semilla = 20240901;
  const rnd = ()=> (semilla = (semilla*1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  function pintar(){
    const claro = document.documentElement.dataset.tema === "claro";
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || 400;
    if(!w || !h) return;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);

    semilla = 20240901;
    const n = Math.max(18, Math.round(w*h/(densidad*1000)));
    const pts = Array.from({length:n},()=>({x:rnd()*w, y:rnd()*h, coral: rnd()>0.78}));
    const lim = Math.min(w,h) * 0.42 + 60;

    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.hypot(dx,dy);
        if(d<lim){
          ctx.strokeStyle = (claro ? "rgba(120,95,75," : "rgba(198,176,160,")+(0.13*(1-d/lim)).toFixed(3)+")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
        }
      }
    }
    pts.forEach(p=>{
      ctx.fillStyle = p.coral
        ? (claro ? "rgba(191,63,47,.5)"  : "rgba(244,121,107,.6)")
        : (claro ? "rgba(150,120,95,.4)" : "rgba(232,206,184,.45)");
      ctx.beginPath(); ctx.arc(p.x,p.y, p.coral?2.1:1.6, 0, Math.PI*2); ctx.fill();
    });
  }

  pintar();
  addEventListener("load", pintar, {once:true});
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(pintar);
  let t; addEventListener("resize",()=>{clearTimeout(t); t=setTimeout(pintar,180);},{passive:true});
  MALLAS.push(pintar);
}
const MALLAS = [];
malla($("#mesh-hero"), 26);
malla($("#mesh-close"), 34);

/* ================== tema claro / oscuro ================== */
(function tema(){
  const CLAVE = "candidatura-tema";
  const raiz = document.documentElement, bot = $("#tema");
  /* el claro es el tono por defecto; el oscuro solo si lo elige quien mira */
  let claro = true;
  try{ const v = localStorage.getItem(CLAVE); if(v) claro = v === "claro"; }catch(e){}
  function pinta(){
    if(claro) raiz.dataset.tema = "claro"; else delete raiz.dataset.tema;
    if(bot){
      bot.setAttribute("aria-pressed", claro ? "true" : "false");
      bot.setAttribute("aria-label", claro ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
    }
    /* las mallas están dibujadas a mano: hay que repintarlas */
    MALLAS.forEach(f => f());
  }
  pinta();
  if(bot) bot.addEventListener("click", ()=>{
    claro = !claro;
    try{ localStorage.setItem(CLAVE, claro ? "claro" : "oscuro"); }catch(e){}
    pinta();
  });
})();

/* ==================================================================
   COMPI, la mascota
   ------------------------------------------------------------------
   Ya no son fotogramas dibujados a mano. Hay un muñeco de píxeles con
   esqueleto —cabeza, tronco, dos brazos y dos piernas— que se pinta en
   una rejilla de 27x36: cada pose mueve ángulos, el contorno oscuro se
   calcula dilatando la silueta y encima van las partículas (polvo al
   correr, notas al bailar, estrellas al marearse, lágrimas al llorar).

   Y se juega con él: si le acercas el ratón se asusta y sale corriendo
   por su carril, rebota en los bordes y te esquiva. Si le pillas, ve
   estrellas y lo dice. Si fallas el clic, te guiña un ojo.
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

/* poses que mandan sobre la persecución mientras duran */
const RELOJ = { alerta:230, pillado:2100, celebra:1400, chasco:1500, saluda:1650, chuleo:1300,
                serio:1500, carcajada:1000, fuga:1800 };

/* ================== frases ================== */
const F_PILLADO = [
  "¡Vale, me pillaste!",
  "Otra vez. Vaya reflejos.",
  "Tres. Tú ganas, me quedo quieto.",
  "Ya somos amigos, ¿no?"
];
const F_CHULEO = ["¿No me pillas?", "Casi.", "Más rápido, anda.", "Aquí sigo."];
const F_RISA = ["¡Ja, ja! ¡Para!", "¡Jajaja, no puedo!", "¡Ay, que me muero!"];
const F_SERIO = "¡Ya está bien, que ya no hace gracia!";
const F_CARCAJADA = "…ja, ja, ja. ¡Me piro!";
const F_COSQUILLAS = [
  "¡Cuidado, que tengo cosquillas!",
  "¡Eh! Que tengo cosquillas.",
  "Cuidado… ¡cosquillas!",
  "¡Sin tocar, que tengo cosquillas!"
];
const F_HOLA   = ["¡Hola! Soy Compi.", "Once compañerxs. Cero siglas.", "Baja al reto y juega."];

/* ================== el ratón, una sola vez para todos ================== */
const raton = { x:-9999, y:-9999, t:-9999, fino:false };
addEventListener("pointermove", ev=>{
  raton.x = ev.clientX; raton.y = ev.clientY; raton.t = performance.now();
  raton.fino = ev.pointerType !== "touch";
}, {passive:true});
addEventListener("blur", ()=>{ raton.t = -9999; });

const MASCOTAS = {};
const VIVAS = [];

function crearMascota(canvas, esc, op){
  if(!canvas || !canvas.getContext) return null;
  op = op || {};
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const An = REJ_W*esc, Al = REJ_H*esc;

  canvas.style.width  = An + "px";
  canvas.style.height = Al + "px";
  canvas.width  = Math.round(An*dpr);
  canvas.height = Math.round(Al*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.imageSmoothingEnabled = false;

  const pista = op.pista || null;
  const globo = op.globo || null;
  const juega = !!pista && !QUIETO;
  if(pista) pista.style.height = Al + "px";
  if(globo) globo.style.bottom = (Al - CAB*esc + 4) + "px";

  const M = {
    modo:"baile", tModo:0, hasta:0, fase:-1, tPinta:0,
    x:0, casa:0, vx:0, izq:false, esquiva:0, persigo:0, lejos:0,
    capturas:0, fallos:0, mira:{x:0,y:1}, trozos:[], huella:null,
    parp:0, parpHasta:0, rect:null, tRect:0, visible:true, pista:false, ultDicho:-9999, cosquillas:0
  };
  let globoT = 0;

  /* ---------- sitio de reposo: derecha del carril o centro ---------- */
  function colocar(){
    if(!pista) return;
    const max = Math.max(0, pista.clientWidth - An);
    M.casa = op.casa === "centro" ? max/2 : max;
    if(M.modo === "baile" || M.modo === "cansado" || M.modo === "quieto"){
      M.x = M.casa; M.vx = 0; M.izq = false;
      canvas.style.transform = "translate3d(" + Math.round(M.x) + "px,0,0)";
      if(globo) globo.style.translate = "calc(-50% + " + Math.round(M.x + An/2) + "px)";
    }
  }

  /* ---------- decir algo ---------- */
  function decir(txt, ms){
    if(!globo) return;
    M.ultDicho = performance.now();
    globo.textContent = txt;
    globo.classList.add("is-on");
    clearTimeout(globoT);
    globoT = setTimeout(()=>globo.classList.remove("is-on"), ms || 2000);
  }

  /* ---------- partículas ---------- */
  function soltar(tipo,x,y,vx,vy,vida,col,g){
    if(M.trozos.length > 60) return;
    M.trozos.push({tipo,x,y,vx,vy,v:vida,vm:vida,col,g:g||0});
  }
  function chispear(E){
    if(E.nota)  soltar("nota", CX + (Math.random()>0.5?5:-6), CAB+2, (Math.random()-0.5)*4, -7, 1.2, TINTA.L);
    if(E.polvo) soltar("polvo", CX + (M.izq?3:-3), 30, (M.izq?8:-8), -3.5, 0.55, "rgba(196,216,240,.55)", 9);
    if(E.gota)  soltar("gota", CX+7, CAB+4, 2.5, 7, 0.7, TINTA.L, 6);
    if(E.lagrima){
      soltar("gota", CX-4, CAB+13, -2.5, 6, 0.8, TINTA.L, 16);
      soltar("gota", CX+3, CAB+13,  2.5, 6, 0.8, TINTA.L, 16);
    }
    if(E.corazon) soltar("corazon", CX+5, CAB+1, 1.5, -6, 1.2, TINTA.r);
    if(E.chispa) for(let i=0;i<3;i++)
      soltar("chispa", CX+(Math.random()-0.5)*12, CAB+Math.random()*6,
             (Math.random()-0.5)*13, -6-Math.random()*5, 0.8, i%2 ? TINTA.r : TINTA.L, 12);
  }
  function estrellas(ahora, hy){
    for(let i=0;i<3;i++){
      const a = ahora/230 + i*2.094;
      glifo("estrella", CX + Math.cos(a)*6.5 - 1, (hy-3) + Math.sin(a)*1.8 - 1, i%2 ? "R" : "L");
    }
  }

  /* ---------- pintado ---------- */
  function sombra(dy){
    const aire = -Math.min(0, dy);
    const an = Math.max(4, 9 - aire);
    const a  = Math.max(0.12, 0.40 - aire*0.06);
    const x0 = (CX - (an>>1))*esc, y0 = PISO*esc;
    ctx.fillStyle = "rgba(4,10,26,"+a.toFixed(2)+")";
    ctx.fillRect(x0, y0, an*esc, esc);
    ctx.fillStyle = "rgba(4,10,26,"+(a*0.4).toFixed(2)+")";
    ctx.fillRect(x0 - 2*esc, y0, 2*esc, esc);
    ctx.fillRect(x0 + an*esc, y0, 2*esc, esc);
  }
  function volcar(){
    for(let y=0;y<REJ_H;y++){
      let x = 0;
      while(x < REJ_W){
        const k = B[y*REJ_W+x];
        if(!k){ x++; continue; }
        let n = 1;
        while(x+n < REJ_W && B[y*REJ_W+x+n] === k) n++;
        ctx.fillStyle = TINTA[k];
        const dx = M.izq ? (REJ_W - x - n) : x;
        ctx.fillRect(dx*esc, y*esc, n*esc, esc);
        x += n;
      }
    }
  }
  function trocear(){
    for(let i=M.trozos.length-1;i>=0;i--){
      const p = M.trozos[i];
      p.x += p.vx*0.08; p.y += p.vy*0.08; p.vy += p.g*0.08; p.v -= 0.08;
      if(p.v <= 0){ M.trozos.splice(i,1); continue; }
      ctx.globalAlpha = cepo(p.v/(p.vm*0.55), 0, 1);
      ctx.fillStyle = p.col;
      const g = GLIFO[p.tipo] || GLIFO.punto;
      for(let j=0;j<g.length;j++)
        ctx.fillRect((Math.round(p.x)+g[j][0])*esc, (Math.round(p.y)+g[j][1])*esc, esc, esc);
    }
    ctx.globalAlpha = 1;
  }

  function pintar(ahora){
    const E = (POSES[M.modo] || POSES.baile)(ahora - M.tModo, M);

    if(ahora >= M.parp){ M.parp = ahora + 2600 + Math.random()*3400; M.parpHasta = ahora + 130; }
    let cara = E.cara || "normal";
    if(ahora < M.parpHasta && (cara==="normal" || cara==="feliz")) cara = "parpadeo";

    if(E.fase !== M.fase){ M.fase = E.fase; chispear(E); }

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
    cabeza(hy, inc + Math.round(E.cabX || 0), cara, E.mira || M.mira);
    brazo(1, ty, inc, E.bD);
    if(E.llanto){
      /* dos churretes que bajan por la cara y se alargan al hipar */
      const cx2 = CX - 5 + inc + Math.round(E.cabX || 0);
      const largo = E.fase % 2 ? 3 : 2;
      for(let i=0;i<largo;i++){ px(cx2+2, hy+9+i, "L"); px(cx2+8, hy+9+i, "L"); }
      caja(cx2+1, hy+9+largo, 2, 1, "L"); caja(cx2+7, hy+9+largo, 2, 1, "L");
    }
    if(E.admira)   glifo("admira", CX+7, hy-5, "R");
    if(E.estrellas) estrellas(ahora, hy);
    contorno();

    ctx.clearRect(0, 0, An, Al);
    sombra(dy);
    volcar();
    trocear();
    M.huella = B.slice();
  }

  /* ---------- estados ---------- */
  function cambiar(modo, ahora, ms){
    M.modo = modo; M.tModo = ahora; M.hasta = ms ? ahora+ms : 0; M.fase = -1;
  }
  function relojear(ahora){
    if(!M.hasta || ahora < M.hasta) return;
    M.hasta = 0;
    if(M.modo === "alerta"){ cambiar("corre", ahora); M.persigo = ahora; return; }
    if(M.modo === "serio"){
      /* aguanta el tipo un segundo y se le escapa la risa */
      cambiar("carcajada", ahora, RELOJ.carcajada);
      decir(F_CARCAJADA, RELOJ.carcajada + 400);
      return;
    }
    if(M.modo === "carcajada"){
      /* y sale corriendo hacia el lado contrario al ratón */
      const r = M.rect;
      const cx = r ? r.left + M.x + An/2 : 0;
      const dir = (r && raton.x > cx) ? -1 : 1;
      M.izq = dir < 0; M.vx = dir * 430;
      cambiar("fuga", ahora, RELOJ.fuga);
      return;
    }
    cambiar(M.capturas >= 3 ? "cansado" : "baile", ahora);
    if(pista) M.vx = 0;
  }
  function marco(ahora){
    if(!M.rect || ahora - M.tRect > 140){ M.rect = (pista||canvas).getBoundingClientRect(); M.tRect = ahora; }
    return M.rect;
  }
  function mirar(ahora){
    const r = marco(ahora);
    if(!r.width || !raton.fino || ahora - raton.t > 2800){ M.mira.x = 0; M.mira.y = 1; return null; }
    const cx = r.left + (pista ? M.x : 0) + An/2;
    const cy = r.top + Al*0.42;
    M.mira.x = raton.x > cx+16 ? 1 : raton.x < cx-16 ? -1 : 0;
    M.mira.y = raton.y < cy-30 ? 0 : 1;
    return {cx, cy, d: Math.hypot(cx-raton.x, cy-raton.y), max: Math.max(0, r.width - An)};
  }

  /* el ratón está sobre el bicho, no solo sobre el lienzo transparente */
  function dentroDelMuneco(r){
    if(!r || !r.width) return false;
    const lx = raton.x - (r.left + M.x), ly = raton.y - r.top;
    if(lx < 0 || ly < 0 || lx >= An || ly >= Al) return false;
    return tocado(lx, ly);
  }

  function perseguir(ahora, dt){
    const v = mirar(ahora);
    const r = M.rect;
    if(!v) { if(M.modo==="corre"||M.modo==="alerta") cambiar("vuelve", ahora); }
    const max = v ? v.max : Math.max(0, (M.rect ? M.rect.width : An) - An);
    M.casa = op.casa === "centro" ? max/2 : max;
    if(M.hasta){
      /* pose con reloj: el sprint mantiene la velocidad y rebota; el resto frena */
      if(M.modo === "corre" || M.modo === "fuga"){
        const px2 = M.x + M.vx*dt;
        if(px2 <= 0 || px2 >= max){ M.vx = -M.vx; M.izq = M.vx < 0; }
      } else M.vx *= 0.82;
      M.x = cepo(M.x + M.vx*dt, 0, max);
      return;
    }

    /* ¿tiene el cursor encima de los píxeles del muñeco? */
    const encima = !!v && dentroDelMuneco(r);
    const TOPE = 7000;

    if(encima){
      M.lejos = 0;
      M.cosquillas += dt*1000;
      if(M.cosquillas > TOPE){
        M.cosquillas = 0;
        cambiar("serio", ahora, RELOJ.serio); M.vx = 0;
        decir(F_SERIO, RELOJ.serio + 200);
        return;
      }
      if(M.modo !== "risa"){
        cambiar("risa", ahora);
        if(ahora - M.ultDicho > 4200) decir(azar(F_RISA), 1700);
      }
      M.vx *= 0.7;
      M.x = cepo(M.x + M.vx*dt, 0, max);
      return;
    }
    M.cosquillas = Math.max(0, M.cosquillas - dt*400);

    const RADIO = 205;
    if(v && v.d < RADIO){
      M.lejos = 0;
      if(M.modo !== "corre" && M.modo !== "alerta"){
        cambiar("alerta", ahora, RELOJ.alerta); M.vx = 0;
        if(ahora - M.ultDicho > 6000) decir(azar(F_COSQUILLAS), 1900);
      }
      if(M.modo === "corre"){
        let dir = v.cx < raton.x ? -1 : 1;
        if((M.x <= 1 && dir < 0) || (M.x >= max-1 && dir > 0)){ dir = -dir; M.esquiva = ahora + 430; }
        const prisa = M.esquiva > ahora ? 1.75 : 1 + (RADIO - v.d)/RADIO*0.9;
        M.vx = dir * 195 * (M.capturas >= 3 ? 0.55 : 1) * prisa;
        M.izq = dir < 0;
        if(ahora - M.persigo > 4300){ cambiar("chuleo", ahora, RELOJ.chuleo); M.vx = 0; decir(azar(F_CHULEO), 1300); }
      }
    } else {
      if(!M.lejos) M.lejos = ahora;
      if((M.modo === "corre" || M.modo === "alerta" || M.modo === "risa") && ahora - M.lejos > 650) cambiar("vuelve", ahora);
      if(M.modo === "vuelve"){
        const dif = M.casa - M.x;
        if(Math.abs(dif) < 3){ M.x = M.casa; M.vx = 0; cambiar(M.capturas >= 3 ? "cansado" : "baile", ahora); }
        else { M.vx = Math.sign(dif)*115; M.izq = dif < 0; }
      } else if(M.modo === "baile" || M.modo === "cansado" || M.modo === "quieto"){
        M.vx = 0; M.izq = false;
        if(Math.abs(M.x - M.casa) > 1) M.x = M.casa;   /* si cambia el ancho, se recoloca */
      }
    }
    M.x = cepo(M.x + M.vx*dt, 0, max);
  }

  /* ---------- clic ---------- */
  function tocado(cx, cy){
    if(!M.huella) return true;
    const gx = Math.floor(cx/esc), gy = Math.floor(cy/esc);
    for(let j=-1;j<=1;j++) for(let i=-1;i<=1;i++){
      const x = M.izq ? (REJ_W-1-(gx+i)) : (gx+i), y = gy+j;
      if(x<0||y<0||x>=REJ_W||y>=REJ_H) continue;
      const k = M.huella[y*REJ_W+x];
      if(k && k !== "O") return true;
    }
    return false;
  }
  function capturar(ahora){
    M.capturas++;
    cambiar("pillado", ahora, RELOJ.pillado);
    M.vx = 0;
    for(let i=0;i<5;i++)
      soltar("chispa", CX+(Math.random()-0.5)*14, CAB+4+Math.random()*8,
             (Math.random()-0.5)*16, -4-Math.random()*6, 0.7, i%2 ? TINTA.r : TINTA.L, 14);
    decir(F_PILLADO[Math.min(M.capturas-1, F_PILLADO.length-1)], 2400);
  }
  canvas.addEventListener("pointerdown", ev=>{
    const ahora = performance.now();
    if(!juega){ decir(azar(F_HOLA), 2200); cambiar("saluda", ahora, RELOJ.saluda); return; }
    if(tocado(ev.offsetX, ev.offsetY)){ capturar(ahora); return; }
    M.fallos++;
    M.esquiva = ahora + 520;
    soltar("polvo", CX, 26, (Math.random()-0.5)*14, -6, 0.5, "rgba(196,216,240,.5)", 10);
    const r = marco(ahora);
    const dir = ev.clientX > r.left + M.x + An/2 ? -1 : 1;
    M.izq = dir < 0;
    if(ev.pointerType === "touch"){
      /* con el dedo no hay ratón que seguir: al fallar, sale disparado un momento */
      M.vx = dir * 360;
      cambiar("corre", ahora, 950);
      decir(azar(F_COSQUILLAS), 1900);
    } else if(M.fallos % 2 === 0 && M.modo === "corre"){
      cambiar("chuleo", ahora, RELOJ.chuleo); M.vx = 0; decir(azar(F_CHULEO), 1300);
    } else {
      decir(azar(F_COSQUILLAS), 1900);
    }
  });
  canvas.addEventListener("keydown", ev=>{
    if(ev.key !== "Enter" && ev.key !== " ") return;
    ev.preventDefault();
    cambiar("saluda", performance.now(), RELOJ.saluda);
    decir(azar(F_HOLA), 2400);
  });

  /* ---------- solo trabaja si se ve ---------- */
  if(window.IntersectionObserver){
    new IntersectionObserver(e=>{ M.visible = e[0].isIntersecting; }, {rootMargin:"120px"})
      .observe(pista || canvas);
  }

  const inst = {
    tic(ahora, dt){
      if(!M.visible) return;
      relojear(ahora);
      if(juega) perseguir(ahora, dt);
      else mirar(ahora);
      if(ahora - M.tPinta >= 78){ M.tPinta = ahora; pintar(ahora); }
      if(pista){
        canvas.style.transform = "translate3d(" + Math.round(M.x) + "px,0,0)";
        if(globo) globo.style.translate = "calc(-50% + " + Math.round(M.x + An/2) + "px)";
      }
    },
    reaccion(nueva, ms){
      const ahora = performance.now();
      cambiar(POSES[nueva] ? nueva : "baile", ahora, ms || 1500);
      if(QUIETO) pintar(ahora);
    },
    saluda(txt){
      cambiar("saluda", performance.now(), RELOJ.saluda);
      if(txt) decir(txt, 2600);
    },
    pista(txt){ if(!M.pista && raton.fino){ M.pista = true; decir(txt, 2600); } }
  };

  colocar();
  addEventListener("load", colocar, {once:true});
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(colocar);
  let tRe;
  addEventListener("resize", ()=>{ clearTimeout(tRe); tRe = setTimeout(colocar, 160); }, {passive:true});

  if(QUIETO){
    M.modo = "quieto";
    pintar(performance.now());
    canvas.addEventListener("pointerdown", ()=>decir("Hoy no corro. ¡Hola!", 2200));
  } else {
    VIVAS.push(inst);
  }
  return inst;
}

/* ---------- un solo bucle para todas ---------- */
let tPrev = 0;
function bucle(ahora){
  const dt = tPrev ? Math.min(0.05, (ahora - tPrev)/1000) : 0.016;
  tPrev = ahora;
  for(let i=0;i<VIVAS.length;i++) VIVAS[i].tic(ahora, dt);
  requestAnimationFrame(bucle);
}
if(!QUIETO) requestAnimationFrame(bucle);

MASCOTAS.hero  = crearMascota($("#mascota-hero"), 6,
                  { pista:$("#compi-hero"), globo:$("#globo-hero"), casa:"der" });
MASCOTAS.quiz  = crearMascota($("#mascota-quiz"), 3);
MASCOTAS.close = crearMascota($("#mascota-close"), 5,
                  { pista:$("#compi-pie"), globo:$("#globo-pie"), casa:"centro" });

/* la primera vez, que se sepa que se puede jugar con él */
if(MASCOTAS.hero) setTimeout(()=>MASCOTAS.hero.pista("¡Píllame si puedes!"), 3200);
