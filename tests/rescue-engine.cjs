const assert=require('node:assert/strict');
require('../assets/rescue-engine.js');
const people=Array.from({length:18},(_,i)=>({id:String(i),name:String(i)}));
const orders=new Set(),positions=new Set();
for(let run=0;run<30;run++){
 const game=new FamilyRescueEngine(people);if(run%2){game.rockMinRadius=17/358;game.boatRadius=24/358;}orders.add(game.order.map(p=>p.id).join(','));
 assert.equal(new Set(game.order.map(p=>p.id)).size,18);
 let wins=0;
 for(let frame=0;frame<10000 && game.state==='playing';frame++){
  if(game.active)game.target=game.active.x;
  const event=game.update(1/60);
  if(event?.type==='spawn'){positions.add(game.active.x);assert(game.active.x>=.13&&game.active.x<=.87);}
  if(event?.type==='win')wins++;
  assert.notEqual(event?.type,'miss','every spawn is reachable with the real boat speed');
 }
 assert.equal(game.state,'won');assert.equal(game.rescued.length,18);assert.equal(wins,1);assert.equal(game.update(.05),null);
}
assert(orders.size>25);assert(positions.size>500);
const lost=new FamilyRescueEngine(people);
for(let i=0;i<10000&&lost.state==='playing';i++){
 if(lost.active)lost.target=lost.active.x>.5?.09:.91;
 lost.update(1/60);
}
assert.equal(lost.state,'lost');assert.equal(lost.rescued.length,0);assert.equal(lost.update(100),null);
console.log('PASS 30 complete random voyages, 18 unique family members, reachable drops, strict loss and terminal states');

const obstacle=new FamilyRescueEngine(people);obstacle.wait=3;
obstacle.rocks=[{x:.5,y:.77,radius:.035,speed:0,hit:false}];
assert.equal(obstacle.update(1/60).type,'rock');assert.notEqual(obstacle.boat,.5);assert(obstacle.cooldown>0);assert.equal(obstacle.state,'playing');
assert.notEqual(obstacle.update(1/60)?.type,'rock');
console.log('PASS rock collision knocks the boat back, grants brief recovery and does not bypass family rescue');

const speedCheck=new FamilyRescueEngine(people,()=>.5);
for(let i=0;i<9;i++)speedCheck.update(.05);
assert.equal(speedCheck.active.speed,2*(.28+.5*.035));
assert(speedCheck.rocks.every(rock=>rock.speed===speedCheck.active.speed));
console.log('PASS heads and rocks travel at exactly twice the previous speed');
