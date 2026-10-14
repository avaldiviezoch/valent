const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('#welcome,#plus,#minus,#center,#sound').count(),0);
 assert.equal(await page.locator('.island').count(),6);
 const sizes=[[320,568],[360,640],[390,844],[414,896],[768,1024],[1024,768],[1440,900],[844,390],[667,375]];
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const layout=await page.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
   return {atlas:rect(document.getElementById('atlas')),heading:rect(document.querySelector('.map-title')),footer:rect(document.querySelector('.map-footer')),islands:[...document.querySelectorAll('.island')].map(rect),labels:[...document.querySelectorAll('.island')].map(g=>({text:rect(g.querySelector('.name')),background:rect(g.querySelector('.label-bg'))})),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert(!layout.overflow,`overflow at ${width}x${height}`);
  assert(layout.heading.bottom<=layout.atlas.y+1,'heading and map do not overlap');
  assert(layout.atlas.bottom<=layout.footer.y+1,'map and footer do not overlap');
  for(const r of layout.islands){assert(r.x>=layout.atlas.x-1&&r.right<=layout.atlas.right+1,`island horizontal bounds at ${width}x${height}`);assert(r.y>=layout.atlas.y-1&&r.bottom<=layout.atlas.bottom+1,`island vertical bounds at ${width}x${height}`);}
  for(const {text,background} of layout.labels){assert(text.x>=background.x-1&&text.right<=background.right+1,`label fits at ${width}x${height}`);assert(text.bottom<=background.bottom+1,`label baseline at ${width}x${height}`);}
 }
 console.log('PASS six complete islands and labels visible at nine portrait/landscape sizes; no overlaps or overflow');
 const first=await page.locator('.ocean').evaluate(e=>getComputedStyle(e).transform);
 await page.waitForTimeout(400);
 const second=await page.locator('.ocean').evaluate(e=>getComputedStyle(e).transform);
 assert.notEqual(first,second,'ocean surface moves');
 assert.equal(await page.locator('.ocean').evaluate(e=>getComputedStyle(e,'::before').animationName),'ocean-current');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.ocean').evaluate(e=>getComputedStyle(e).animationName),'none');
 console.log('PASS moving sea and reduced-motion setting');
 for(const file of ['encuentro','ruta-corazon','recuerdos','aventuras','constelacion','tesoro']){
  await page.goto(base+'/islas/'+file+'.html');assert.equal(await page.locator('#sound').count(),0);
 }
 await page.goto(base);await page.locator('.island').first().click();await page.waitForURL(/encuentro.html/);
 await page.locator('#lantern').click();
 assert.equal(await page.evaluate(()=>document.querySelector('.lantern').style.getPropertyValue('--light')),'25');
 assert.equal(await page.evaluate(()=>audio?.state),'running','sound unlocks on the first interaction');
 assert.deepEqual(errors,[]);
 console.log('PASS removed music controls across seven pages; island interaction and default sound work without JavaScript errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
