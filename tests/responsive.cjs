const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('#voyage-start').click();await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('#plus,#minus,#center,#sound,.map-footer').count(),0);
 assert.equal(await page.locator('.island').count(),6);
 const sizes=[[320,568],[360,640],[390,844],[414,896],[768,1024],[1024,768],[1440,900],[844,390],[667,375]];
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const layout=await page.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
   return {atlas:rect(document.getElementById('atlas')),heading:rect(document.querySelector('.map-title')),islands:[...document.querySelectorAll('.island')].map(rect),labels:[...document.querySelectorAll('.island')].map(g=>({text:rect(g.querySelector('.name')),background:rect(g.querySelector('.label-bg'))})),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert(!layout.overflow,`overflow at ${width}x${height}`);
  assert(layout.heading.bottom<=layout.atlas.y+1,'heading and map do not overlap');

  for(const r of layout.islands){assert(r.x>=layout.atlas.x-1&&r.right<=layout.atlas.right+1,`island horizontal bounds at ${width}x${height}`);assert(r.y>=layout.atlas.y-1&&r.bottom<=layout.atlas.bottom+1,`island vertical bounds at ${width}x${height}`);}
  for(const {text,background} of layout.labels){assert(text.x>=background.x-1&&text.right<=background.right+1,`label fits at ${width}x${height}`);assert(text.bottom<=background.bottom+1,`label baseline at ${width}x${height}`);}
 }
 console.log('PASS six complete islands and labels visible at nine portrait/landscape sizes; no overlaps or overflow');
 assert.equal(await page.locator('.island.locked').count(),5);
 assert.deepEqual(errors,[]);
 console.log('PASS irregular map layout and five locked islands without JavaScript errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
