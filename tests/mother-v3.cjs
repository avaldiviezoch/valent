const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.VALENT_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 for(const [engine,mobile] of [[chromium,false],[chromium,true],[webkit,true]]){
  const browser=await engine.launch();const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.clock.install();await page.clock.pauseAt(new Date());
  await page.addInitScript(()=>{
   let Board;Object.defineProperty(window,'PirateMotherBoard',{configurable:true,get:()=>Board,set:value=>{Board=class extends value{constructor(...args){super(...args);window.__mother=this;}};}});
  });
  await page.goto(base+'/islas/amor_de_madre_v3.html');await page.waitForURL(/index_v3/);
  await page.goto(base+'/index_v3.html');await page.locator('#voyage-start').click();
  assert.equal(await page.locator('.island[aria-disabled=false]').count(),1);
  // Import the actual earlier version's wins without changing production progress.
  await page.evaluate(()=>{localStorage.setItem('valent-development-island-1-v1','complete');localStorage.setItem('valent-development-island-2-v1','complete');});
  await page.reload();assert.equal(await page.locator('.island[aria-disabled=false]').count(),3);
  assert.match(await page.locator('.island').nth(2).getAttribute('aria-label'),/La isla del amor de madre/);
  await page.locator('#menu-toggle').click();await page.locator('.chapter-links button').nth(2).click();await page.clock.runFor(1600);await page.waitForURL(/amor_de_madre_v3/);
  for(const actor of ['antonio','lucero','antonio','lucero']){
   assert.equal(await page.locator('#mother-story').getAttribute('data-speaker'),actor);assert.equal(await page.locator('.cast-member:visible').count(),1);await page.locator('[data-dialogue-next]').click();
  }
  assert(await page.locator('#mother-play').isVisible());assert.equal(await page.locator('.mother-cell').count(),30);
  await page.clock.runFor(820);assert.equal(await page.locator('.is-child').count(),1);
  assert.equal(await page.evaluate(()=>__mother.delay),800);
  await page.locator('.is-child').first().click();assert.equal(await page.locator('.is-mother').count(),1);
  await page.locator('#mother-pause').click();const before=await page.evaluate(()=>JSON.stringify({cells:__mother.cells,elapsed:__mother.elapsed}));
  await page.clock.runFor(5000);assert.equal(await page.evaluate(()=>JSON.stringify({cells:__mother.cells,elapsed:__mother.elapsed})),before);
  assert(await page.locator('main').evaluate(el=>el.inert));await page.locator('#mother-modal-action').click();
  // Let all thirty children occupy the board and retry level one.
  await page.clock.runFor(26000);assert.match(await page.locator('#mother-modal-title').textContent(),/alborotó/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('valent-development-v3-island-3-v1')),null);
  await page.locator('#mother-modal-action').click();assert.equal(await page.locator('#mother-count').textContent(),'0 / 30');
  await page.locator('#mother-restart').click();assert(await page.locator('#mother-modal-cancel').isVisible());await page.locator('#mother-modal-cancel').click();
  // Native keyboard controls work and a simulated tab switch pauses the game.
  await page.locator('.mother-cell').first().focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.dataset.index),'1');await page.keyboard.press('Space');assert.equal(await page.locator('.is-mother').count(),1);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert(await page.locator('#mother-modal').isVisible());await page.locator('#mother-modal-action').click();
  for(let level=1;level<=3;level++){
   assert.equal(await page.evaluate(()=>__mother.delay),[800,750,700][level-1]);
   if(level===2){
    await page.clock.runFor(23000);assert.match(await page.locator('#mother-modal-title').textContent(),/alborotó/);await page.locator('#mother-modal-action').click();assert.equal(await page.locator('#mother-level').textContent(),'Nivel 2 / 3');
   }
   for(let i=0;i<29;i++)await page.locator('.mother-cell').nth(i).click();
   assert.equal(await page.evaluate(()=>localStorage.getItem('valent-development-v3-island-3-v1')),null);
   if(level===2&&mobile&&engine===chromium)await page.screenshot({path:'../../outputs/tablero-pirata-v3-movil.png',fullPage:true});
   await page.locator('.mother-cell').nth(29).click();
   if(level<3){assert.match(await page.locator('#mother-modal-title').textContent(),/Mamás al mando/);await page.locator('#mother-modal-action').click();}
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('valent-development-v3-island-3-v1')),'complete');
  assert.match(await page.locator('#mother-modal-title').textContent(),/Salvaste la isla/);await page.locator('#mother-modal-action').click();
  for(const actor of ['antonio','lucero','antonio']){assert.equal(await page.locator('#mother-story').getAttribute('data-speaker'),actor);await page.locator('[data-dialogue-next]').click();}
  assert(await page.locator('#mother-reward').isVisible());assert.match(await page.locator('#mother-reward').textContent(),/tu Antonio/);
  await page.locator('#mother-replay').click();assert.equal(await page.locator('#mother-level').textContent(),'Nivel 1 / 3');assert.equal(await page.evaluate(()=>localStorage.getItem('valent-development-v3-island-3-v1')),'complete');
  await page.goto(base+'/index_v3.html');assert.equal(await page.locator('.island.complete').count(),3);assert.equal(await page.locator('.island[aria-disabled=false]').count(),3);
  await page.reload();assert.equal(await page.locator('.island.complete').count(),3);assert.equal(await page.locator('.island.locked').count(),3);
  if(mobile&&engine===chromium)await page.screenshot({path:'../../outputs/mapa-v3-tres-islas.png',fullPage:true});
  await page.goto(base+'/islas/amor_de_madre_v3.html');assert(await page.locator('#mother-story').isVisible());
  await page.goto(base+'/islas/aventuras_v3.html');await page.waitForURL(/index_v3/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('valent-development-island-3-v1')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('valent-rescate-familia-v1')),null);
  await page.goto(base+'/index_v2.html');assert.equal(await page.locator('.island[aria-disabled=false]').count(),2);assert.match(await page.locator('.island').nth(2).textContent(),/Nuestros recuerdos/);
  await page.goto(base+'/index.html');assert.equal(await page.locator('.island[aria-disabled=false]').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  console.log(`PASS v3 ${engine.name()} ${mobile?'mobile':'desktop'}: map, migration, dialogue, 30 cells, timing, keyboard, pause, loss, same-level retries, three wins, final letter, replay, persistence, v2 and production isolation`);
  await browser.close();
 }
})().catch(error=>{console.error(error);process.exit(1);});
