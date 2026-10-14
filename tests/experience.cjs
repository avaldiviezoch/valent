const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();
 await page.addInitScript(()=>{const original=CanvasRenderingContext2D.prototype.fill;CanvasRenderingContext2D.prototype.fill=function(...args){if(this.fillStyle==='#efd48d'){const t=this.getTransform();window.__buoys??=[];window.__buoys.push({x:t.e,y:t.f});}return original.apply(this,args);};const clear=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...args){window.__buoys=[];return clear.apply(this,args);};});
 await page.goto(base+'/islas/encuentro.html');await page.locator('#sailing-start').click();const rect=await page.locator('canvas').boundingBox();let won=false;
 for(let i=0;i<180;i++){await page.clock.runFor(300);const lights=await page.evaluate(()=>window.__buoys||[]);const b=lights.filter(b=>b.y<400).sort((a,b)=>b.y-a.y)[0];if(b){await page.mouse.move(rect.x+b.x/800*rect.width,rect.y+370/480*rect.height);await page.mouse.down();await page.mouse.move(rect.x+b.x/800*rect.width,rect.y+370/480*rect.height);await page.mouse.up();}if(await page.locator('#sailing-reward').isVisible()){won=true;break;}}
 assert(won,'sailing game can collect five lights');await page.locator('[data-finish]').click();await page.waitForURL(/index.html/);console.log('PASS sailing movement, collection and completion');

 assert.equal(await page.locator('.island.complete').count(),1);
 assert.equal(await page.locator('.island.locked').count(),5);
 await page.locator('#menu-toggle').click();
 assert.match(await page.locator('#journey-progress').textContent(),/Recuerdo guardado/);
 assert.equal(await page.evaluate(()=>localStorage.getItem('valent-izar-velas-v1')),'complete');
 assert.deepEqual(errors,[]);console.log('PASS first-game completion saves its new progress; the five future games remain locked');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
