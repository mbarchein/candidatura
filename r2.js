
/* ==================================================================
   2) EL RETO: banco de preguntas, motor de juego y ranking común
   ================================================================== */

/* ---- preguntas que no dependen de las fichas ---- */
const FIJAS = [
  { kind:"La candidatura", text:"¿Cuántas personas formamos la lista?",
    opts:["11","9","15","7"], right:0 },
  { kind:"La candidatura", text:"¿A qué sindicato representamos?",
    opts:["A ninguno: somos lista independiente","A dos, en coalición","Al mayoritario del sector","Al del convenio provincial"], right:0 },
  { kind:"La candidatura", text:"¿Cómo pudimos presentarnos sin sindicato detrás?",
    opts:["Reuniendo firmas de compañerxs","Pagando una tasa","Con el permiso de la dirección","Por sorteo entre voluntarios"], right:0 },
  { kind:"El programa", text:"¿Cuál de estas frases NO es uno de nuestros cuatro compromisos?",
    opts:["Subir el salario base un 10% el primer año","Auditar el clima laboral periódicamente","Defender la flexibilidad horaria","Comunicación bidireccional con la dirección"], right:0 },
  { kind:"El programa", text:"De los cuatro compromisos, ¿cuál habla de espacios de descanso?",
    opts:["Ambiente","Conciliación","Comunicación","Escucha"], right:0 },
  { kind:"El lema", text:"Completa: “Sin siglas. Solo ______.”",
    opts:["compañerxs","promesas","futuro","votos"], right:0 },
  { kind:"El comité", text:"¿Cuánto dura el mandato de un comité de empresa?",
    opts:["4 años","1 año","2 años","Hasta que dimita alguien"], right:0 },
  { kind:"La votación", text:"¿Qué día se vota?",
    opts:["El 29 de septiembre","El 29 de octubre","El 15 de septiembre","Aún no hay fecha"], right:0 },
  { kind:"La candidatura", text:"¿Quién encabeza la lista?",
    opts:["Laura Muñoz Sola","Rafael Ángel López Molina","Mario Jesús Barchéin Molina","María del Rocío Galindo Dengra"], right:0 },
  { kind:"La candidatura", text:"¿Cuántas personas van como suplentes?",
    opts:["Dos","Ninguna","Una","Cuatro"], right:0 },
  { kind:"El comité", text:"¿Quién fija el horario y el lugar de la votación?",
    opts:["La mesa electoral","La dirección de la empresa","Las candidaturas","El sindicato con más votos"], right:0 },
  { kind:"El comité", text:"¿Hay que estar afiliado a un sindicato para votar?",
    opts:["No, vota toda la plantilla del censo","Sí, siempre","Solo si te presentas","Solo con contrato indefinido"], right:0 },
  { kind:"El comité", text:"El voto en estas elecciones es…",
    opts:["Personal, libre, directo y secreto","A mano alzada en asamblea","Delegable en otra persona","Público y firmado"], right:0 },
  { kind:"La candidatura", text:"¿En qué órganos ya participan algunos de nosotros?",
    opts:["Comité de Seguridad y Salud y Comisión de Igualdad","En el consejo de administración","En ninguno todavía","En el comité de dirección"], right:0 }
];

/* ---- preguntas generadas a partir de las fichas rellenas ---- */
/* La descripción se usa también como pregunta del reto. Si lleva el nombre
   dentro —"Raúl empatiza...", "Con Rocío puedes hablar..."— la respuesta
   viene regalada, así que ahí se tapa. En la ficha se sigue viendo entera. */
function tapaNombre(p, txt){
  const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const piezas = (p.nombre + " " + corto(p) + " " + (p.mote || "")).split(/\s+/).filter(w => w.length > 3);
  let t = txt;
  for(const w of piezas)
    t = t.replace(new RegExp("(^|[^\\p{L}])" + esc(w) + "(?![\\p{L}])", "giu"), "$1———");
  return t;
}

