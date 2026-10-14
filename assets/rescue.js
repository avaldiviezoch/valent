/* Original PNGs, native canvas and reusable, non-deforming character motion. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'rescue') return;
  const el = id => document.getElementById(id);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const family = [
    ['ANTONELLA','Antonella'],['ESTEVEN','Esteven'],['FERNANDO','Fernando'],
    ['HARRY','Harry'],['IVAN','Iván'],['JANET','Janet'],['JENNY','Jenny'],
    ['JERICO','Jericó'],['JHON','Jhon'],['LIZETH','Lizeth'],['LOGAN','Logan'],
    ['MAMA','Mamá'],['MATEO','Mateo'],['MEGAN','Megan'],['MELANI','Melani'],
    ['PAPA','Papá'],['SEBSTIAN','Sebastián'],['STEFANY','Stefany']
  ].map(([id,name]) => ({id,name}));
  const images = new Map();
  const characters = [...document.querySelectorAll('.character')];
  const canvas = el('sailing-canvas'), ctx = canvas.getContext('2d');
  const story = el('rescue-story'), play = el('rescue-play'), overlay = el('rescue-overlay');
  let game, paused = false, ready = false, frame = 0, last = 0, clock = 0;
  let width = 800, height = 480, direction = 0, held = new Set(), sparkles = [];
  let chapter = 0, finale = false, visibleCast = true;
  const lines = [
    ['antonio','Antonio · El malvado','¡He dejado a tu familia a la deriva! A ver si eres capaz de rescatarlos a todos, Lucero…'],
    ['lucero','Lucero · La salvadora','¡Con mi barco nadie se queda atrás! Voy a salvarlos a todos. Familia, ¡allá voy!'],
    ['antonio','Antonio · El malvado','Tendrás que atrapar a los 18. Si uno cae al mar, habrá que comenzar de nuevo. ¡A ver qué tal navegas!']
  ];
  const ending = [
    ['antonio','Antonio · Un malvado enamorado','¡No puede ser! ¡Los salvaste a todos! Te felicito, mi pequeña Lucero. Esta vez me ganaste…'],
    ['lucero','Lucero · La salvadora','¡Mi familia está a salvo! Aquí no se queda nadie atrás. ¿Preparado para nuestra próxima aventura, bebito?']
  ];
  function say(index) {
    const [who,name,line] = (finale ? ending : lines)[index];
    el('speaker').textContent = name;
    el('dialogue-line').textContent = line;
    characters.forEach(actor => actor.classList.toggle('is-speaking',actor.dataset.character === who));
    el('dialogue-next').textContent = finale ? 'Lucero responde →' : index === 0 ? '¿Qué dice Lucero? →' : 'Escuchar el desafío →';
  }
  say(0);
  el('dialogue-next').addEventListener('click', () => {
    chapter++;
    say(chapter);
    if (chapter === (finale ? ending : lines).length - 1) {
      el('dialogue-next').hidden = true;
      if (!finale) el('sailing-start').hidden = false;
    }
  });
  function animateActor(actor, type) {
    if (motion.matches || document.hidden || !visibleCast) return;
    actor.classList.remove('is-gesturing','is-reacting');
    // Restart a finite reaction; no scaling, facial morphing or image edits.
    void actor.offsetWidth;
    actor.classList.add(type);
  }
  characters.forEach(actor => {
    actor.addEventListener('pointermove', event => {
      if (motion.matches || event.pointerType !== 'mouse') return;
      const r = actor.getBoundingClientRect();
      actor.style.setProperty('--shift-x',`${((event.clientX-r.left)/r.width-.5)*5}px`);
      actor.style.setProperty('--shift-y',`${((event.clientY-r.top)/r.height-.5)*3}px`);
    });
    actor.addEventListener('pointerleave', () => {
      actor.style.removeProperty('--shift-x');actor.style.removeProperty('--shift-y');
    });
    actor.addEventListener('click', () => animateActor(actor,'is-reacting'));
    actor.addEventListener('animationend', event => {
      if (event.target.tagName === 'IMG') actor.classList.remove('is-reacting','is-gesturing');
    });
  });
  new IntersectionObserver(entries => {
    visibleCast = entries[0].isIntersecting;
    characters.forEach(actor => actor.querySelector('.character-sway').style.animationPlayState = visibleCast && !document.hidden ? 'running' : 'paused');
  }).observe(story);
  let gestureTimer;
  function scheduleGesture() {
    clearTimeout(gestureTimer);
    if (motion.matches || document.hidden) return;
    gestureTimer = setTimeout(() => {
      animateActor(characters[Math.floor(Math.random()*characters.length)],'is-gesturing');
      scheduleGesture();
    },6500+Math.random()*6500);
  }
  motion.addEventListener('change',scheduleGesture);
  scheduleGesture();
  for (const person of family) {
    const li = document.createElement('li');
    li.id = `family-${person.id}`;
    const img = document.createElement('img');
    img.src = `../familia/${person.id}.png`;img.alt = '';img.width = 48;img.height = 48;
    li.append(img,document.createTextNode(person.name));el('family-roster').append(li);
  }
  async function loadImages() {
    ready = false;
    el('sailing-start').disabled = true;
    el('asset-retry').hidden = true;
    el('asset-status').textContent = 'Preparando los retratos originales…';
    const ids = [...family.map(p => p.id),'LUCERO_LA_SALVADORA','ANTONIO_EL_MALVADO'];
    const results = await Promise.allSettled(ids.map(async id => {
      if (images.has(id)) return;
      const image = new Image();image.src = `../familia/${id}.png`;
      await image.decode();images.set(id,image);
    }));
    ready = results.every(result => result.status === 'fulfilled');
    el('sailing-start').disabled = !ready;
    el('sailing-start').textContent = ready ? 'Izar las velas · ¡Al rescate! →' : 'Faltan algunos retratos';
    el('asset-status').textContent = ready ? 'Toda la familia está lista. ¡Tú puedes, capitana!' : 'No se cargaron todos los retratos. Revisa tu conexión y vuelve a intentarlo.';
    el('asset-retry').hidden = ready;
  }
  el('asset-retry').addEventListener('click',loadImages);
  loadImages();
  function fit() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    width = box.width;height = box.height;
    const dpr = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.round(width*dpr);canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if (game) draw();
  }
  new ResizeObserver(fit).observe(canvas);
  function portrait(id,x,y,size) {
    const image = images.get(id);if (!image) return;
    const ratio = image.naturalWidth/image.naturalHeight;
    const w = ratio >= 1 ? size : size*ratio;
    const h = ratio >= 1 ? size/ratio : size;
    ctx.drawImage(image,x-w/2,y-h/2,w,h);
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    const bg = ctx.createLinearGradient(0,0,0,height);
    bg.addColorStop(0,'#436f81');bg.addColorStop(.18,'#568d9a');bg.addColorStop(.2,'#287488');bg.addColorStop(1,'#063b54');
    ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
    // Distant island silhouettes, a warm horizon, and layered surface currents.
    ctx.fillStyle='#254e60';ctx.beginPath();ctx.moveTo(0,height*.2);
    ctx.quadraticCurveTo(width*.12,height*.03,width*.22,height*.2);
    ctx.quadraticCurveTo(width*.35,height*.08,width*.49,height*.2);ctx.fill();
    ctx.fillStyle='#f4dcb24a';ctx.fillRect(0,height*.2,width,1);
    const t = motion.matches ? 0 : clock;
    for (let row=0;row<15;row++) {
      ctx.beginPath();ctx.strokeStyle=`rgba(151,225,223,${.045+row*.004})`;ctx.lineWidth=1+row*.05;
      const y=height*(.24+row*.052);
      for(let x=-20;x<=width+20;x+=12) {
        const yy=y+Math.sin(x/55+t*.7+row)*3;
        x===-20?ctx.moveTo(x,yy):ctx.lineTo(x,yy);
      }ctx.stroke();
    }
    const boatX=game.boat*width, boatY=height*.84;
    const bob=motion.matches?0:Math.sin(clock*2)*2;
    const bw=width*.18, bh=Math.min(35,width*.055);
    ctx.save();ctx.translate(boatX,boatY+bob);
    ctx.fillStyle='#c9f1e630';ctx.beginPath();ctx.ellipse(0,bh*.65,bw*.72,7,0,0,Math.PI*2);ctx.fill();
    const wood=ctx.createLinearGradient(0,-bh,0,bh);wood.addColorStop(0,'#d19b59');wood.addColorStop(1,'#503628');
    ctx.fillStyle=wood;ctx.strokeStyle='#edc583';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(-bw*.62,-bh*.25);ctx.quadraticCurveTo(0,bh*.1,bw*.62,-bh*.25);ctx.lineTo(bw*.37,bh*.7);ctx.quadraticCurveTo(0,bh,-bw*.4,bh*.6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#684a35';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-bw*.2,-bh*.1);ctx.lineTo(-bw*.2,-bh*2.4);ctx.stroke();
    ctx.fillStyle='#f9eac6';ctx.beginPath();ctx.moveTo(-bw*.18,-bh*2.35);ctx.quadraticCurveTo(bw*.05,-bh*1.55,bw*.25,-bh*.5);ctx.lineTo(-bw*.18,-bh*.5);ctx.closePath();ctx.fill();
    portrait('LUCERO_LA_SALVADORA',bw*.3,-bh*.7,Math.min(52,width*.115));
    ctx.restore();
    if (game.active) {
      const head=game.active, x=head.x*width, y=head.y*height;
      const size=Math.min(68,Math.max(44,width*.07));
      ctx.save();ctx.shadowColor='#061b30';ctx.shadowBlur=14;
      ctx.fillStyle='#d7b87d';ctx.beginPath();ctx.arc(x,y+size*.22,size*.49,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='#176678';ctx.beginPath();ctx.arc(x,y+size*.22,size*.37,0,Math.PI*2);ctx.fill();
      portrait(head.person.id,x,y,size);ctx.restore();
      ctx.font='600 12px system-ui';ctx.textAlign='center';
      const labelW=ctx.measureText(head.person.name).width+18;
      ctx.fillStyle='#052a3cdb';ctx.fillRect(x-labelW/2,y+size*.67,labelW,22);
      ctx.fillStyle='#f9e9c7';ctx.fillText(head.person.name,x,y+size*.67+15);
    }
    if (!motion.matches) for (const p of sparkles) {
      const alpha=1-(clock-p.born)/.7;
      if(alpha<=0)continue;
      ctx.globalAlpha=alpha;ctx.fillStyle='#f6dda2';ctx.beginPath();ctx.arc(p.x*width+(clock-p.born)*p.vx,p.y*height-(clock-p.born)*40,2.5,0,Math.PI*2);ctx.fill();
    }ctx.globalAlpha=1;
  }
  function caught(person) {
    const count=game.rescued.length;
    el('sailing-score').textContent=`${count} / 18 a salvo`;
    el('family-count').textContent=`${count} de 18`;
    el(`family-${person.id}`).classList.add('rescued');
    el('sailing-state').textContent=`${person.name} está a salvo ♡`;
    if(!motion.matches)for(let i=0;i<9;i++)sparkles.push({x:game.boat,y:.8,born:clock,vx:(Math.random()-.5)*90});
    tone([523+count*12,659+count*12]);
  }
  function outcome(event) {
    if(event.type==='spawn')el('sailing-state').textContent=`¡Rescata a ${event.person.name}!`;
    if(event.type==='catch'||event.type==='win')caught(event.person);
    if(event.type==='miss') {
      direction=0;held.clear();
      el('result-label').textContent='Volvemos a intentarlo';
      el('result-title').textContent=`No alcanzaste a ${event.person.name}.`;
      el('result-description').textContent=`Rescataste a ${game.rescued.length} de 18. Para ganar hay que recogerlos a todos. La próxima travesía tendrá un orden y posiciones nuevos.`;
      el('rescue-continue').hidden=true;el('rescue-retry').hidden=false;overlay.hidden=false;
      el('rescue-pause').disabled=true;
      el('result-title').focus({preventScroll:true});
    }
    if(event.type==='win') {
      play.hidden=true;story.hidden=false;story.classList.add('ending');finale=true;chapter=0;say(0);
      el('dialogue-next').hidden=false;el('sailing-start').hidden=true;
      document.querySelector('.rescue-rules').hidden=true;el('asset-status').hidden=true;
      document.querySelector('.cast-seal span').textContent='Familia a salvo';
      el('sailing-reward').hidden=false;tone();burst();
      story.scrollIntoView({behavior:motion.matches?'auto':'smooth',block:'start'});
      el('dialogue-line').setAttribute('tabindex','-1');
      el('dialogue-line').focus({preventScroll:true});
    }
  }
  function tick(now) {
    frame=0;
    if(!game || paused || game.state!=='playing')return;
    const dt=Math.min((now-last)/1000,.05);last=now;clock+=dt;
    const event=game.update(dt,direction);
    if(event)outcome(event);
    sparkles=sparkles.filter(p=>clock-p.born<.7);draw();
    if(game.state==='playing'&&!paused)frame=requestAnimationFrame(tick);
  }
  function start() {
    if(!ready)return;
    cancelAnimationFrame(frame);game=new FamilyRescueEngine(family);paused=false;held.clear();direction=0;clock=0;sparkles=[];
    story.hidden=true;play.hidden=false;overlay.hidden=true;el('sailing-reward').hidden=true;
    el('rescue-pause').disabled=false;el('sailing-score').textContent='0 / 18 a salvo';el('family-count').textContent='0 de 18';el('sailing-state').textContent='¡Todos a bordo!';
    document.querySelectorAll('#family-roster li').forEach(li=>li.classList.remove('rescued'));
    fit();canvas.focus({preventScroll:true});
    const top=play.getBoundingClientRect().top+scrollY-12;
    window.scrollTo({top,behavior:'instant'});
    last=performance.now();frame=requestAnimationFrame(tick);
  }
  el('sailing-start').addEventListener('click',start);el('rescue-retry').addEventListener('click',start);
  function pause(value) {
    if(!game||game.state!=='playing'||paused===value)return;
    paused=value;held.clear();direction=0;cancelAnimationFrame(frame);
    overlay.hidden=!value;el('rescue-continue').hidden=false;el('rescue-retry').hidden=true;
    el('result-label').textContent='Un respiro en el mar';el('result-title').textContent='Tu familia te espera.';
    el('result-description').textContent='La partida está pausada. Continúa cuando estés lista.';
    if(value)el('rescue-continue').focus({preventScroll:true});
    else{canvas.focus({preventScroll:true});last=performance.now();frame=requestAnimationFrame(tick);}
  }
  el('rescue-pause').addEventListener('click',()=>pause(true));el('rescue-continue').addEventListener('click',()=>pause(false));
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)pause(true);
    characters.forEach(actor=>actor.querySelector('.character-sway').style.animationPlayState=visibleCast&&!document.hidden?'running':'paused');
    scheduleGesture();
  });
  window.addEventListener('blur',()=>pause(true));
  function steerTo(event) {
    if(!game||paused||game.state!=='playing')return;
    const rect=canvas.getBoundingClientRect();game.target=(event.clientX-rect.left)/rect.width;
  }
  canvas.addEventListener('pointerdown',event=>{canvas.setPointerCapture(event.pointerId);steerTo(event);});
  canvas.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'||canvas.hasPointerCapture(event.pointerId))steerTo(event);});
  const updateDirection=()=>{direction=(held.has('right')?1:0)-(held.has('left')?1:0);};
  document.querySelectorAll('[data-steer]').forEach(button=>{
    const side=button.dataset.steer==='arrowleft'?'left':'right';
    button.addEventListener('pointerdown',event=>{
      if(!game||paused||game.state!=='playing')return;
      event.preventDefault();button.setPointerCapture(event.pointerId);held.add(side);updateDirection();
      game.target=Math.min(.91,Math.max(.09,game.boat+(side==='left'?-.1:.1)));
    });
    const release=()=>{held.delete(side);updateDirection();};
    button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    button.addEventListener('click',event=>{if(event.detail===0&&game&&!paused)game.target=game.boat+(side==='left'?-.1:.1);});
  });
  document.addEventListener('keydown',event=>{
    if(!game||game.state!=='playing'||play.hidden)return;
    if(event.key==='Escape'){event.preventDefault();pause(!paused);return;}
    if(paused)return;
    const key=event.key.toLowerCase();
    if(!['arrowleft','arrowright','a','d'].includes(key))return;
    event.preventDefault();held.add(key==='arrowleft'||key==='a'?'left':'right');updateDirection();
  });
  document.addEventListener('keyup',event=>{
    const key=event.key.toLowerCase();
    if(['arrowleft','a'].includes(key))held.delete('left');
    if(['arrowright','d'].includes(key))held.delete('right');updateDirection();
  });
  el('rescue-save').addEventListener('click',()=>{if(game?.state==='won')saveStop(0);});
})();
