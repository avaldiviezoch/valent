const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:8765');
  await page.locator('#voyage-start').click();
  const island=page.locator('.island').first();
  const before=await island.boundingBox(),atlas=await page.locator('#atlas').boundingBox();
  const heading=await page.locator('.map-title').boundingBox();
  const x=before.x+before.width/2,targetY=heading.y+heading.height*.65;
  await page.mouse.move(x,before.y+before.height/2);await page.mouse.down();
  await page.mouse.move(x,targetY,{steps:16});await page.mouse.up();
  const moved=await island.boundingBox();
  assert(moved.y+moved.height/2<atlas.y,'island moved above the atlas boundary');
  assert.equal(await page.locator('#atlas').evaluate(e=>getComputedStyle(e).overflowY),'visible');
  assert(await page.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('.island'),{x,y:moved.y+moved.height/2}),'island remains painted and interactive under heading');
  assert.equal(await page.locator('#menu-toggle').isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log(`PASS ${engine.name()}: real island drag remains visible behind title without an internal clipping bar`);
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
