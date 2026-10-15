const assert=require('node:assert/strict');
require('../assets/stack-v2-engine.js');
const perfect=new PirateStack(()=>.5);
for(let i=1;i<=20;i++){
 assert.equal(perfect.speed,2*(5.8+(i-1)*.22));
 assert.equal(perfect.axis,i%2?'x':'z');perfect.offset=0;
 const event=perfect.place();assert.equal(event.level,i);assert(event.perfect);
 assert.equal(perfect.blocks.at(-1).w,10);assert.equal(perfect.blocks.at(-1).d,10);
 assert.equal(perfect.state,i===20?'won':'playing');
}
assert.equal(perfect.place(),null);const offset=perfect.offset;perfect.update(.05);assert.equal(perfect.offset,offset);
const cuts=new PirateStack(()=>.5);cuts.offset=2;const x=cuts.place();
assert.equal(x.block.x,-3);assert.equal(x.block.w,8);assert.equal(x.cut.x,5);assert.equal(x.cut.w,2);
cuts.offset=-3;const z=cuts.place();assert.equal(z.block.z,-5);assert.equal(z.block.d,7);assert.equal(z.cut.z,-8);assert.equal(z.cut.d,3);
cuts.offset=.25;assert(cuts.place().perfect);assert.equal(cuts.blocks.at(-1).w,8);
const miss=new PirateStack(()=>.5);miss.offset=12;assert.equal(miss.place().type,'miss');assert.equal(miss.state,'lost');assert.equal(miss.level,0);assert.equal(miss.place(),null);
const near=new PirateStack(()=>.5);near.offset=9.9;assert.equal(near.place().type,'miss');
const motion=new PirateStack(()=>.5);for(let i=0;i<20000;i++){motion.update(.05);assert(motion.offset>=-12&&motion.offset<=12);}
console.log('PASS v2: exactly 20 levels, alternating axes, precise overlap/cut pieces, perfect snaps, misses and terminal states');
