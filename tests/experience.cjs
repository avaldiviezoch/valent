const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.locator('.island').nth(5).click();assert.match(await page.locator('#toast').textContent(),/cinco/);
 await page.goto(base+'/islas/tesoro.html');assert.equal(await page.locator('#treasure-locked').isVisible(),true);
 await page.goto(base+'/islas/encuentro.html');for(let i=0;i<4;i++)await page.locator('#lantern').click();await page.locator('#encounter-reward').waitFor({state:'visible'});await page.locator('[data-finish]').click();await page.waitForURL(base+'/index.html?isla=1');await page.waitForTimeout(100);assert.match(await page.locator('#progress-count').textContent(),/1 de 5/);
 console.log('PASS encounter, persisted progress, locked treasure');
 for(let attempt=0;attempt<12;attempt++){
  await page.goto(base+'/islas/ruta-corazon.html');
  const letters=await page.locator('.letter-tile').allTextContents();let used=new Set();
  function find(word,p=[]){if(p.length===word.length)return p;for(let i=0;i<16;i++){if(used.has(i)||p.includes(i)||letters[i]!==word[p.length])continue;const last=p.at(-1);if(last!==undefined&&(Math.abs(last%4-i%4)>1||Math.abs(Math.floor(last/4)-Math.floor(i/4))>1))continue;const result=find(word,[...p,i]);if(result)return result;}return null;}
  for(const word of ['AMOR','LUNA','SOL']){const p=find(word);assert(p,'solvable '+word);for(const i of p){await page.locator('.letter-tile').nth(i).focus();await page.keyboard.press('Enter');}}
  assert(await page.locator('#word-reward').isVisible());
 }
 await page.locator('[data-finish]').click();await page.waitForURL(/index.html/);console.log('PASS 12 randomized word boards, adjacency and keyboard completion');
 await page.goto(base+'/islas/recuerdos.html');await page.locator('.photo').first().click();for(let i=0;i<3;i++)await page.keyboard.press('ArrowRight');await page.keyboard.press('Escape');assert.equal(await page.locator('#album-finish').isEnabled(),true);
 const imgs=await page.locator('.photo img').evaluateAll(imgs=>imgs.map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>0})));console.log('PHOTOS',JSON.stringify(imgs));
 await page.locator('#album-finish').click();await page.waitForURL(/index.html/);console.log('PASS album navigation, dismissal and finish');
 await page.clock.install();await page.goto(base+'/islas/constelacion.html');
 for(const sequence of [[0,2,4],[3,1,4,2],[0,1,3,4,2]]){await page.locator('#sky-play').click();await page.clock.runFor(8000);for(const i of sequence)await page.locator('.sky-star').nth(i).click();await page.clock.runFor(900);}
 assert(await page.locator('#sky-reward').isVisible());await page.locator('[data-finish]').click();await page.waitForURL(/index.html/);console.log('PASS all three constellation rounds');
 await page.addInitScript(()=>{const original=CanvasRenderingContext2D.prototype.fill;CanvasRenderingContext2D.prototype.fill=function(...args){if(this.fillStyle==='#efd48d'){const t=this.getTransform();window.__buoys??=[];window.__buoys.push({x:t.e,y:t.f});}return original.apply(this,args);};const clear=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...args){window.__buoys=[];return clear.apply(this,args);};});
 await page.goto(base+'/islas/aventuras.html');await page.locator('#sailing-start').click();const rect=await page.locator('canvas').boundingBox();let won=false;
 for(let i=0;i<180;i++){await page.clock.runFor(300);const lights=await page.evaluate(()=>window.__buoys||[]);const b=lights.filter(b=>b.y<400).sort((a,b)=>b.y-a.y)[0];if(b){await page.mouse.move(rect.x+b.x/800*rect.width,rect.y+370/480*rect.height);await page.mouse.down();await page.mouse.move(rect.x+b.x/800*rect.width,rect.y+370/480*rect.height);await page.mouse.up();}if(await page.locator('#sailing-reward').isVisible()){won=true;break;}}
 assert(won,'sailing game can collect five lights');await page.locator('[data-finish]').click();await page.waitForURL(/index.html/);console.log('PASS sailing movement, collection and completion');
 assert.match(await page.locator('#progress-count').textContent(),/5 de 5/);await page.goto(base+'/islas/tesoro.html');await page.locator('#treasure-open').click();await page.clock.runFor(1800);assert(await page.locator('#treasure-reward').isVisible());console.log('PASS treasure unlock and reveal');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});for(const file of ['index.html','islas/encuentro.html','islas/ruta-corazon.html','islas/aventuras.html','islas/constelacion.html','islas/recuerdos.html','islas/tesoro.html']){await page.goto(base+'/'+file);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow,`${file} overflows at ${width}`);}}
 assert.deepEqual(errors,[]);console.log('PASS responsive widths 320/390/768/1440, seven pages, no JavaScript errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
