const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:8765';
 await page.goto(base);
 const assets=await page.locator('.island .terrain image').evaluateAll(images=>images.map(img=>img.getAttribute('href')));
 assert.equal(new Set(assets).size,6,'six distinct terrain assets');
 const decoded=await page.evaluate(async assets=>Promise.all(assets.map(src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve({src,width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>resolve({src,error:true});img.src=src;}))),assets);
 assert(decoded.every(img=>img.width>0),'all six terrain images load');console.log('PASS six distinct decoded landscape files',JSON.stringify(decoded));
 for(const viewport of [{width:1440,height:1000},{width:768,height:844},{width:390,height:844},{width:320,height:700}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const bounds=await page.locator('.island .terrain image').evaluateAll(images=>images.map(img=>{const r=img.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));
  for(const r of bounds){assert(r.right>0&&r.x<viewport.width,'island horizontally visible');assert(r.y>60&&r.bottom<viewport.height-70,'island clear of header/footer: '+JSON.stringify({viewport,r}));}
 }
 console.log('PASS atlas layouts 1440, 768, 390 and 320 px');
 const files=['encuentro','ruta-corazon','recuerdos','aventuras','constelacion','tesoro'];
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>['lucero-isla-encuentro-v1','lucero-isla-ruta-v1','lucero-isla-recuerdos-v1','lucero-isla-aventuras-v1','lucero-isla-suenos-v1'].forEach(key=>localStorage.setItem(key,'complete')));
 for(let i=0;i<files.length;i++){
  await page.goto(base+'/index.html');await page.locator('.island').nth(i).focus();await page.keyboard.press('Enter');await page.waitForURL(new RegExp(files[i]+'.html'));
 }
 assert.deepEqual(errors,[]);console.log('PASS six destinations and existing progress, no JavaScript errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
