/* Physics and fresh random voyages, independent of rendering and input. */
'use strict';
globalThis.FamilyRescueEngine = class FamilyRescueEngine {
  constructor(family, random = () => {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] / 4294967296;
  }) {
    this.random = random;
    this.order = [...family];
    for (let i = this.order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
    }
    this.rescued = [];
    this.boat = .5;
    this.target = .5;
    this.wait = .8;
    this.active = null;
    this.rocks = [];
    this.cooldown = 0;
    this.rockMinRadius = .025;this.boatRadius = .028;
    this.state = 'playing';
  }
  update(dt, direction = 0) {
    if (this.state !== 'playing') return null;
    dt = Math.min(Math.max(dt, 0), .05);
    const clamp = x => Math.min(.91, Math.max(.09, x));
    if (direction) this.target = clamp(this.boat + direction * .7 * dt);
    this.boat = clamp(this.boat + Math.sign(this.target - this.boat) * Math.min(Math.abs(this.target - this.boat), .7 * dt));
    this.cooldown = Math.max(0,this.cooldown-dt);
    for (const rock of this.rocks) {
      rock.y += rock.speed * dt;
      if (!rock.hit && this.cooldown === 0 && Math.abs(rock.y-.77)<.055 && Math.abs(rock.x-this.boat)<Math.max(rock.radius,this.rockMinRadius)+this.boatRadius) {
        rock.hit = true;this.cooldown = 1.2;
        this.boat = clamp(this.boat+(this.boat<rock.x?-.07:.07));
        this.target = this.boat;
        return {type:'rock'};
      }
    }
    this.rocks = this.rocks.filter(rock=>rock.y<1.15);
    if (!this.active) {
      this.wait -= dt;
      if (this.wait > 0) return null;
      this.active = {person:this.order[this.rescued.length], x:.13 + this.random() * .74, y:-.1, speed:.28 + this.random() * .035 + this.rescued.length * .0015};
      // Rocks arrive before the portrait, leaving its catch lane clear. Steering
      // through them is still necessary; a hit knocks the boat aside as before.
      for(let i=0;i<2;i++) {
        const lanes=[.14,.32,.5,.68,.86].filter(x=>Math.abs(x-this.active.x)>.17);
        const x=lanes[Math.floor(this.random()*lanes.length)];
        this.rocks.push({x,y:.08+i*.18,radius:.028+this.random()*.012,speed:this.active.speed,shape:this.random(),hit:false});
      }
      return {type:'spawn',person:this.active.person};
    }
    const head = this.active;
    head.y += head.speed * dt;
    if (head.y >= .76 && head.y <= .85 && Math.abs(head.x - this.boat) <= .105) {
      this.rescued.push(head.person);
      this.active = null;
      this.wait = .3 + this.random() * .35;
      if (this.rescued.length === this.order.length) this.state = 'won';
      return {type:this.state === 'won' ? 'win' : 'catch',person:head.person};
    }
    if (head.y > .85) {
      this.state = 'lost';
      return {type:'miss',person:head.person};
    }
    return null;
  }
};
