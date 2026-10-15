/* Second island of the development journey; production progress is read-only. */
(() => {
  'use strict';
  if(globalThis.DevelopmentJourney&&!DevelopmentJourney.available(1))return;
  const byId=id=>document.getElementById(id);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const story=byId('tower-story'),play=byId('tower-play'),canvas=byId('tower-canvas');
  const ctx=canvas.getContext('2d');
  const images=new Map();
  let phase='intro',ready=false,game,paused=false,raf=0,last=0,time=0,camera=0;
  let width=800,height=560,unit=20,layer=23,drops=[];
  const opening=[
    ['antonio','Antonio · El malvado','He escondido uno de tus tesoros más preciados en lo alto de esta isla. Solo podrás recuperarlo si construyes una torre de veinte pisos.'],
    ['lucero','Lucero · La salvadora','Si es algo que amo, no voy a dejarlo atrás. ¡Dime dónde está, Antonio!'],
    ['antonio','Antonio · El malvado','En la cima de la torre más alta, sobre el mar abierto. Alinea cada piso con el anterior: lo que quede sin apoyo caerá al agua. Veinte niveles, capitana. ¿Te atreves?'],
    ['lucero','Lucero · La salvadora','Por quienes amo, llego hasta donde haga falta. ¡Acepto tu desafío!']
  ];
  const closing=[
    ['gizmo','Gizmo · El pequeño tesoro','¡Gracias, mamá, por salvarme! Sabía que vendrías por mí. ¡Guau, guau! ♡'],
    ['antonio','Antonio · Sorprendido','Veinte pisos… ¡No puedo creerlo! Está claro que ni la torre más alta puede con el amor que le tienes.'],
    ['lucero','Lucero · La salvadora','Por Gizmo llego hasta las nubes, Antonio. Mi pequeño tesoro vuelve a casa conmigo.'],
    ['antonio','Antonio · Un malvado enamorado','Esta vez me ganaste, mi salvadora. La próxima aventura tendrá menos altura… y muchos más abrazos.']
  ];
  const dialogue=new PirateDialogue(story,()=>{
    if(phase==='intro'){if(ready)start();else showLoadStatus('Todavía estamos preparando las imágenes. Espera un momento.');}
    else{
      dialogue.hide();byId('tower-reward').hidden=false;
      byId('tower-reward').scrollIntoView({block:'start',behavior:motion.matches?'instant':'smooth'});
      byId('tower-reward').querySelector('h2').focus({preventScroll:true});
    }
  });
  dialogue.show(opening,'¡Construir la torre! →');
  function showLoadStatus(text){const node=byId('tower-assets');node.classList.remove('sr-only');node.textContent=text;}
  async function load(){
    byId('tower-load-retry').hidden=true;
    const results=await Promise.allSettled(['ANTONIO_EL_MALVADO','LUCERO_LA_SALVADORA','gizmo'].map(async name=>{
      if(images.has(name))return;
      const img=new Image();img.src=`../familia/${name}.png`;await img.decode();images.set(name,img);
    }));
    ready=results.every(r=>r.status==='fulfilled');
    if(ready){byId('tower-assets').classList.add('sr-only');byId('tower-assets').textContent='Los personajes están listos.';}
    else{showLoadStatus('No se cargaron todos los personajes. Revisa tu conexión y vuelve a intentarlo.');byId('tower-load-retry').hidden=false;}
  }
  byId('tower-load-retry').addEventListener('click',load);load();
  function fit(){
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
    width=r.width;height=r.height;unit=Math.min(20,width/32);layer=unit*1.15;
    const ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    if(game)draw();
  }
  new ResizeObserver(fit).observe(canvas);
  const project=(x,z,y)=>({x:width/2+(x-z)*unit,y:height*.78+(x+z)*unit*.44-y*layer+camera});
  function polygon(points,fill,stroke){
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.8;ctx.stroke();}
  }
  function block(rect,fall=0,alpha=1){
    const {x,z,w,d,level}=rect;const timber=level%5===0;
    const a=project(x,z,level),b=project(x+w,z,level),c=project(x+w,z+d,level),e=project(x,z+d,level);
    const depth=layer*.88,down=p=>({x:p.x,y:p.y+depth});
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(0,fall);
    const face=ctx.createLinearGradient(e.x,e.y,c.x,c.y+depth);face.addColorStop(0,timber?'#a6814f':'#8e8876');face.addColorStop(1,timber?'#6f5539':'#414e49');
    const side=ctx.createLinearGradient(b.x,b.y,c.x,c.y+depth);side.addColorStop(0,timber?'#80603d':'#646c61');side.addColorStop(1,timber?'#473e2f':'#2e4241');
    polygon([e,c,down(c),down(e)],face,'#162d2f88');polygon([b,c,down(c),down(b)],side,'#162d2f88');
    // Alternating stone courses and weathered timber decks, never neon colors.
    const top=ctx.createLinearGradient(a.x,a.y,c.x,c.y);top.addColorStop(0,timber?'#d1ad75':'#c3bda3');top.addColorStop(1,timber?'#8e714d':'#8e9986');
    polygon([a,b,c,e],top,'#e2d6ad99');
    ctx.save();ctx.beginPath();[a,b,c,e].forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.clip();
    ctx.strokeStyle=timber?'#594d3980':'#65756666';ctx.lineWidth=.7;
    for(let line=1;line<5;line++){
      const p=project(x+w*line/5,z,level),q=project(x+w*line/5,z+d,level);
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
    }
    if(!timber){const p=project(x,z+d*.55,level),q=project(x+w,z+d*.55,level);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
    ctx.restore();
    // Small iron corner fasteners on the wooden courses.
    if(timber){ctx.fillStyle='#44514a';for(const p of [a,b,c,e]){const center={x:(a.x+c.x)/2,y:(a.y+c.y)/2};ctx.beginPath();ctx.arc(p.x*.91+center.x*.09,p.y*.91+center.y*.09,1.3,0,7);ctx.fill();}}
    ctx.restore();
  }
  function draw(){
    ctx.clearRect(0,0,width,height);
    const water=motion.matches?0:time;
    ctx.strokeStyle='#cde1d421';ctx.lineWidth=1;
    for(let row=0;row<9;row++){
      ctx.beginPath();for(let x=0;x<=width;x+=16){const y=height*.3+row*height*.09+Math.sin(x/65+water+row)*3;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    }
    const base=project(0,0,0);
    ctx.fillStyle='#022a3788';ctx.beginPath();ctx.ellipse(base.x,base.y+layer*2,unit*9,unit*3.5,0,0,7);ctx.fill();
    ctx.fillStyle='#8c927d';ctx.beginPath();ctx.ellipse(base.x,base.y+layer*1.1,unit*8,unit*3.1,0,0,7);ctx.fill();
    ctx.strokeStyle='#e4e4c975';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(base.x,base.y+layer*1.5,unit*8.6,unit*3.35,0,0,7);ctx.stroke();
    // A lookout pennant establishes the pirate outpost.
    ctx.save();ctx.translate(base.x+unit*6.9,base.y+unit*.7);
    ctx.strokeStyle='#68543b';ctx.lineWidth=Math.max(2,unit*.14);ctx.beginPath();ctx.moveTo(0,unit*.8);ctx.lineTo(0,-unit*4.8);ctx.stroke();
    polygon([{x:1,y:-unit*4.8},{x:unit*2.3,y:-unit*4.5},{x:unit*1.8,y:-unit*3.3},{x:1,y:-unit*3.6}],'#22383c','#bca77a77');
    ctx.strokeStyle='#e3d4ad';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(unit*.65,-unit*4.25);ctx.lineTo(unit*1.45,-unit*3.8);ctx.moveTo(unit*1.45,-unit*4.25);ctx.lineTo(unit*.65,-unit*3.8);ctx.stroke();
    ctx.fillStyle='#e3d4ad';ctx.beginPath();ctx.arc(unit*1.05,-unit*4.25,unit*.22,0,7);ctx.fill();ctx.restore();
    game.blocks.forEach(rect=>block(rect));
    drops.forEach(piece=>block(piece.rect,piece.fall,Math.max(0,1-piece.age/1.1)));
    if(game.state==='playing'){
      const top=game.blocks.at(-1),pos=project(top.x+top.w/2,top.z+top.d/2,game.level+1);
      ctx.save();ctx.strokeStyle='#e8dbad55';ctx.setLineDash([3,5]);
      ctx.beginPath();ctx.moveTo(pos.x-unit*9,pos.y);ctx.lineTo(pos.x+unit*9,pos.y);ctx.stroke();ctx.restore();
      block(game.moving);
    }
    if(game.state==='won'){
      const top=game.blocks.at(-1),p=project(top.x+top.w/2,top.z+top.d/2,20),size=unit*4;
      const dog=images.get('gizmo');if(dog)ctx.drawImage(dog,p.x-size/2,p.y-size,size,size);
    }
  }
  function tick(now){
    raf=0;if(!game||paused||game.state!=='playing')return;
    const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;game.update(dt);
    const target=Math.max(0,game.level*layer-height*.42);
    camera=motion.matches?target:camera+(target-camera)*Math.min(1,dt*7);
    for(const piece of drops){piece.age+=dt;piece.velocity+=dt*500;piece.fall+=piece.velocity*dt;}
    drops=drops.filter(p=>p.age<1.1);draw();raf=requestAnimationFrame(tick);
  }
  function start(){
    if(!ready)return;
    phase='playing';dialogue.hide();play.hidden=false;byId('tower-reward').hidden=true;
    byId('tower-overlay').hidden=true;byId('tower-pause').disabled=false;byId('tower-place').disabled=false;
    game=new PirateStack();paused=false;camera=0;time=0;drops=[];cancelAnimationFrame(raf);
    byId('tower-count').textContent='0 / 20 pisos';byId('tower-feedback').textContent='¡Es Gizmo! Construye hasta llegar a él.';
    globalThis.ValentGameMusic?.play(true);fit();
    play.scrollIntoView({block:'start',behavior:'instant'});byId('tower-place').focus({preventScroll:true});
    last=performance.now();raf=requestAnimationFrame(tick);
  }
  function ending(){
    phase='ending';play.hidden=true;byId('tower-reward').hidden=true;dialogue.show(closing,'Leer tu mensaje de amor ♡');
    globalThis.ValentGameMusic?.play(true);
    story.scrollIntoView({block:'start',behavior:motion.matches?'instant':'smooth'});
    dialogue.button.focus({preventScroll:true});
  }
  function place(){
    if(!game||paused||game.state!=='playing')return;
    const event=game.place();if(!event)return;
    if(event.cut&&!motion.matches)drops.push({rect:event.cut,fall:0,velocity:20,age:0});
    if(event.type==='miss'){
      cancelAnimationFrame(raf);byId('tower-place').disabled=true;byId('tower-pause').disabled=true;
      byId('tower-overlay').hidden=false;byId('tower-resume').hidden=true;byId('tower-retry').hidden=false;
      byId('tower-result-label').textContent='Una nueva oportunidad';byId('tower-result-title').textContent='Ese piso no encontró apoyo.';
      byId('tower-result-copy').textContent=`Llegaste al piso ${game.level} de 20. Gizmo sigue esperándote. Respira, vuelve a intentarlo y alinea el siguiente bloque con la torre.`;
      globalThis.ValentGameMusic?.play(true);tone([220,277]);byId('tower-result-title').focus({preventScroll:true});
    }else{
      byId('tower-count').textContent=`${game.level} / 20 pisos`;
      byId('tower-feedback').textContent=event.perfect?'¡Perfecto! Piso completo.':`Piso ${game.level}. ¡Seguimos subiendo!`;
      tone(event.perfect?[659,784]:[440,523]);
      if(event.type==='win'){
        globalThis.DevelopmentJourney?.complete(1);
        cancelAnimationFrame(raf);byId('tower-place').disabled=true;byId('tower-pause').disabled=true;
        camera=Math.max(0,game.level*layer-height*.42);byId('tower-feedback').textContent='¡Llegaste a Gizmo!';
        burst();setTimeout(ending,motion.matches?0:1100);
      }
    }
    draw();
  }
  function pause(value){
    if(!game||game.state!=='playing'||paused===value)return;
    paused=value;cancelAnimationFrame(raf);byId('tower-overlay').hidden=!value;
    byId('tower-resume').hidden=false;byId('tower-retry').hidden=true;byId('tower-place').disabled=value;
    byId('tower-result-label').textContent='Un respiro entre las olas';byId('tower-result-title').textContent='La torre puede esperar.';
    byId('tower-result-copy').textContent='Tu avance se conserva mientras descansas.';
    if(value){globalThis.ValentGameMusic?.pause();byId('tower-resume').focus({preventScroll:true});}
    else{globalThis.ValentGameMusic?.play();last=performance.now();raf=requestAnimationFrame(tick);byId('tower-place').focus({preventScroll:true});}
  }
  canvas.addEventListener('click',place);byId('tower-place').addEventListener('click',place);
  byId('tower-retry').addEventListener('click',start);byId('tower-return').addEventListener('click',()=>{location.href='../index_v2.html?isla=2';});
  byId('tower-pause').addEventListener('click',()=>pause(true));byId('tower-resume').addEventListener('click',()=>pause(false));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&game?.state==='playing'&&!play.hidden){event.preventDefault();pause(!paused);return;}
    if(![' ','Enter'].includes(event.key)||paused||play.hidden)return;
    if(event.repeat){event.preventDefault();return;}
    if(event.target.closest('button,a'))return;
    event.preventDefault();place();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);});
  window.addEventListener('blur',()=>pause(true));
})();
