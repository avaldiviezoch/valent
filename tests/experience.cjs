const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.VALENT_TEST_URL||'http://127.0.0.1:8765';
const dev=process.env.VALENT_DEVELOPMENT==='1';
const completionKey=dev?'valent-development-island-1-v1':'valent-rescate-familia-v1';
(async()=>{
 for(const [engine,viewport,mobile] of [[chromium,{width:1440,height:900},false],[chromium,{width:390,height:844},true],[webkit,{width:390,height:844},true]]){
  const browser=await engine.launch({headless:true});
  const page=await browser.newPage({viewport,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install();
  await page.addInitScript(()=>{
   localStorage.setItem('valent-izar-velas-v1','complete');
   const draw=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(img,...args){
    if(this.canvas.id==='sailing-canvas' && img.src?.includes('/familia/') && !/SALVADORA|MALVADO/.test(img.src)) window.__head={x:args[0]+args[2]/2,id:img.src};
    return draw.call(this,img,...args);
   };
  });
  await page.goto(base+'/islas/'+(dev?'rescate_v2':'encuentro')+'.html');
  await page.evaluate(()=>{window.__musicCalls=[];const original=ValentGameMusic.play;ValentGameMusic.play=function(restart=false){window.__musicCalls.push(restart);return original.call(this,restart);};});
  await page.locator('#dialogue-next').click();assert.match(await page.locator('#speaker').textContent(),/Lucero/);
  await page.locator('#dialogue-next').click();await page.locator('#sailing-start').click();
  assert.equal(await page.locator('#family-roster li').count(),18);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),completionKey),null);
  assert.equal(await page.locator('.character-sway').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  const box=await page.locator('#sailing-canvas').boundingBox();
  // Two missed catches consume the two lives; a first miss must not end the game.
  let survivedFirstMiss=false;
  for(let i=0;i<65;i++){
   await page.clock.runFor(200);const head=await page.evaluate(()=>window.__head);
   if(head)await page.locator('#sailing-canvas').dispatchEvent('pointermove',{clientX:box.x+(head.x>box.width/2?0:box.width),clientY:box.y+20,pointerType:'mouse'});
   if((await page.locator('#rescue-lives').textContent()).includes('1')){survivedFirstMiss=true;assert(!(await page.locator('#rescue-retry').isVisible()));}
   if(await page.locator('#rescue-retry').isVisible())break;
  }
  assert(survivedFirstMiss);assert.equal(await page.locator('#rescue-lives').textContent(),'♥ 0');
  assert(await page.locator('#rescue-retry').isVisible());assert.equal(await page.locator('#sailing-reward').isVisible(),false);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),completionKey),null);
  await page.locator('#rescue-retry').click();assert.equal(await page.locator('#rescue-lives').textContent(),'♥ 2');await page.locator('#rescue-pause').click();
  const score=await page.locator('#sailing-score').textContent();await page.clock.runFor(1500);assert.equal(await page.locator('#sailing-score').textContent(),score);
  await page.locator('#rescue-continue').click();
  let won=false;const reactions=new Set();
  for(let i=0;i<480;i++){
   await page.clock.runFor(200);const head=await page.evaluate(()=>window.__head);
   if(head){await page.locator('#sailing-canvas').dispatchEvent('pointermove',{clientX:box.x+head.x,clientY:box.y+box.height*.7,pointerType:mobile?'touch':'mouse',pointerId:1});
    if(mobile)await page.touchscreen.tap(box.x+head.x,box.y+box.height*.7);
   }
   const milestone=await page.locator('#antonio-reaction').getAttribute('data-milestone');
   if(milestone){reactions.add(Number(milestone));assert(await page.locator('#antonio-reaction').isVisible());assert.equal(await page.locator('#antonio-reaction').evaluate(e=>getComputedStyle(e).position),'fixed');const current=await page.locator('#sailing-canvas').boundingBox();assert.equal(current.y,box.y);assert.equal(current.height,box.height);}
   if(await page.locator('#sailing-reward').isVisible()){won=true;break;}
   assert.equal(await page.locator('#rescue-retry').isVisible(),false,'autopilot can reach each portrait');
  }
  assert.deepEqual([...reactions].sort((a,b)=>a-b),[4,8,12]);
  assert.equal(await page.evaluate(()=>window.__musicCalls.filter(Boolean).length),4,'music restarts on start, loss, retry and win');
  assert(won,'all 18 family members can be saved');assert.equal(await page.locator('#family-roster .rescued').count(),18);
  assert.match(await page.locator('#sailing-reward').textContent(),/Tu bebito, Antonio/);
  assert(await page.locator('#rescue-story').isVisible());await page.locator('#dialogue-next').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));await page.clock.runFor(100);await page.locator('#dialogue-next').click();assert.match(await page.locator('#speaker').textContent(),/Lucero/);
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
  await page.locator('#rescue-save').click();await page.waitForURL(dev?/index_v2.html/:/index.html/);
  assert.equal(await page.locator('.island.complete').count(),1);assert.equal(await page.locator('.island.locked').count(),5);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),completionKey),'complete');if(dev){assert.equal(await page.locator('.island[data-status=available]').count(),1);assert.match(await page.locator('.island[data-status=available]').getAttribute('aria-label'),/Gizmo/);assert.equal(await page.evaluate(()=>localStorage.getItem('valent-rescate-familia-v1')),null);}
  assert.deepEqual(errors,[]);
  console.log(`PASS ${engine.name()} ${mobile?'mobile':'desktop'}: intro, strict loss, retry, pause, 18 catches, ending, isolated save, five locked islands`);
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
