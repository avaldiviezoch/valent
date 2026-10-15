/* Reusable sprite dialogue for development chapters; original PNGs stay intact. */
'use strict';
globalThis.PirateDialogue=class PirateDialogue {
  constructor(root,onComplete){
    this.root=root;this.onComplete=onComplete;this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    this.button=root.querySelector('[data-dialogue-next]');
    this.copy=root.querySelector('[data-dialogue-copy]');
    this.line=root.querySelector('[data-dialogue-line]');
    this.announcement=root.querySelector('[data-dialogue-announcement]');
    this.button.addEventListener('click',()=>{
      if(this.typing){this.finish();return;}
      if(this.index<this.lines.length-1)this.say(++this.index);else this.onComplete?.();
    });
    this.motion.addEventListener('change',()=>{if(this.motion.matches&&this.typing)this.finish();});
    root.querySelectorAll('.character').forEach(actor=>{
      actor.addEventListener('click',()=>{
        if(this.motion.matches)return;
        actor.classList.remove('is-reacting');void actor.offsetWidth;actor.classList.add('is-reacting');
      });
      actor.addEventListener('animationend',()=>actor.classList.remove('is-reacting'));
    });
  }
  show(lines,lastLabel='Comenzar →'){
    this.lines=lines;this.lastLabel=lastLabel;this.index=0;this.root.hidden=false;this.say(0);
  }
  say(index){
    clearTimeout(this.timer);
    const [who,name,text]=this.lines[index];this.text=text;this.root.dataset.speaker=who;
    this.root.querySelector('[data-speaker-name]').textContent=name;
    this.root.querySelectorAll('.cast-member').forEach(member=>{
      const active=member.dataset.actor===who;member.hidden=!active;
      member.querySelector('.character').classList.toggle('is-speaking',active);
    });
    this.line.dataset.fullText=text;this.announcement.textContent=`${name}: ${text}`;
    this.copy.textContent='';this.button.textContent='Mostrar el texto completo →';
    if(this.motion.matches){this.finish();return;}
    this.typing=true;let count=0;
    const write=()=>{
      if(count>=text.length){this.finish();return;}
      this.copy.textContent=text.slice(0,++count);
      this.timer=setTimeout(write,/[,.!…?]/.test(text[count-1])?130:23);
    };write();
  }
  finish(){
    clearTimeout(this.timer);this.typing=false;this.copy.textContent=this.text;
    this.button.textContent=this.index===this.lines.length-1?this.lastLabel:'Continuar →';
  }
  hide(){clearTimeout(this.timer);this.root.hidden=true;}
};