function opciones(correcta, distractores){
  const lista = barajar([correcta].concat(distractores));
  return { opts: lista, right: lista.indexOf(correcta) };
}
function otrosNombres(p, n){
  return primeros(CANDIDATOS.filter(x=>x!==p), n).map(corto);
}

function preguntasPersonas(){
  const out = [];

  CANDIDATOS.filter(p=>p.foto).forEach(p=>{
    out.push(Object.assign({ kind:"Pon cara al nombre", text:"¿Quién es?", foto:p.foto },
      opciones(corto(p), otrosNombres(p,3))));
  });

  CANDIDATOS.filter(p=>p.codigo).forEach(p=>{
    out.push(Object.assign({ kind:"Quién es quién", text:"¿De quién es este código de empleado?", mono:p.codigo },
      opciones(corto(p), otrosNombres(p,3))));
  });

  const conPuesto = CANDIDATOS.filter(p=>p.puesto);
  const puestos = [...new Set(conPuesto.map(p=>p.puesto))];
  if(puestos.length >= 4){
    conPuesto.forEach(p=>{
      const otros = primeros(puestos.filter(d=>d!==p.puesto), 3);
      if(otros.length===3) out.push(Object.assign({ kind:"Quién hace qué", text:"¿Cuál es el puesto de "+corto(p)+"?" },
        opciones(p.puesto, otros)));
    });
  }

  CANDIDATOS.filter(p=>describe(p)).forEach(p=>{
    out.push(Object.assign({ kind:"¿De quién hablamos?", text:"¿A quién describe esta frase?", quote:tapaNombre(p, describe(p)) },
      opciones(corto(p), otrosNombres(p,3))));
  });

  const conAnios = CANDIDATOS.filter(p=>typeof p.anios === "number");
  if(conAnios.length >= 4){
    const cuatro = primeros(conAnios, 4);
    const veterano = cuatro.slice().sort((a,b)=>b.anios-a.anios)[0];
    const nombres = barajar(cuatro.map(corto));
    out.push({ kind:"Veteranía", text:"¿Quién de estos lleva más tiempo en Nazaríes?",
      opts:nombres, right:nombres.indexOf(corto(veterano)) });
  }

  ["seguridad","igualdad"].forEach(c=>{
    const dentro = CANDIDATOS.filter(p=>(p.comites||[]).includes(c));
    const fuera  = CANDIDATOS.filter(p=>!(p.comites||[]).includes(c));
    if(dentro.length && fuera.length >= 3){
      const p = primeros(dentro,1)[0];
      out.push(Object.assign({ kind:"Ya estamos ahí",
        text: c==="seguridad" ? "¿Quién forma parte del Comité de Seguridad y Salud?"
                              : "¿Quién forma parte de la Comisión de Igualdad?" },
        opciones(corto(p), primeros(fuera,3).map(corto))));
    }
  });

  return out;
}

const PREGUNTAS = 12;

function montarQuiz(){
  /* como máximo tres del mismo tipo, para que no se repita el formato */
  const vistas = {};
  const personas = barajar(preguntasPersonas()).filter(q=>{
    vistas[q.kind] = (vistas[q.kind]||0) + 1;
    return vistas[q.kind] <= 3;
  }).slice(0, Math.ceil(PREGUNTAS/2));
  /* las fijas traen la respuesta escrita en la primera opción: si no se
     mezclan, quien se dé cuenta acierta todas pulsando siempre la A */
  const fijas = barajar(FIJAS).slice(0, Math.max(0, PREGUNTAS - personas.length)).map(q =>
    Object.assign({}, q, opciones(q.opts[q.right], q.opts.filter((_,i)=> i !== q.right))));
  return barajar(personas.concat(fijas)).slice(0, PREGUNTAS);
}

/* ==================================================================
   MÚSICA · un chiptune sintetizado aquí mismo
   ------------------------------------------------------------------
   La web se publica como un único HTML y no puede cargar audio de
   fuera, así que no hay fichero de sonido: la melodía se genera con
   osciladores de Web Audio. Es original —La menor, 128 ppm, vuelta de
   cuatro compases sobre Am · F · C · G— así que no hay licencia de
   nadie que respetar.

   Suena solo mientras juegas, entra con un fundido de un segundo y se
   corta al terminar. El botón "Música" lo silencia todo (melodía y
   efectos) y la elección se recuerda en este navegador.
   ================================================================== */
