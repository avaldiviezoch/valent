const assert=require('node:assert/strict');
require('../assets/rescue-engine.js');
const people=Array.from({length:18},(_,i)=>({id:String(i),name:String(i)}));
const orders=new Set(),positions=new Set();
for(let run=0;run<30;run++){
 const game=new FamilyRescueEngine(people);orders.add(game.order.map(p=>p.id).join(','));
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
