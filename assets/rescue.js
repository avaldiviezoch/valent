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
  let typingTimer, typing = false, currentLine = '';
  function finishLine() {
    clearTimeout(typingTimer);typing=false;
    el('dialogue-line').textContent=currentLine;
    const lastLine=chapter===(finale?ending:lines).length-1;
    el('dialogue-next').hidden=lastLine;
    el('sailing-start').hidden=finale||!lastLine;
    el('dialogue-next').textContent='Continuar →';
  }
  function say(index) {
    clearTimeout(typingTimer);
    const [who,name,line]=(finale?ending:lines)[index];
    currentLine=line;el('speaker').textContent=name;
    story.dataset.speaker=who;
    characters.forEach(actor=>{
      const active=actor.dataset.character===who;
      actor.closest('.cast-member').hidden=!active;
      actor.classList.toggle('is-speaking',active);
      if(active){actor.classList.remove('entering');void actor.offsetWidth;actor.classList.add('entering');}
    });
    el('dialogue-announcement').textContent=`${name}: ${line}`;
    el('sailing-start').hidden=true;el('dialogue-next').hidden=false;
    el('dialogue-next').textContent='Mostrar el texto completo →';
    if(motion.matches){finishLine();return;}
    typing=true;let count=0;el('dialogue-line').textContent='';
    function write(){
      if(count>=line.length){finishLine();return;}
      el('dialogue-line').textContent=line.slice(0,++count);
      typingTimer=setTimeout(write,/[,.!…?]/.test(line[count-1])?150:24);
    }
    write();
  }
  say(0);
  el('dialogue-next').addEventListener('click',()=>{
    if(typing){finishLine();return;}
    if(chapter<(finale?ending:lines).length-1)say(++chapter);
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
      if(event.target===actor&&event.animationName.startsWith('enter-'))actor.classList.remove('entering');
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
  motion.addEventListener('change',()=>{scheduleGesture();if(motion.matches&&typing)finishLine();});
  scheduleGesture();
  for (const person of family) {
    const li = document.createElement('li');
    li.id = `family-${person.id}`;
    const img = document.createElement('img');
    img.src = `../familia/${person.id}.png`;img.alt = '';img.width = 48;img.height = 48;
    img.alt='Familiar pendiente de rescate';li.append(img);el('family-roster').append(li);
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
    if(game){game.rockMinRadius=17/width;game.boatRadius=Math.max(.027,24/width);}
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
  function drawBoat(){
    ctx.save();ctx.translate(game.boat*width,height*.77);
    const scale=Math.max(.85,Math.min(1.2,width/800));ctx.scale(scale,scale);
    ctx.rotate(motion.matches?0:(game.target-game.boat)*.8);
    // Original top-down wooden sailboat, with its two ivory sails and deck.
    ctx.shadowColor='#001722';ctx.shadowBlur=15;ctx.shadowOffsetY=8;
    ctx.fillStyle='#694b32';ctx.beginPath();ctx.moveTo(0,-42);
    ctx.quadraticCurveTo(30,-10,15,40);ctx.quadraticCurveTo(0,52,-15,40);ctx.quadraticCurveTo(-30,-10,0,-42);ctx.fill();
    ctx.strokeStyle='#c2a578';ctx.lineWidth=3;ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#b39970';ctx.fillRect(-10,-10,20,35);
    ctx.strokeStyle='#473b30';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(0,32);ctx.stroke();
    ctx.fillStyle='#f0e6cd';ctx.beginPath();ctx.moveTo(3,-29);ctx.lineTo(33,17);ctx.lineTo(3,10);ctx.closePath();ctx.fill();
    ctx.fillStyle='#c9c8b4';ctx.beginPath();ctx.moveTo(-3,-24);ctx.lineTo(-25,10);ctx.lineTo(-3,8);ctx.closePath();ctx.fill();ctx.restore();
  }
  function drawRock(rock){
    const r=Math.max(17,rock.radius*width),x=rock.x*width,y=rock.y*height;
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle='#001b2a66';ctx.beginPath();ctx.ellipse(5,12,r*1.25,r*.55,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#d6e8ce75';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,10,r+9,r*.55,0,0,Math.PI*2);ctx.stroke();
    const stone=ctx.createRadialGradient(-r*.4,-r*.6,1,r*.3,r*.4,r*1.7);
    stone.addColorStop(0,'#b9b8a5');stone.addColorStop(.38,'#818b80');stone.addColorStop(.75,'#485c58');stone.addColorStop(1,'#263d43');
    const points=[[-1,.15],[-.92,-.2],[-.66,-.56],[-.32,-.63],[-.12,-.83],[.25,-.72],[.48,-.46],[.68,-.43],[.92,-.05],[1,.22],[.55,.38],[-.45,.35]];
    ctx.beginPath();
    points.forEach(([px,py],i)=>{
      const next=points[(i+1)%points.length];
      const mx=(px+next[0])*.5*r,my=(py+next[1])*.5*r;
      if(i===0)ctx.moveTo(mx,my);else ctx.quadraticCurveTo(px*r,py*r,mx,my);
    });ctx.closePath();ctx.fillStyle=stone;ctx.fill();
    ctx.save();ctx.clip();
    // Stable mineral grain and irregular veins, regenerated from the rock's
    // own shape value rather than changing randomly between frames.
    const grain=i=>{const n=Math.sin(i*127.1+rock.shape*941.7)*43758.5453;return n-Math.floor(n);};
    for(let i=0;i<55;i++){
      ctx.fillStyle=i%3?'#d6d2bc38':'#1e363754';
      ctx.beginPath();ctx.ellipse((grain(i*3)-.5)*r*2,(grain(i*3+1)-.3)*r*1.4,.4+grain(i*3+2)*1.1,.4+grain(i*3+2)*.6,0,0,7);ctx.fill();
    }
    ctx.strokeStyle='#273d3970';ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(-r*.23,-r*.65);ctx.lineTo(-r*.38,-r*.3);ctx.lineTo(-r*.14,-r*.1);ctx.lineTo(-r*.2,r*.3);ctx.moveTo(-r*.14,-r*.1);ctx.lineTo(r*.4,r*.04);ctx.stroke();
    ctx.strokeStyle='#ded5bd55';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-r*.75,-r*.1);ctx.quadraticCurveTo(-r*.5,-r*.6,-r*.2,-r*.55);ctx.stroke();ctx.restore();
    ctx.fillStyle='#1c555052';ctx.beginPath();ctx.ellipse(r*.2,r*.27,r*.7,r*.12,0,0,7);ctx.fill();
    ctx.strokeStyle='#e1e7d77a';ctx.beginPath();ctx.ellipse(0,11,r*.9,r*.25,0,.05,Math.PI*.8);ctx.stroke();ctx.restore();
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    // The original sailing board: transparent canvas over the photographic sea.
    ctx.fillStyle='#092d3a25';ctx.fillRect(0,0,width,height);
    const t=motion.matches?0:clock;
    if(!motion.matches){
      ctx.strokeStyle='#cfecdf18';ctx.lineWidth=1;
      for(let row=0;row<10;row++){
        ctx.beginPath();
        for(let k=0;k<=24;k++){
          const x=k*width/24,y=(row*height/7+t*28)%(height+120)-60+Math.sin(k*.7+row)*6;
          k?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }ctx.stroke();
      }
      for(let i=0;i<20;i++){
        const age=(t*.8+i/20)%1;
        ctx.fillStyle=`rgba(218,239,220,${(1-age)*.1})`;
        ctx.beginPath();ctx.ellipse(game.boat*width+Math.sin(i*4)*8,height*.85+age*height*.18,8+age*17,2.5,0,0,7);ctx.fill();
      }
    }
    for(const rock of game.rocks)drawRock(rock);
    if(game.cooldown<=0 || Math.floor(game.cooldown*9)%2===0)drawBoat();
    if(game.active){
      const head=game.active;
      // Only the original transparent head: no name, label, ring or badge.
      const size=Math.min(78,Math.max(54,width*.09));
      ctx.save();ctx.shadowColor='#00192388';ctx.shadowBlur=9;
      portrait(head.person.id,head.x*width,head.y*height,size);ctx.restore();
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
    el(`family-${person.id}`).querySelector('img').alt='Familiar rescatado';
    el('sailing-state').textContent='¡Un familiar a salvo! ♡';
    if(!motion.matches)for(let i=0;i<9;i++)sparkles.push({x:game.boat,y:.8,born:clock,vx:(Math.random()-.5)*90});
    tone([523+count*12,659+count*12]);
  }
  function outcome(event) {
    if(event.type==='spawn')el('sailing-state').textContent='¡Recoge la siguiente cabeza!';
    if(event.type==='catch'||event.type==='win')caught(event.person);
    if(event.type==='rock'){tone([196,247]);el('sailing-state').textContent='¡Cuidado con las rocas!';}
    if(event.type==='miss') {
      direction=0;held.clear();
      el('result-label').textContent='Volvemos a intentarlo';
      el('result-title').textContent='Un familiar cayó al mar.';
      el('result-description').textContent=`Rescataste a ${game.rescued.length} de 18. Para ganar hay que recogerlos a todos. La próxima travesía tendrá un orden y posiciones nuevos.`;
      el('rescue-continue').hidden=true;el('rescue-retry').hidden=false;overlay.hidden=false;
      el('rescue-pause').disabled=true;
      el('result-title').focus({preventScroll:true});
    }
    if(event.type==='win') {
      play.hidden=true;story.hidden=false;story.classList.add('ending');finale=true;chapter=0;say(0);
      el('sailing-start').hidden=true;
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
    el('rescue-pause').disabled=false;el('sailing-score').textContent='0 / 18 a salvo';el('family-count').textContent='0 de 18';
    document.querySelectorAll('#family-roster img').forEach(img=>img.alt='Familiar pendiente de rescate');el('sailing-state').textContent='¡Todos a bordo!';
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
