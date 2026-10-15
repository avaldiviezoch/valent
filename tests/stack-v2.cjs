const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.VALENT_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 for(const [engine,width,height,mobile] of [[chromium,1440,1000,false],[chromium,390,844,true],[webkit,390,844,true]]){
  if(process.env.STACK_ENGINE&&process.env.STACK_ENGINE!==engine.name())continue;
  const browser=await engine.launch();const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install();
  // Observe the actual model's moving position; all placement uses real UI.
  await page.addInitScript(()=>{
   localStorage.setItem('valent-development-island-1-v1','complete');
   let Original;
   Object.defineProperty(window,'PirateStack',{configurable:true,get(){return Original;},set(Engine){
    Original=class extends Engine{constructor(...args){super(...args);window.__stack=this;}};
   }});
  });
  await page.goto(base+'/islas/encuentro_v2.html');
  assert.equal(await page.locator('body').getAttribute('data-development'),'true');
  assert.equal(await page.locator('#tower-play').isVisible(),false);
  assert.equal(await page.locator('.cast-member:visible').count(),1);
  for(let i=0;i<4;i++)await page.locator('[data-dialogue-next]').click();
  await page.waitForFunction(()=>document.querySelector('#tower-load-retry').hidden);
  assert(await page.locator('#tower-play').isVisible());assert(await page.locator('.gizmo-lookout img').isVisible());
  await page.locator('#tower-pause').click();const paused=await page.evaluate(()=>window.__stack.offset);
  await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>window.__stack.offset),paused);await page.locator('#tower-resume').click();
  const placeUI=async()=>{const box=await page.locator('#tower-canvas').boundingBox();const x=box.x+box.width/2,y=Math.min(height-20,Math.max(20,box.y+box.height/2));if(mobile)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);};
  // Choose an unsupported position and use the actual canvas input.
  for(let i=0;i<300&&await page.evaluate(()=>Math.abs(__stack.offset))<10;i++)await page.clock.runFor(16);
  await placeUI();assert(await page.locator('#tower-retry').isVisible(),JSON.stringify(await page.evaluate(()=>({state:__stack.state,level:__stack.level,offset:__stack.offset,overlay:document.querySelector('#tower-overlay').hidden,title:document.querySelector('#tower-result-title').textContent}))));
  assert.equal(await page.locator('#tower-reward').isVisible(),false);await page.locator('#tower-retry').click();
  for(let level=1;level<=20;level++){
   let safe=false;
   for(let frame=0;frame<600;frame++){
    await page.clock.runFor(16);
    const distance=await page.evaluate(()=>Math.abs(window.__stack.offset));
    if(distance<.12){safe=true;break;}
   }
   assert(safe,'moving deck crosses the support');
   await placeUI();
   assert.equal(await page.locator('#tower-count').textContent(),`${level} / 20 pisos`);
   if(level===10)assert.equal(await page.locator('#tower-reward').isVisible(),false);
   if(level===12&&engine===chromium&&mobile)await page.screenshot({path:'../../outputs/torre-gizmo-v2-movil.png',fullPage:true});
  }
  await page.clock.runFor(100);
  assert.equal(await page.locator('#tower-story').getAttribute('data-speaker'),'gizmo');
  assert.match(await page.locator('[data-dialogue-copy]').textContent(),/Gracias, mamá, por salvarme/);
  for(const actor of ['antonio','lucero','antonio']){await page.locator('[data-dialogue-next]').click();assert.equal(await page.locator('#tower-story').getAttribute('data-speaker'),actor);}
  await page.locator('[data-dialogue-next]').click();assert(await page.locator('#tower-reward').isVisible());
  assert.match(await page.locator('#tower-reward').textContent(),/tu Antonio/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('valent-rescate-familia-v1')),null);
  assert.equal(await page.evaluate(()=>localStorage.getItem('valent-ruta-personal-v1')),null);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  assert.equal(await page.evaluate(()=>localStorage.getItem('valent-development-island-2-v1')),'complete');
  await page.locator('#tower-return').click();await page.waitForURL(/index_v2.html/);
  assert.equal(await page.locator('.island.complete').count(),2);assert.equal(await page.locator('.island[aria-disabled="false"]').count(),0);
  await page.reload();assert.equal(await page.locator('.island.complete').count(),2);
  console.log(`PASS v2 ${engine.name()} ${mobile?'mobile':'desktop'}: dialogue, Gizmo, pause, loss, retry, 20 placements, ending and production progress isolation`);
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
