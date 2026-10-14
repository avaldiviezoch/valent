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
    this.state = 'playing';
  }
  update(dt, direction = 0) {
    if (this.state !== 'playing') return null;
    dt = Math.min(Math.max(dt, 0), .05);
    const clamp = x => Math.min(.91, Math.max(.09, x));
    if (direction) this.target = clamp(this.boat + direction * .7 * dt);
    this.boat = clamp(this.boat + Math.sign(this.target - this.boat) * Math.min(Math.abs(this.target - this.boat), .7 * dt));
    if (!this.active) {
      this.wait -= dt;
      if (this.wait > 0) return null;
      this.active = {person:this.order[this.rescued.length], x:.13 + this.random() * .74, y:-.1, speed:.21 + this.random() * .035 + this.rescued.length * .0015};
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
