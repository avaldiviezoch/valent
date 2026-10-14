const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.VALENT_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install();
  // Repeatable obstacle lane, with the head in a separate lane. Exercise real
  // movement and collision handling without calling outcome() or editing lives.
  await page.addInitScript(()=>{Crypto.prototype.getRandomValues=function(values){values.fill(2147483648);return values;};});
  await page.goto(base+'/islas/encuentro.html?v=rocas7');
  await page.locator('#dialogue-next').tap();await page.locator('#dialogue-next').tap();await page.locator('#sailing-start').tap();
  const box=await page.locator('#sailing-canvas').boundingBox();let first=false;
  for(let i=0;i<60;i++){
   await page.touchscreen.tap(box.x+box.width*.68,box.y+box.height*.6);
   await page.clock.runFor(50);
   const lives=await page.locator('#rescue-lives').textContent();
   if(lives==='♥ 1'){first=true;assert.equal(await page.locator('#rescue-retry').isVisible(),false);assert.match(await page.locator('#sailing-state').textContent(),/Choque/);}
   if(lives==='♥ 0')break;
  }
  assert(first);assert.equal(await page.locator('#rescue-lives').textContent(),'♥ 0');
  assert(await page.locator('#rescue-retry').isVisible());assert.equal(await page.locator('#sailing-reward').isVisible(),false);
  assert.match(await page.locator('#result-title').textContent(),/dos vidas/);
  await page.locator('#rescue-retry').tap();assert.equal(await page.locator('#rescue-lives').textContent(),'♥ 2');
  assert.deepEqual(errors,[]);console.log(`PASS ${engine.name()} mobile: actual steering into two rocks shows 2→1→0, ends game and retry restores two lives`);
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
