const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage();const base='http://127.0.0.1:8765';
 await page.goto(base);await page.locator('#voyage-start').tap();
 const before=await page.locator('#world').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
 const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:450,id:1},{x:240,y:450,id:2}]});
 for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:150-i*6,y:450,id:1},{x:240+i*6,y:450,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const after=await page.locator('#world').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);assert(after>before,'pinch zoom');
 await page.reload();await page.locator('.island').first().focus();await page.keyboard.press('Enter');await page.waitForURL(/encuentro/);console.log('PASS touch pinch, reset, keyboard island navigation');
 await page.goto(base+'/islas/encuentro.html');await page.locator('#dialogue-next').tap();await page.locator('#dialogue-next').tap();await page.locator('#sailing-start').tap();await page.locator('[data-steer="arrowleft"]').tap();await page.locator('[data-steer="arrowright"]').tap();assert.match(await page.locator('#sailing-score').textContent(),/0 \/ 18/);console.log('PASS mobile steering controls');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
