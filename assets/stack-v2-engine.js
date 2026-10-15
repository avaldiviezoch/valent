/* Stack mechanics adapted from the supplied Pure CSS Stack reference.
   Local coordinates alternate X/Z; the unsupported part is cut away. */
'use strict';
globalThis.PirateStack = class PirateStack {
  constructor(random = Math.random) {
    this.random=random;this.goal=20;this.level=0;this.state='playing';
    this.blocks=[{x:-5,z:-5,w:10,d:10,level:0}];
    this.spawn();
  }
  spawn(){
    this.axis=this.level%2===0?'x':'z';
    this.direction=this.random()<.5?1:-1;
    this.offset=-this.direction*12;
    this.speed=2*(5.8+this.level*.22);
  }
  update(dt){
    if(this.state!=='playing')return;
    dt=Math.max(0,Math.min(.05,dt));
    this.offset+=this.direction*this.speed*dt;
    if(this.offset>12){this.offset=24-this.offset;this.direction=-1;}
    if(this.offset< -12){this.offset=-24-this.offset;this.direction=1;}
  }
  get moving(){
    const top=this.blocks[this.blocks.length-1];
    return {...top,[this.axis]:top[this.axis]+this.offset,level:this.level+1};
  }
  place(){
    if(this.state!=='playing')return null;
    const top=this.blocks[this.blocks.length-1],moving=this.moving;
    const dimension=this.axis==='x'?'w':'d',delta=this.offset;
    const perfect=Math.abs(delta)<=.26;
    const start=perfect?top[this.axis]:Math.max(top[this.axis],moving[this.axis]);
    const size=perfect?top[dimension]:Math.min(top[this.axis]+top[dimension],moving[this.axis]+moving[dimension])-start;
    if(size<.22){this.state='lost';return {type:'miss',block:moving};}
    let cut=null;
    if(!perfect){
      cut={...moving,[dimension]:Math.abs(delta)};
      cut[this.axis]=delta>0?start+size:moving[this.axis];
    }
    const landed={...top,[this.axis]:start,[dimension]:size,level:++this.level};
    this.blocks.push(landed);
    if(this.level===this.goal)this.state='won';else this.spawn();
    return {type:this.state==='won'?'win':'placed',perfect,cut,block:landed,level:this.level};
  }
};
