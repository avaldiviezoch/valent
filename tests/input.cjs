const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage();const base='http://127.0.0.1:8765';
 await page.goto(base);
 const before=await page.locator('#world').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
 const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:450,id:1},{x:240,y:450,id:2}]});
 for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:150-i*6,y:450,id:1},{x:240+i*6,y:450,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const after=await page.locator('#world').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);assert(after>before,'pinch zoom');
 await page.reload();await page.locator('.island').first().focus();await page.keyboard.press('Enter');await page.waitForURL(/encuentro/);console.log('PASS touch pinch, reset, keyboard island navigation');
 await page.goto(base+'/islas/ruta-corazon.html');const letters=await page.locator('.letter-tile').allTextContents();const ai=letters.indexOf('A');await page.locator('.letter-tile').nth(ai).tap();const far=letters.findIndex((_,i)=>Math.abs(i%4-ai%4)>1||Math.abs(Math.floor(i/4)-Math.floor(ai/4))>1);await page.locator('.letter-tile').nth(far).tap();assert.match(await page.locator('#word-status').textContent(),/vecina/);await page.locator('#word-reset').tap();
 function find(word,p=[]){if(p.length===word.length)return p;for(let i=0;i<16;i++){const last=p.at(-1);if(p.includes(i)||letters[i]!==word[p.length]||(last!==undefined&&(Math.abs(i%4-last%4)>1||Math.abs(Math.floor(i/4)-Math.floor(last/4))>1)))continue;const r=find(word,[...p,i]);if(r)return r;}return null;}
 for(const word of ['AMOR','LUNA','SOL']){const indices=find(word);const boxes=await Promise.all(indices.map(i=>page.locator('.letter-tile').nth(i).boundingBox()));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:boxes[0].x+boxes[0].width/2,y:boxes[0].y+boxes[0].height/2,id:1}]});for(const box of boxes.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 assert(await page.locator('#word-reward').isVisible());assert.equal(await page.locator('.fx i').count(),0);console.log('PASS real touch drag path, non-neighbor rejection and reduced-motion effects');
 await page.goto(base+'/islas/aventuras.html');await page.locator('#sailing-start').tap();await page.locator('[data-steer="arrowleft"]').tap();await page.locator('[data-steer="arrowright"]').tap();assert.match(await page.locator('#sailing-score').textContent(),/0 \/ 5/);console.log('PASS mobile steering controls');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
