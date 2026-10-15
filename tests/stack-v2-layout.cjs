const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/islas/encuentro_v2.html');
 await page.waitForTimeout(160);const initial=await page.locator('[data-dialogue-copy]').textContent();
 assert(initial.length>0&&initial.length<100,'opening dialogue types progressively');
 await page.locator('[data-dialogue-next]').click();assert.match(await page.locator('[data-dialogue-copy]').textContent(),/veinte pisos/);
 assert.equal(await page.locator('#tower-story').getAttribute('data-speaker'),'antonio');
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
  await page.setViewportSize({width,height});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('.cast-member:visible').count(),1);
 }
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.character-sway').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 for(let i=0;i<4;i++)await page.locator('[data-dialogue-next]').click();
 assert(await page.locator('.gizmo-lookout img').isVisible());
 await page.locator('#tower-canvas').focus();await page.keyboard.press('Space');
 assert(await page.locator('#tower-retry').isVisible(),'keyboard can place a block and trigger a miss');
 assert.deepEqual(errors,[]);console.log('PASS v2 progressive dialogue, one sprite, five layouts, live reduced-motion preference and keyboard placement');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
