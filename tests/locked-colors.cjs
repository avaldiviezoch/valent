const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.VALENT_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 for(const [name,engine,width,height,mobile] of [['chromium-mobile',chromium,390,844,true],['webkit-mobile',webkit,390,844,true],['chromium-desktop',chromium,1440,900,false]]){
  const browser=await engine.launch({headless:true});const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('#voyage-start').click();await page.evaluate(()=>document.fonts.ready);
  // Ignore every CSS/SVG filter: the decoded source itself must still be monochrome.
  await page.addStyleTag({content:'.terrain{filter:none!important}'});
  const results=await page.locator('.terrain image').evaluateAll(async images=>Promise.all(images.map(async(el,index)=>{
   const source=el.getAttribute('href'),img=new Image();img.src=source;await img.decode();
   const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
   const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   let colored=0,opaque=0;for(let p=0;p<pixels.length;p+=4){if(pixels[p+3]<245)continue;opaque++;if(Math.max(pixels[p],pixels[p+1],pixels[p+2])-Math.min(pixels[p],pixels[p+1],pixels[p+2])>2)colored++;}
   return {index,source,colored,opaque,opacity:getComputedStyle(el.parentElement).opacity};
  })));
  assert(results[0].colored>1000,`${name}: available island retains its colors`);
  for(const item of results.slice(1)){assert(item.opaque>1000);assert.equal(item.colored,0,`${name}: island ${item.index+1} is actually gray`);assert.equal(item.opacity,'1','the sea cannot tint the gray terrain through group opacity');assert.match(item.source,/-locked.webp$/);}
  assert.equal(await page.locator('.island.locked').count(),5);
  if(name==='webkit-mobile'){
   await page.evaluate(()=>{chapters[1].ready=true;chapters[1].releaseOn='2026-01-14';window.dispatchEvent(new Event('pageshow'));});
   assert.equal(await page.locator('.island').nth(1).locator('image').getAttribute('href'),'assets/island-crescent.webp');
   await page.evaluate(()=>{chapters[1].ready=false;window.dispatchEvent(new Event('pageshow'));});
   assert.match(await page.locator('.island').nth(1).locator('image').getAttribute('href'),/-locked.webp$/);
  }
  assert.deepEqual(errors,[]);console.log('PASS',name,'five pixel-verified gray islands, one colored island, independent of filters');await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