const MUSICA = (function(){
  const CLAVE = "candidatura-son";
  const BPM = 128, PASO = 60/BPM/4, VOL = 0.45;   /* medido: pico -9.5 dB, rms -29 dB */

  /* 1=La 2=Si 3=Do 4=Re 5=Mi 6=Fa 7=Sol · de la 8 en adelante, octava de arriba */
  const GRADO = {"1":0,"2":2,"3":3,"4":5,"5":7,"6":8,"7":10,"8":12,"9":14,"a":15,"b":17,"c":19};
  const hz = n => 110 * Math.pow(2, n/12);

  /* cada cadena son cuatro compases de dieciséis semicorcheas */
  const BAJO  = "1.1.1.1.1.1.1.1." + "6.6.6.6.6.6.6.6." + "3.3.3.3.3.3.3.3." + "7.7.7.7.7.7.7.5.";
  const ARPA  = "1357135713571357" + "68a68a68a68a68a6" + "3573573573573573" + "79b79b79b79b79b7";
  const MELO  = "1..35..43.1....." + "6..8a..98......." + "3..57..53.4....." + "2..45..42.1.....";
  const BOMBO = "1.......1.......";
  const CAJA  = "....1.......1...";
  const CHARLES = ".1.1.1.1.1.1.1.1";

  let ac = null, maestro = null, efectos = null, ruido = null;
  let paso = 0, proximo = 0, reloj = 0, tocando = false;
  let on = true;
  try{ on = localStorage.getItem(CLAVE) !== "0"; }catch(e){}

  function bufferRuido(){
    const n = Math.floor(ac.sampleRate * 0.3);
    const b = ac.createBuffer(1, n, ac.sampleRate);
    const d = b.getChannelData(0);
    for(let i=0;i<n;i++) d[i] = Math.random()*2 - 1;
    return b;
  }

  /* una nota: oscilador con envolvente corta, como un chip de 8 bits */
  function voz(destino, f, t, dur, tipo, gan){
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gan, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(destino);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function percu(destino, t, dur, corte, gan){
    const s = ac.createBufferSource(); s.buffer = ruido;
    const f = ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = corte;
    const g = ac.createGain();
    g.gain.setValueAtTime(gan, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(destino);
    s.start(t); s.stop(t + dur + 0.02);
  }
  function bombo(destino, t){
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    g.gain.setValueAtTime(0.42, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    o.connect(g); g.connect(destino);
    o.start(t); o.stop(t + 0.2);
  }

  /* un paso del secuenciador */
  function programa(destino, p, t){
    const i = p % 64, j = i % 16;
    let c = BAJO[i]; if(c !== ".") voz(destino, hz(GRADO[c] - 12), t, PASO*1.7,  "square", 0.15);
    c = ARPA[i];     if(c !== ".") voz(destino, hz(GRADO[c] + 12), t, PASO*0.85, "square", 0.06);
    c = MELO[i];     if(c !== ".") voz(destino, hz(GRADO[c] + 24), t, PASO*2.6,  "square", 0.17);
    if(BOMBO[j]   !== ".") bombo(destino, t);
    if(CAJA[j]    !== ".") percu(destino, t, 0.11,  1400, 0.15);
    if(CHARLES[j] !== ".") percu(destino, t, 0.035, 7000, 0.045);
  }

  function crea(){
    if(ac) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return false;
    try{ ac = new AC(); }catch(e){ return false; }
    maestro = ac.createGain(); maestro.gain.value = 0.0001;
    efectos = ac.createGain(); efectos.gain.value = 0.45;
    const suave = ac.createBiquadFilter(); suave.type = "lowpass"; suave.frequency.value = 6200;
    const comp = ac.createDynamicsCompressor();
    maestro.connect(suave); efectos.connect(suave);
    suave.connect(comp); comp.connect(ac.destination);
    ruido = bufferRuido();
    return true;
  }

  /* se programa con adelanto para que no se oigan saltos */
  function agenda(){
    while(proximo < ac.currentTime + 0.14){
      programa(maestro, paso, proximo);
      proximo += PASO; paso++;
    }
  }

  function arranca(){
    if(!on || !crea() || tocando) return;
    if(ac.state === "suspended") ac.resume();
    tocando = true; paso = 0; proximo = ac.currentTime + 0.08;
    const t = ac.currentTime;
    maestro.gain.cancelScheduledValues(t);
    maestro.gain.setValueAtTime(0.0001, t);
    maestro.gain.exponentialRampToValueAtTime(VOL, t + 1.1);
    clearInterval(reloj); reloj = setInterval(agenda, 25);
    agenda();
  }
  function para(){
    if(!ac || !tocando) return;
    tocando = false;
    clearInterval(reloj); reloj = 0;
    const t = ac.currentTime;
    maestro.gain.cancelScheduledValues(t);
    maestro.gain.setValueAtTime(Math.max(0.0001, maestro.gain.value), t);
    maestro.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  }

  function pita(grados, dur, tipo, hueco){
    if(!on || !crea()) return;
    if(ac.state === "suspended") ac.resume();
    const t = ac.currentTime + 0.01;
    for(let i=0;i<grados.length;i++)
      voz(efectos, hz(grados[i] + 24), t + i*hueco, dur, tipo, 0.5);
  }

  return {
    arranca: arranca,
    para: para,
    tocando: function(){ return tocando; },
    encendida: function(){ return on; },
    alterna: function(){
      on = !on;
      try{ localStorage.setItem(CLAVE, on ? "1" : "0"); }catch(e){}
      if(!on) para();
      return on;
    },
    acierto: function(){ pita([0,4,7,12], 0.16, "square", 0.055); },
    fallo:   function(){ pita([7,4,0,-5], 0.22, "triangle", 0.085); }
  };
})();

/* ---- motor ---- */
const DUR = 15000, BASE = 100, BONUS = 50, RACHA = 25, RACHA_TOPE = 100;
let preguntas = [], idx = 0, puntos = 0, aciertos = 0, racha = 0, rachaMax = 0;
let reloj = null, resta = DUR, bloqueado = false;
const TOTAL = () => preguntas.length;
const MAX_POSIBLE = () => TOTAL() * (BASE + BONUS + RACHA_TOPE);
const suave = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

const vista = { intro:$("#quiz-intro"), play:$("#quiz-play"), end:$("#quiz-end") };
function mostrar(cual){ Object.keys(vista).forEach(k=>{ vista[k].hidden = (k!==cual); }); }

/* reinicia una animación aunque la clase ya estuviera puesta */
function anim(nodo, clase){
  if(!nodo) return;
  nodo.classList.remove(clase);
  void nodo.offsetWidth;
  nodo.classList.add(clase);
}
function bump(nodo){ anim(nodo,"is-bump"); }

function contarHasta(nodo, desde, hasta, ms){
  if(!suave || desde === hasta){ nodo.textContent = String(hasta); return; }
  /* red de seguridad: si la pestaña está oculta no hay frames, así que fijamos el valor igualmente */
  setTimeout(()=>{ nodo.textContent = String(hasta); }, ms + 90);
  const t0 = performance.now();
  (function paso(t){
    const k = Math.min(1, (t - t0)/ms);
    const suavizado = 1 - Math.pow(1-k, 3);
    nodo.textContent = String(Math.round(desde + (hasta-desde)*suavizado));
    if(k < 1) requestAnimationFrame(paso);
  })(t0);
}

/* puntos que salen volando del botón acertado */
function volar(boton, texto){
  if(!boton || !suave) return;
  const chip = el("span","fly",texto);
  boton.appendChild(chip);
  setTimeout(()=>chip.remove(), 800);
}

/* ---- confeti (canvas propio, se apaga solo) ---- */
const fx = $("#fx");
const fxCtx = (fx && fx.getContext) ? fx.getContext("2d") : null;
let trozos = [], fxRAF = null;
function confeti(cantidad, altura){
  if(!fxCtx || !suave) return;
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  const w = fx.clientWidth, h = fx.clientHeight;
  if(!w || !h) return;
  fx.width = w*dpr; fx.height = h*dpr;
  fxCtx.setTransform(dpr,0,0,dpr,0,0);
  const tinta = ["#3fc9f0","#f4796b","#5cd0a0","#9ce2f6"];
  for(let i=0;i<cantidad;i++){
    trozos.push({
      x: w*(0.15 + 0.7*Math.random()), y: h*altura,
      vx: (Math.random()-0.5)*4.6, vy: -(3.2 + Math.random()*4.4),
      g: 0.12 + Math.random()*0.08, r: 2 + Math.random()*3.2,
      giro: Math.random()*Math.PI, dgiro: (Math.random()-0.5)*0.32,
      c: tinta[i % tinta.length], vida: 1
    });
  }
  if(!fxRAF) fxRAF = requestAnimationFrame(pasoFx);
}
function pasoFx(){
  const w = fx.clientWidth, h = fx.clientHeight;
  fxCtx.clearRect(0,0,w,h);
  trozos = trozos.filter(t=>{
    t.vy += t.g; t.x += t.vx; t.y += t.vy; t.giro += t.dgiro; t.vida -= 0.008;
    if(t.y > h + 24 || t.vida <= 0) return false;
    fxCtx.save();
    fxCtx.translate(t.x, t.y); fxCtx.rotate(t.giro);
    fxCtx.globalAlpha = Math.max(0, Math.min(1, t.vida));
    fxCtx.fillStyle = t.c;
    fxCtx.fillRect(-t.r, -t.r*0.55, t.r*2, t.r*1.1);
    fxCtx.restore();
    return true;
  });
  if(trozos.length) fxRAF = requestAnimationFrame(pasoFx);
  else { fxRAF = null; fxCtx.clearRect(0, 0, w, h); }
}

/* ---- tira de progreso ---- */
function montarPips(){
  const cont = $("#q-pips"); cont.innerHTML = "";
  for(let i=0;i<TOTAL();i++) cont.appendChild(el("span","pip"));
}
function marcarPip(i, acierto){
  const pip = $("#q-pips").children[i];
  if(!pip) return;
  pip.classList.remove("now");
  pip.classList.add(acierto ? "ok" : "no");
}
function pipActual(i){
  [...$("#q-pips").children].forEach((p,j)=>p.classList.toggle("now", j===i));
}

function pintarRacha(){
  const chip = $("#q-streak");
  if(racha >= 2){
    chip.hidden = false;
    chip.querySelector("b").textContent = "×" + racha;
    chip.classList.toggle("streak--hot", racha >= 3);
    bump(chip);
  } else {
    chip.hidden = true;
    chip.classList.remove("streak--hot");
  }
}

/* ---- partida ---- */
function empezar(){
  preguntas = montarQuiz();
  idx = 0; puntos = 0; aciertos = 0; racha = 0; rachaMax = 0;
  trozos = [];
  $("#q-score").textContent = "0";
  $("#end-note").textContent = "";
  $("#end-form").hidden = false;
  $("#end-send").disabled = false;
  pintarRacha();
  montarPips();
  mostrar("play");
  MUSICA.arranca();
  pintarPregunta(false);
}

function pintarPregunta(entrando){
  const q = preguntas[idx];
  bloqueado = false;
  $("#q-pos").textContent = (idx+1) + "/" + TOTAL();
  $("#q-kind").textContent = q.kind;
  $("#q-text").textContent = q.text;
  $("#q-feedback").innerHTML = "";
  pipActual(idx);

  const extra = $("#q-extra"); extra.innerHTML = "";
  if(q.quote) extra.appendChild(el("p","q__quote","“"+q.quote+"”"));
  if(q.foto){
    const box = el("div","q__mono");
    const img = document.createElement("img");
    img.src = q.foto; img.alt = "Foto de una persona de la lista";
    box.appendChild(img); extra.appendChild(box);
  } else if(q.mono){
    extra.appendChild(el("div","q__mono", q.mono));
  }

  const cont = $("#q-opts"); cont.innerHTML = "";
  q.opts.forEach((texto,i)=>{
    const b = el("button","opt");
    b.type = "button";
    b.appendChild(el("span","opt__k", String.fromCharCode(65+i)));
    b.appendChild(el("span", null, texto));
    b.addEventListener("click", ()=>responder(i));
    if(suave){ b.classList.add("opt--enter"); b.style.animationDelay = (i*45) + "ms"; }
    cont.appendChild(b);
  });

  if(entrando && suave){ anim($("#q-block"),"q--in"); }
  arrancarReloj();
}

function arrancarReloj(){
  clearInterval(reloj); resta = DUR;
  const fill = $("#q-fill"), track = $("#q-track"), timer = $("#q-timer");
  fill.classList.remove("warn");
  track.classList.remove("spent");
  timer.classList.remove("urge");
  fill.style.transform = "scaleX(1)";
  $("#q-secs").textContent = "15";
  reloj = setInterval(()=>{
    resta -= 100;
    if(resta <= 0){ clearInterval(reloj); responder(-1); return; }
    fill.style.transform = "scaleX(" + (resta/DUR).toFixed(3) + ")";
    if(resta <= 5000){ fill.classList.add("warn"); timer.classList.add("urge"); }
    $("#q-secs").textContent = String(Math.ceil(resta/1000));
  },100);
}

function responder(elegida){
  if(bloqueado) return;
  bloqueado = true;
  clearInterval(reloj);
  $("#q-timer").classList.remove("urge");

  const q = preguntas[idx];
  const botones = [...$("#q-opts").children];
  const acierto = elegida === q.right;
  const fb = $("#q-feedback");

  botones.forEach((b,i)=>{
    b.disabled = true;
    b.style.animationDelay = "0ms";
    b.classList.remove("opt--enter");
    if(i === elegida && !acierto) b.classList.add("is-wrong");
    else if(i !== q.right) b.classList.add("is-dim");
  });

  const correcto = botones[q.right];
  if(acierto){
    correcto.classList.add("is-right");
    racha++;
    rachaMax = Math.max(rachaMax, racha);
    const rapidez = Math.round(BONUS * Math.max(0,resta) / DUR);
    const extra = Math.min(RACHA_TOPE, RACHA * (racha-1));
    const gana = BASE + rapidez + extra;
    const antes = puntos;
    puntos += gana; aciertos++;
    contarHasta($("#q-score"), antes, puntos, 300);
    bump($("#q-score"));
    volar(correcto, "+" + gana);
    marcarPip(idx, true);
    let detalle = "<b>Correcto.</b> +" + BASE + " · +" + rapidez + " por rapidez";
    if(extra) detalle += " · <b>+" + extra + " de racha</b>";
    fb.innerHTML = detalle;
    MUSICA.acierto();
    if(MASCOTAS.quiz) MASCOTAS.quiz.reaccion("celebra", racha >= 3 ? 1800 : 1200);
    if(racha >= 3) confeti(racha >= 5 ? 80 : 46, 0.62);
  } else {
    racha = 0;
    marcarPip(idx, false);
    MUSICA.fallo();
    if(MASCOTAS.quiz) MASCOTAS.quiz.reaccion("chasco", 1400);
    setTimeout(()=>{ correcto.classList.remove("is-dim"); correcto.classList.add("is-right","is-reveal"); }, 220);
    if(elegida === -1){
      $("#q-track").classList.add("spent");
      fb.innerHTML = "<b class='no'>Se acabó el tiempo.</b> Era “" + q.opts[q.right] + "”.";
    } else {
      fb.innerHTML = "<b class='no'>No.</b> Era “" + q.opts[q.right] + "”.";
    }
  }
  pintarRacha();

  setTimeout(avanzar, acierto ? 1250 : 1650);
}

function avanzar(){
  if(!suave){
    idx++;
    if(idx >= TOTAL()) terminar(); else pintarPregunta(false);
    return;
  }
  anim($("#q-block"),"q--out");
  setTimeout(()=>{
    idx++;
    if(idx >= TOTAL()) terminar(); else pintarPregunta(true);
  }, 170);
}

function terminar(){
  mostrar("end");
  MUSICA.para();
  contarHasta($("#end-score"), 0, puntos, 760);
  $("#end-hits").textContent = aciertos + " de " + TOTAL() + " aciertos" +
    (rachaMax >= 2 ? " · mejor racha ×" + rachaMax : "");
  const pct = aciertos / TOTAL();
  $("#end-msg").textContent =
    pct === 1   ? "Pleno. O nos conoces bien, o te has leído la web entera. Las dos cosas nos valen." :
    pct >= 0.75 ? "Muy bien. Te falta un café con dos o tres de nosotros." :
    pct >= 0.5  ? "Aprobado raspado. Baja a la cocina y preséntate a alguien." :
                  "Toca conocernos: sube a “Quiénes somos” y vuelve a intentarlo.";
  if(pct >= 0.75) setTimeout(()=>confeti(pct === 1 ? 140 : 90, 0.5), 220);
  if(MASCOTAS.close) MASCOTAS.close.reaccion(pct >= 0.75 ? "celebra" : "chasco", 2600);
  const guardado = leerLocal();
  if(guardado.alias) $("#end-alias").value = guardado.alias;
}

/* teclado: 1-4 y A-D */
addEventListener("keydown", ev=>{
  if(vista.play.hidden || bloqueado) return;
  if(ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const tecla = ev.key.toLowerCase();
  const n = "1234".indexOf(tecla) >= 0 ? "1234".indexOf(tecla)
          : "abcd".indexOf(tecla) >= 0 ? "abcd".indexOf(tecla) : -1;
  if(n < 0) return;
  const boton = $("#q-opts").children[n];
  if(boton && !boton.disabled){ ev.preventDefault(); responder(n); }
});

$("#btn-start").addEventListener("click", empezar);
$("#btn-again").addEventListener("click", empezar);

/* ---- interruptor de sonido ---- */
function pintarSon(){
  const on = MUSICA.encendida();
  document.querySelectorAll(".son").forEach(b=>{
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.classList.toggle("is-off", !on);
    b.querySelector("b").textContent = on ? "Música" : "Silencio";
  });
}
document.querySelectorAll(".son").forEach(b=>{
  b.addEventListener("click", ()=>{
    const on = MUSICA.alterna();
    if(on && !vista.play.hidden) MUSICA.arranca();
    pintarSon();
  });
});
pintarSon();

/* si te vas de la pestaña, se calla; al volver, sigue si estabas jugando */
document.addEventListener("visibilitychange", ()=>{
  if(document.hidden) MUSICA.para();
  else if(!vista.play.hidden) MUSICA.arranca();
});

/* ---- ranking común (capacidad db del artifact) ---- */
let store = null, miSlug = null;
const boardEl = $("#board");

function slug(alias){
  const s = alias.normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
  return s || ("anon-" + Math.random().toString(36).slice(2,8));
}
function leerLocal(){
  try{ return JSON.parse(localStorage.getItem("candidatura-quiz") || "{}"); }catch(e){ return {}; }
}
function guardarLocal(datos){
  try{ localStorage.setItem("candidatura-quiz", JSON.stringify(datos)); }catch(e){}
}

let destacar = false;
function pintarBoard(filas){
  boardEl.innerHTML = "";
  if(!filas.length){
    boardEl.appendChild(el("p","board__empty","Todavía no hay marcas. Puedes ser el primero."));
    return;
  }
  filas.forEach((f,i)=>{
    const mia = f.slug && f.slug === miSlug;
    const row = el("div","board__row" + (i===0?" board__row--top1":"") + (mia?" board__row--me":"") + (mia && destacar ? " board__row--flash":""));
    if(mia && destacar) destacar = false;
    row.appendChild(el("span","board__pos", String(i+1)));
    row.appendChild(el("span","board__alias", f.alias));
    row.appendChild(el("span","board__pts", String(f.puntos)));
    boardEl.appendChild(row);
  });
}

/* Sin marcador compartido el premio no se puede resolver, así que en vez de
   prometerlo y desdecirse dos líneas después se sustituye el texto entero.
   Un solo mensaje, y en el sitio donde el lector lo espera. */
function boardLocal(nota){
  const pr = $(".prize");
  if(pr) pr.innerHTML = "<b>El premio</b> se juega en el ranking común, y ese va por otro canal: " +
    "pídenos el enlace interno y compites. Aquí guardamos tu mejor marca para que puedas superarla.";
  const g = leerLocal();
  $("#board-live").textContent = "solo en este navegador";
  boardEl.innerHTML = "";
  boardEl.appendChild(el("p","board__empty", nota));
  if(g.puntos){
    const row = el("div","board__row board__row--me");
    row.appendChild(el("span","board__pos","—"));
    row.appendChild(el("span","board__alias", g.alias || "Tu marca"));
    row.appendChild(el("span","board__pts", String(g.puntos)));
    boardEl.appendChild(row);
  }
}

function suscribir(){
  store.collection("ranking").orderBy("puntos","desc").limit(50).onSnapshot(
    snap=>{
      const filas = snap.docs.map(d=>{
        const v = d.data() || {};
        return { slug:d.id, alias:String(v.alias||d.id).slice(0,24), puntos:Number(v.puntos)||0, ts:Number(v.ts)||0 };
      }).sort((a,b)=> b.puntos-a.puntos || a.ts-b.ts).slice(0,10);
      $("#board-live").textContent = "en vivo";
      pintarBoard(filas);
    },
    err=>{ boardLocal("No se pudo cargar el marcador común (" + err.code + "). Tu mejor marca sigue guardada."); }
  );
}

(function conectar(){
  const p = (window.claude && typeof window.claude.use === "function")
    ? window.claude.use("db") : Promise.resolve(null);
  p.then(dbx=>{
    if(!dbx){ boardLocal("Aquí no hay marcador compartido: se guarda tu mejor marca."); return; }
    store = dbx; miSlug = leerLocal().slug || null;
    suscribir();
  }).catch(()=>{ boardLocal("Marcador común no disponible ahora mismo. Se guarda tu mejor marca."); });
})();

$("#end-form").addEventListener("submit", async ev=>{
  ev.preventDefault();
  const alias = $("#end-alias").value.trim().replace(/\s+/g," ").slice(0,24);
  const nota = $("#end-note");
  if(alias.length < 2){ nota.innerHTML = "<b class='no'>Escribe un alias de al menos dos letras.</b>"; return; }

  const pts = Math.max(0, Math.min(MAX_POSIBLE(), Math.round(puntos)));
  const s = slug(alias);
  const previo = leerLocal();
  guardarLocal({ alias, slug:s, puntos: Math.max(pts, Number(previo.puntos)||0) });
  miSlug = s;

  if(!store){
    boardLocal("Aquí no hay marcador compartido: se guarda tu mejor marca.");
    nota.textContent = "Marca guardada en este navegador.";
    return;
  }

  $("#end-send").disabled = true;
  nota.textContent = "Guardando…";
  try{
    const ref = store.doc("ranking/" + s);
    const snap = await ref.get();
    const anterior = snap.exists ? (Number(snap.data().puntos)||0) : 0;
    if(pts <= anterior){
      nota.textContent = "Ya tenías " + anterior + " puntos con ese alias: mantenemos tu mejor marca.";
    } else {
      await ref.set({ alias, puntos: pts, aciertos, racha: rachaMax, total: TOTAL(), ts: Date.now() });
      destacar = true;
      nota.innerHTML = "<b>Dentro.</b> " + pts + " puntos en el ranking.";
    }
    $("#end-form").hidden = true;
  }catch(e){
    nota.innerHTML = "<b class='no'>No se pudo guardar</b> (" + (e && e.code ? e.code : "error") + "). Inténtalo otra vez.";
    $("#end-send").disabled = false;
  }
});
