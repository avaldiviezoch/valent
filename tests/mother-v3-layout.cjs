const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.VALENT_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch();
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.addInitScript(()=>{localStorage.setItem('valent-development-island-1-v1','complete');localStorage.setItem('valent-development-island-2-v1','complete');});
  await page.clock.install();await page.clock.pauseAt(new Date());await page.goto(base+'/islas/amor_de_madre_v3.html');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}px intro fits`);
  assert.equal(await page.locator('.cast-member:visible').count(),1);
  await page.locator('.cast-member:visible img').evaluate(img=>img.decode());
  if(width===390)await page.screenshot({path:'../../outputs/isla-madre-v3-dialogo.png',fullPage:true});
  for(let i=0;i<4;i++)await page.locator('[data-dialogue-next]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}px board fits`);
  const box=await page.locator('.mother-cell').first().boundingBox();assert(box.width>=44&&box.height>=44,`${width}px touch targets >=44px`);
  assert.equal(await page.locator('.mother-cell img').count(),0,'plain placeholders, no icons');
  await page.locator('#mother-pause').click();await page.keyboard.press('Tab');assert.equal(await page.locator('#mother-modal-action').evaluate(el=>el===document.activeElement),true);
  await page.locator('#mother-modal-action').click();
  // A missing future portrait gracefully falls back to text.
  await page.evaluate(()=>PirateMotherPortraits.levels[0].mother.src='../familia/portrait-not-selected.png');
  await page.locator('.mother-cell').first().click();await page.locator('.mother-cell').first().locator('img').waitFor({state:'detached'});
  assert(await page.locator('.mother-cell').first().locator('.portrait-initial').isVisible());
  // Existing transparent portraits can be selected through the same configuration.
  await page.evaluate(()=>PirateMotherPortraits.levels[0].mother.src='../familia/MAMA.png');
  await page.locator('.mother-cell').nth(1).click();await page.locator('.mother-cell').nth(1).locator('img').evaluate(img=>img.decode());
  assert(await page.locator('.mother-cell').nth(1).locator('.portrait-initial').evaluate(el=>el.hidden));
  assert.equal(await page.locator('.mother-cell').nth(1).locator('img').evaluate(el=>getComputedStyle(el).objectFit),'contain');
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});
 await page.addInitScript(()=>{localStorage.setItem('valent-development-island-1-v1','complete');localStorage.setItem('valent-development-island-2-v1','complete');});
 await page.clock.install();await page.clock.pauseAt(new Date());await page.goto(base+'/islas/amor_de_madre_v3.html');
 const initial=await page.locator('[data-dialogue-copy]').textContent();await page.clock.runFor(300);const later=await page.locator('[data-dialogue-copy]').textContent();assert(later.length>initial.length,'typewriter grows progressively');
 await page.locator('[data-dialogue-next]').click();await page.locator('[data-dialogue-next]').click();assert.equal(await page.locator('#mother-story').getAttribute('data-speaker'),'lucero');assert.equal(await page.locator('.cast-member:visible').count(),1);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.cast-member:visible .character-sway').evaluate(el=>getComputedStyle(el).animationName),'none');
 await browser.close();console.log('PASS v3 layout: five viewport sizes, original sprites, 44px touch targets, modal focus, portrait replacement/fallback, progressive dialogue and reduced motion');
})().catch(error=>{console.error(error);process.exit(1)});
