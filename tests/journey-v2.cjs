const {chromium,webkit}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.VALENT_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/index_v2.html');await page.locator('#voyage-start').click();
  assert.equal(await page.locator('.island[aria-disabled=false]').count(),1);
  assert.match(await page.locator('.island').nth(1).textContent(),/La torre de Gizmo/);
  await page.goto(base+'/islas/encuentro_v2.html');await page.waitForURL(/index_v2/);
  await page.evaluate(()=>localStorage.setItem('valent-rescate-familia-v1','complete'));await page.reload();
  await page.locator('.terrain image').evaluateAll(nodes=>Promise.all(nodes.map(async node=>{const img=new Image();img.src=node.getAttribute('href');await img.decode();})));
  const colored=await page.locator('.terrain image').first().evaluate(async node=>{
   const img=new Image();img.src=node.getAttribute('href');await img.decode();
   const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
   const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   let count=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>245&&Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>2)count++;
   return count;
  });assert.equal(colored,0,'completed first island has a decoded genuinely gray landscape');
  assert(await page.locator('.island').first().evaluate(e=>e.classList.contains('complete')&&e.getAttribute('aria-disabled')==='true'));
  assert.equal(await page.locator('.island').nth(1).getAttribute('aria-disabled'),'false');
  await page.locator('.island').first().click({force:true});assert.match(await page.locator('#toast').textContent(),/completada/);
  await page.locator('#menu-toggle').click();assert.equal(await page.locator('.chapter-links button:enabled').count(),1);
  assert.match(await page.locator('.chapter-links button:enabled').textContent(),/Gizmo/);
  await page.locator('.chapter-links button:enabled').click();await page.waitForURL(/encuentro_v2/);
  assert(await page.locator('#tower-story').isVisible());
  await page.goto(base+'/islas/rescate_v2.html');await page.waitForURL(/index_v2/);
  for(const file of ['recuerdos','aventuras','constelacion','tesoro']){await page.goto(base+'/islas/'+file+'_v2.html');await page.waitForURL(/index_v2/);}
  await page.evaluate(()=>DevelopmentJourney.complete(1));await page.reload();
  assert.equal(await page.locator('.island.complete').count(),2);assert.equal(await page.locator('.island[aria-disabled=false]').count(),0);
  await page.goto(base+'/islas/encuentro_v2.html');await page.waitForURL(/index_v2/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('valent-rescate-familia-v1')),'complete');
  assert.equal(await page.evaluate(()=>localStorage.getItem('valent-ruta-personal-v1')),null);
  await page.goto(base+'/index.html');assert.equal(await page.locator('.island:not(.locked)').count(),1,'production still has only the first game');
  assert.match(await page.locator('.island').nth(1).textContent(),/La ruta del corazón/);
  assert.deepEqual(errors,[]);console.log(`PASS ${engine.name()} development map: import first victory, second active, completed islands disabled, reload and direct URL guards, unchanged production`);
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
