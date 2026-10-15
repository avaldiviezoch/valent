const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.VALENT_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 for(const [engine,mobile] of [[chromium,false],[webkit,true]]){
  if(process.env.VALENT_PORTRAIT_ENGINE&&engine.name()!==process.env.VALENT_PORTRAIT_ENGINE)continue;
  const browser=await engine.launch();const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{localStorage.setItem('valent-development-island-1-v1','complete');localStorage.setItem('valent-development-island-2-v1','complete');});
  await page.clock.install();await page.clock.pauseAt(new Date());await page.goto(base+'/islas/amor_de_madre_v3.html');
  for(let i=0;i<4;i++)await page.locator('[data-dialogue-next]').click();
  const children=async(values,delay)=>{
   for(const value of values){await page.evaluate(value=>{Math.random=()=>value;},value);await page.clock.runFor(delay);}
   await page.locator('.is-child img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  };
  await children([0,.999],820);
  assert.deepEqual(await page.locator('.is-child img').evaluateAll(images=>images.map(image=>image.getAttribute('src')).sort()),['../familia/LOGAN.png','../familia/MEGAN.png']);
  const original=await page.locator('.is-child').evaluateAll(cells=>cells.map(cell=>[cell.dataset.index,cell.querySelector('img').src]));
  await page.locator('.mother-cell:not(.is-child)').first().click();
  const mother=page.locator('.is-mother img').first();await mother.evaluate(image=>image.decode());assert.match(await mother.getAttribute('src'),/JENNY.png$/);
  assert.deepEqual(await page.locator('.is-child').evaluateAll(cells=>cells.map(cell=>[cell.dataset.index,cell.querySelector('img').src])),original,'other taps do not reshuffle existing children');
  await page.locator('#mother-pause').click();await page.clock.runFor(3000);await page.locator('#mother-modal-action').click();
  assert.deepEqual(await page.locator('.is-child').evaluateAll(cells=>cells.map(cell=>[cell.dataset.index,cell.querySelector('img').src])),original,'pause preserves the chosen faces');
  assert.equal(await page.locator('.has-portrait+.token-caption:visible').count(),0,'portraits have no visible name labels');
  assert.equal(await mother.evaluate(image=>getComputedStyle(image).objectFit),'contain');
  if(mobile)await page.screenshot({path:'../../outputs/tablero-v3-jenny-hijos.png',fullPage:true});
  for(let i=0;i<30;i++)await page.locator('.mother-cell').nth(i).click();await page.locator('#mother-modal-action').click();
  assert.equal(await page.locator('#mother-level').textContent(),'Nivel 2 / 3');await children([0,.999],820);
  assert.deepEqual(await page.locator('.is-child img').evaluateAll(images=>images.map(image=>image.getAttribute('src')).sort()),['../familia/MATEO%202.png','../familia/NATHALIA.png']);
  await page.locator('.mother-cell:not(.is-child)').first().click();await page.locator('.is-mother img').evaluate(image=>image.decode());
  assert.match(await page.locator('.is-mother img').getAttribute('src'),/KAREN.png$/);
  assert.equal(await page.locator('.has-portrait+.token-caption:visible').count(),0);
  if(mobile)await page.screenshot({path:'../../outputs/tablero-v3-karen-hijos.png',fullPage:true});
  for(let i=0;i<30;i++)await page.locator('.mother-cell').nth(i).click();await page.locator('#mother-modal-action').click();
  assert.equal(await page.locator('#mother-level').textContent(),'Nivel 3 / 3');await children([0,.4,.999],750);
  assert.deepEqual(await page.locator('.is-child img').evaluateAll(images=>images.map(image=>image.getAttribute('src')).sort()),['../familia/HARRY.png','../familia/IVAN.png','../familia/JHON.png']);
  await page.locator('.mother-cell:not(.is-child)').first().click();await page.locator('.is-mother img').evaluate(image=>image.decode());assert.match(await page.locator('.is-mother img').getAttribute('src'),/MAMA.png$/);
  if(mobile)await page.screenshot({path:'../../outputs/tablero-v3-mama-hijos.png',fullPage:true});
  for(let i=0;i<30;i++)await page.locator('.mother-cell').nth(i).click();assert.equal(await page.evaluate(()=>localStorage.getItem('valent-development-v3-island-3-v1')),'complete');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  console.log(`PASS ${engine.name()} ${mobile?'mobile':'desktop'}: Jenny/Megan/Logan, Karen/Mateo 2/Nathalia, Mamá/Iván/Jhon/Harry, per-appearance random selection, stable faces, decoded PNGs, hidden labels and saved victory`);
  await browser.close();
 }
})().catch(error=>{console.error(error);process.exit(1)});
