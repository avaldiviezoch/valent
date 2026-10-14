const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/');await page.locator('#voyage-start').click();
 await page.locator('.ocean.live-water').waitFor();
 assert.equal(await page.locator('.water-surface').count(),1);
 assert.equal(await page.locator('.ocean').evaluate(e=>getComputedStyle(e).animationName),'none','live water does not rely on sliding the photograph');
 const clip={x:5,y:200,width:90,height:55};const first=await page.screenshot({clip});await page.waitForTimeout(550);const second=await page.screenshot({clip});assert(!first.equals(second),'water pixels change with time');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.water-surface').waitFor({state:'detached'});assert.equal(await page.locator('.ocean').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.ocean.live-water').waitFor();await page.setViewportSize({width:844,height:390});
 assert.equal(await page.locator('.water-surface').count(),1);assert.deepEqual(errors,[]);
 const fallback=await browser.newPage();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){if(kind==='webgl')return null;return original.call(this,kind,...args);};});await fallback.goto('http://127.0.0.1:8765/');assert.equal(await fallback.locator('.water-surface').count(),0);assert.equal(await fallback.locator('.ocean').evaluate(e=>getComputedStyle(e).animationName),'ocean-swell');
 console.log('PASS real animated water pixels, motion preference changes, resize and CSS fallback without WebGL');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
