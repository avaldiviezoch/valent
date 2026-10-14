const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:8765';
 await page.goto(base);await page.locator('#voyage-start').click();
 const assets=await page.locator('.island .terrain image').evaluateAll(images=>images.map(img=>img.getAttribute('href')));
 assert.equal(new Set(assets).size,6,'six distinct terrain assets');
 const decoded=await page.evaluate(async assets=>Promise.all(assets.map(src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve({src,width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>resolve({src,error:true});img.src=src;}))),assets);
 assert(decoded.every(img=>img.width>0),'all six terrain images load');console.log('PASS six distinct decoded landscape files',JSON.stringify(decoded));
 for(const viewport of [{width:1440,height:1000},{width:768,height:844},{width:390,height:844},{width:320,height:700}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const bounds=await page.locator('.island .terrain image').evaluateAll(images=>images.map(img=>{const r=img.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));
  for(const r of bounds){assert(r.right>0&&r.x<viewport.width,'island horizontally visible');assert(r.y>60&&r.bottom<=viewport.height,'island visible below the header: '+JSON.stringify({viewport,r}));}
 }
 console.log('PASS atlas layouts 1440, 768, 390 and 320 px');
 assert.deepEqual(errors,[]);console.log('PASS island resources and responsive map without JavaScript errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
