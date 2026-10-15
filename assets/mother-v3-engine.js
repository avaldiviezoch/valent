/* Thirty spaces, three rounds. Mother=1, child=2; no rendering or storage here. */
(() => {
  'use strict';
  const delays=Object.freeze([800,750,700]);
  globalThis.PirateMotherBoard=class PirateMotherBoard {
    static delays=delays;
    constructor(random=Math.random){this.random=random;this.cells=Array(30).fill(0);this.state='ready';this.level=1;this.elapsed=0;this.pending=0;}
    get delay(){return delays[this.level-1];}
    get mothers(){return this.cells.filter(value=>value===1).length;}
    get children(){return this.cells.filter(value=>value===2).length;}
    start(level=1){
      if(!Number.isInteger(level)||level<1||level>delays.length)throw new RangeError('Only three levels are prepared.');
      this.level=level;this.cells.fill(0);this.elapsed=0;this.pending=0;this.state='playing';
    }
    place(index){
      if(this.state!=='playing'||!Number.isInteger(index)||index<0||index>=30||this.cells[index]===1)return false;
      this.cells[index]=1;if(this.mothers===30)this.state='won';return true;
    }
    tick(){
      if(this.state!=='playing')return false;
      const candidates=this.cells.flatMap((value,index)=>value!==2?[index]:[]);
      if(!candidates.length){this.state='lost';return false;}
      const slot=Math.min(candidates.length-1,Math.max(0,Math.floor(this.random()*candidates.length)));
      this.cells[candidates[slot]]=2;if(this.children===30)this.state='lost';return true;
    }
    advance(milliseconds){
      if(this.state!=='playing'||!Number.isFinite(milliseconds)||milliseconds<=0)return false;
      this.pending+=milliseconds;this.elapsed+=milliseconds;let changed=false;
      while(this.pending>=this.delay&&this.state==='playing'){this.pending-=this.delay;changed=this.tick()||changed;}
      return changed;
    }
  };
})();
