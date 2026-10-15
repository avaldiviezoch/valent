/* Third development island. Win all three boards before saving the chapter. */
(() => {
  'use strict';
  if(!DevelopmentJourney.available(2))return;
  const byId=id=>document.getElementById(id),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const story=byId('mother-story'),play=byId('mother-play'),modal=byId('mother-modal');
  const board=byId('mother-board'),game=new PirateMotherBoard(),buttons=[],previous=Array(30).fill(-1);
  let phase='intro',paused=false,frame=0,last=0,displayedSecond=-1,modalAction,modalCancel,returnFocus;
  const intro=[
    ['antonio','Antonio · El malvado','Bienvenida a la isla del amor de madre, capitana. He preparado el tablero pirata de los tóxicos: ¡estos niños traviesos tienen toda la cubierta alborotada!'],
    ['lucero','Lucero · La salvadora','Entonces vamos a ayudar a sus mamás. Con cariño, paciencia y un poquito de firmeza, pondremos orden en este barco.'],
    ['antonio','Antonio · El malvado','Veremos qué tan bien ayudas a estas madres a controlar a sus hijos. Solo tú puedes hacerlo. Toca las treinta casillas para poner a Mamá al mando. Los niños pueden volver a ocuparlas: ¡no te confíes!'],
    ['lucero','Lucero · La salvadora','Tres niveles, treinta casillas y mucho amor de madre. ¡Acepto el reto!']
  ];
  const outro=[
    ['antonio','Antonio · Sorprendido','¡Las treinta casillas, tres veces! Ni estos pequeños piratas pudieron con tu rapidez. Las mamás vuelven a tener la cubierta bajo control.'],
    ['lucero','Lucero · La salvadora','Misión cumplida. En esta isla el cariño de mamá siempre encuentra la manera de poner las cosas en su lugar.'],
    ['antonio','Antonio · Tu malvado enamorado','Me ganaste otra vez, mi pequeña Lucero. Mi verdadero plan era compartir otra aventura contigo… y regalarte una sonrisa.']
  ];
  const dialogue=new PirateDialogue(story,()=>{
    if(phase==='intro'){dialogue.hide();start(1);}
    else{
      dialogue.hide();byId('mother-reward').hidden=false;
      byId('mother-reward').querySelector('h2').focus({preventScroll:true});
      byId('mother-reward').scrollIntoView({block:'start',behavior:motion.matches?'instant':'smooth'});
    }
  });
  dialogue.show(intro,'¡Poner orden en cubierta! →');
  for(let i=0;i<30;i++){
    const button=document.createElement('button');button.type='button';button.className='mother-cell';button.dataset.index=i;
    button.setAttribute('aria-label',`Casilla ${i+1}: cubierta libre`);button.disabled=true;
    button.addEventListener('click',()=>{
      if(phase!=='playing'||paused)return;
      advanceToNow();if(game.state!=='playing')return;
      if(game.place(i)){render();if(game.state==='won')finish();}
    });
    button.addEventListener('animationend',()=>button.classList.remove('is-changed'));
    buttons.push(button);board.append(button);
  }
  // Native buttons supply Enter/Space; arrows also navigate the five-column board.
  board.addEventListener('keydown',event=>{
    const i=buttons.indexOf(event.target);if(i<0)return;
    const targets={ArrowLeft:i-1,ArrowRight:i+1,ArrowUp:i-5,ArrowDown:i+5,Home:i-i%5,End:Math.min(29,i-i%5+4)};
    if(event.key in targets){event.preventDefault();buttons[Math.max(0,Math.min(29,targets[event.key]))].focus();}
  });
  function token(value){
    const config=PirateMotherPortraits[value===1?'mother':'child'],slot=document.createElement('span');slot.className='portrait-slot';slot.setAttribute('aria-hidden','true');
    const initial=document.createElement('span');initial.className='portrait-initial';initial.textContent=config.initial;slot.append(initial);
    if(config.src){
      const image=new Image();image.alt='';image.src=config.src;image.addEventListener('load',()=>{initial.hidden=true;});image.addEventListener('error',()=>{image.remove();initial.hidden=false;});slot.append(image);
    }
    const caption=document.createElement('span');caption.className='token-caption';caption.textContent=config.label;caption.setAttribute('aria-hidden','true');return [slot,caption];
  }
  function render(){
    const mothers=game.mothers,children=game.children,percent=Math.round(mothers/30*100);
    byId('mother-count').textContent=`${mothers} / 30`;byId('child-count').textContent=`${children} / 30`;
    byId('mother-percent').textContent=percent+'%';byId('mother-fill').style.width=percent+'%';byId('mother-progress').setAttribute('aria-valuenow',mothers);
    buttons.forEach((button,i)=>{
      const value=game.cells[i];if(value===previous[i])return;
      button.className='mother-cell'+(value===1?' is-mother':value===2?' is-child':'')+(value?' is-changed':'');
      button.replaceChildren(...(value?token(value):[]));
      button.setAttribute('aria-label',`Casilla ${i+1}: ${value===1?'mamá al mando':value===2?'hijo travieso':'cubierta libre'}`);previous[i]=value;
    });
    renderTime();
  }
  function renderTime(){
    const seconds=Math.floor(game.elapsed/1000);if(seconds===displayedSecond)return;displayedSecond=seconds;
    byId('mother-time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  }
  function advanceToNow(){
    const now=performance.now(),changed=game.advance(now-last);last=now;
    if(changed)render();else renderTime();
    if(game.state==='lost')finish();
  }
  function animate(){
    frame=0;if(phase!=='playing'||paused)return;
    advanceToNow();if(phase==='playing')frame=requestAnimationFrame(animate);
  }
  function enableBoard(enabled){buttons.forEach(button=>button.disabled=!enabled);byId('mother-pause').disabled=!enabled;byId('mother-restart').disabled=!enabled;}
  function start(level){
    closeModal();cancelAnimationFrame(frame);dialogue.hide();phase='playing';document.body.dataset.phase=phase;paused=false;
    byId('mother-reward').hidden=true;play.hidden=false;game.start(level);previous.fill(-1);displayedSecond=-1;
    byId('mother-level').textContent=`Nivel ${level} / 3`;
    document.querySelectorAll('.mother-rounds li').forEach((item,i)=>{item.classList.toggle('is-done',i<level-1);if(i===level-1)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
    enableBoard(true);render();byId('mother-status').textContent=`Nivel ${level}. Los niños aparecen cada ${game.delay} milisegundos.`;
    globalThis.ValentGameMusic?.play(true);play.scrollIntoView({block:'start',behavior:'instant'});buttons[0].focus({preventScroll:true});
    last=performance.now();frame=requestAnimationFrame(animate);
  }
  function showModal(label,title,copy,actionLabel,action,cancel){
    returnFocus=document.activeElement;modalAction=action;modalCancel=cancel;
    byId('mother-modal-label').textContent=label;byId('mother-modal-title').textContent=title;byId('mother-modal-copy').textContent=copy;
    byId('mother-modal-action').textContent=actionLabel;byId('mother-modal-cancel').hidden=!cancel;
    modal.hidden=false;document.querySelector('main').inert=true;document.querySelector('.nav').inert=true;byId('mother-modal-action').focus();
  }
  function closeModal(){modal.hidden=true;document.querySelector('main').inert=false;document.querySelector('.nav').inert=false;}
  function finish(){
    cancelAnimationFrame(frame);enableBoard(false);phase='result';document.body.dataset.phase=phase;
    globalThis.ValentGameMusic?.pause();
    if(game.state==='lost'){
      showModal(`Nivel ${game.level} / 3 · Otra oportunidad`,'¡Se alborotó la cubierta!','Los niños ocuparon las treinta casillas. Las mamás cuentan contigo: vuelve a intentarlo en este mismo nivel.','Reintentar nivel →',()=>start(game.level));return;
    }
    tone([523,659,784]);
    if(game.level<3){
      showModal(`Nivel ${game.level} completado`,'¡Mamás al mando!',`Las treinta casillas están bajo control. El siguiente reto va un poco más rápido: un niño cada ${PirateMotherBoard.delays[game.level]} ms.`,`Comenzar nivel ${game.level+1} →`,()=>start(game.level+1));
    }else{
      DevelopmentJourney.complete(2);burst();
      showModal('Tres de tres · Recuerdo guardado','¡Salvaste la isla!','Ayudaste a todas las mamás y completaste los tres niveles. Antonio y Lucero tienen algo que decirte.','Continuar la historia →',ending);
    }
  }
  function ending(){
    closeModal();phase='ending';document.body.dataset.phase=phase;play.hidden=true;dialogue.show(outro,'Leer tu mensaje de amor ♡');
    globalThis.ValentGameMusic?.play(true);story.scrollIntoView({block:'start',behavior:motion.matches?'instant':'smooth'});dialogue.button.focus({preventScroll:true});
  }
  function resume(){
    closeModal();paused=false;last=performance.now();frame=requestAnimationFrame(animate);globalThis.ValentGameMusic?.play();
    (returnFocus?.matches('.mother-cell')?returnFocus:buttons[0]).focus({preventScroll:true});
  }
  function pause(restart=false){
    if(phase!=='playing'||paused)return;
    advanceToNow();if(phase!=='playing')return;
    paused=true;cancelAnimationFrame(frame);globalThis.ValentGameMusic?.pause();
    if(restart)showModal('Un nuevo intento','¿Reiniciar este nivel?','Se vaciará este tablero. Los niveles anteriores de esta partida y tus islas completadas se conservan.','Reiniciar nivel →',()=>start(game.level),resume);
    else showModal(`Nivel ${game.level} / 3 · Pausa`,'Un respiro en alta mar.','Todo queda como lo dejaste. Los niños también se toman un descanso.','Seguir jugando →',resume);
  }
  byId('mother-modal-action').addEventListener('click',()=>modalAction?.());byId('mother-modal-cancel').addEventListener('click',()=>modalCancel?.());
  byId('mother-pause').addEventListener('click',()=>pause());byId('mother-restart').addEventListener('click',()=>pause(true));
  byId('mother-replay').addEventListener('click',()=>start(1));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&phase==='playing'){event.preventDefault();if(paused){if(modalCancel)modalCancel();else resume();}else pause();}
    if(event.key==='Tab'&&!modal.hidden){
      const choices=[byId('mother-modal-action'),byId('mother-modal-cancel')].filter(button=>!button.hidden);
      const index=choices.indexOf(document.activeElement);
      if(event.shiftKey&&index<=0){event.preventDefault();choices.at(-1).focus();}
      else if(!event.shiftKey&&index===choices.length-1){event.preventDefault();choices[0].focus();}
    }
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.addEventListener('blur',()=>pause());window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);globalThis.ValentGameMusic?.pause();});
})();
