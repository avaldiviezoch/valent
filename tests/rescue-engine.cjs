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
assert.equal(obstacle.update(1/60).type,'rock');assert.notEqual(obstacle.boat,.5);assert(obstacle.cooldown>0);assert.equal(obstacle.state,'playing');assert.equal(obstacle.lives,1);
assert.notEqual(obstacle.update(1/60)?.type,'rock');
console.log('PASS rock collision knocks the boat back, grants brief recovery and does not bypass family rescue');

const speedCheck=new FamilyRescueEngine(people,()=>.5);
for(let i=0;i<9;i++)speedCheck.update(.05);
assert.equal(speedCheck.active.speed,2*(.28+.5*.035));
assert(speedCheck.rocks.every(rock=>rock.speed===speedCheck.active.speed));
console.log('PASS heads and rocks travel at exactly twice the previous speed');

const retry=new FamilyRescueEngine(people,()=>.5);
let failedId,lifeEvents=0;
for(let i=0;i<10000&&retry.state==='playing';i++){
 if(retry.active)retry.target=retry.active.x>.5?.09:.91;
 const event=retry.update(1/60);
 if(event?.type==='life'){lifeEvents++;failedId=event.person.id;assert.equal(retry.lives,1);assert.equal(retry.state,'playing');}
 if(event?.type==='spawn'&&failedId)assert.equal(event.person.id,failedId,'missed family member comes back');
}
assert.equal(lifeEvents,1);assert.equal(retry.lives,0);assert.equal(retry.state,'lost');
const comeback=new FamilyRescueEngine(people,()=>.5);let spent=false;
for(let i=0;i<10000&&comeback.state==='playing';i++){
 if(comeback.active)comeback.target=spent?comeback.active.x:.09;
 const event=comeback.update(1/60);if(event?.type==='life')spent=true;
}
assert(spent);assert.equal(comeback.state,'won');assert.equal(comeback.rescued.length,18);assert.equal(comeback.lives,1);
console.log('PASS exactly two lives, first miss continues, second loses, missed family returns and all 18 can still be saved');

const crashes=new FamilyRescueEngine(people);crashes.wait=10;
const rock=()=>({x:crashes.boat,y:.77,radius:.035,speed:0,hit:false});
crashes.rocks=[rock()];assert.equal(crashes.update(0).type,'rock');assert.equal(crashes.lives,1);
crashes.boat=crashes.target=.5;assert.equal(crashes.update(0),null);assert.equal(crashes.lives,1,'same rock cannot deal damage twice');
crashes.rocks.push(rock());const fatal=crashes.update(0);assert.equal(fatal.type,'miss');assert.equal(fatal.reason,'rock');assert.equal(crashes.lives,0);assert.equal(crashes.state,'lost');assert.equal(crashes.update(.05),null);
const mixed=new FamilyRescueEngine(people);mixed.active={person:people[0],x:.8,y:.9,speed:0};mixed.update(0);assert.equal(mixed.lives,1);
mixed.rocks=[{x:mixed.boat,y:.77,radius:.035,speed:0,hit:false}];assert.equal(mixed.update(0).type,'miss');assert.equal(mixed.lives,0);
console.log('PASS two distinct rocks end the game even during the blink, same rock counts once, and missed heads share the same lives');
