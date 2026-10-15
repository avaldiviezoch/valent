const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context={};vm.runInNewContext(fs.readFileSync(require.resolve('../assets/mother-v3-engine.js'),'utf8'),context);
const Board=context.PirateMotherBoard;
assert.deepEqual(Array.from(Board.delays),[800,750,700]);
for(const [index,delay] of [800,750,700].entries()){
 const game=new Board(()=>0);game.start(index+1);assert.equal(game.cells.length,30);
 game.advance(delay-1);assert.equal(game.children,0);game.advance(1);assert.equal(game.children,1);
 assert(game.place(0));assert.equal(game.mothers,1);game.advance(delay);assert.equal(game.cells[0],2,'children overwrite a mother, like factories overwrote trees');
 game.advance(delay*29);assert.equal(game.state,'lost');assert.equal(game.children,30);assert(!game.place(0));
 game.start(index+1);assert.equal(game.children,0);assert.equal(game.elapsed,0);
 for(let i=0;i<29;i++)game.place(i);assert.equal(game.state,'playing');game.place(29);assert.equal(game.state,'won');
 assert(!game.tick());assert.equal(game.mothers,30);assert(!game.place(30));
}
assert.throws(()=>new Board().start(4),/three levels/);
const first=new Board(()=>0),last=new Board(()=>.99999);first.start();last.start();first.tick();last.tick();
assert.equal(first.cells[0],2);assert.equal(last.cells[29],2,'random placement covers both ends of the board');
console.log('PASS 30 spaces, exact 800/750/700 ms boundaries, overwrites, random positions, loss, retry, three wins and no fourth level');
