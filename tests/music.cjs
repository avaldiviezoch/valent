const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   const OriginalAudio=window.Audio;window.__tracks=[];window.__gains=[];
   window.Audio=function(...args){const track=new OriginalAudio(...args);window.__tracks.push(track);return track;};
   const Engine=window.AudioContext||window.webkitAudioContext;
   if(!Engine)return;
   const gain=Engine.prototype.createGain;
   Engine.prototype.createGain=function(...args){const node=gain.apply(this,args);window.__gains.push(node);return node;};
  });
  await page.goto('http://127.0.0.1:8765');
  await page.locator('#voyage-start').tap();
  await page.waitForFunction(()=>window.__tracks[0]?.currentTime>0);
  assert.match(await page.evaluate(()=>window.__tracks[0].src),/one-piece-episode-1000-special-o.mp3$/);
  assert.equal(await page.evaluate(()=>(window.__gains[0]?.gain.value??window.__tracks[0].volume).toFixed(2)),'0.10');
  assert.equal(await page.evaluate(()=>window.__tracks[0].loop),false);
  assert(await page.evaluate(()=>!window.__gains.length||window.__gains[0].context.state==='running'));
  await page.reload();
  await page.locator('#menu-toggle').tap();
  assert.equal(await page.evaluate(()=>window.__tracks[0].paused),true,'map song only starts once per session');
  await page.goto('http://127.0.0.1:8765/islas/encuentro.html');
  assert.equal(await page.locator('.stage-commentary,.rescue-rules,#reaction-idle').count(),0);
  assert(await page.locator('#asset-status').evaluate(e=>e.classList.contains('sr-only')));
  assert.equal(await page.evaluate(()=>window.__tracks[0].paused),true);
  await page.locator('#dialogue-next').tap();await page.locator('#dialogue-next').tap();
  await page.locator('#sailing-start').tap();
  await page.waitForFunction(()=>window.__tracks[0].currentTime>0);
  assert.match(await page.evaluate(()=>decodeURI(window.__tracks[0].src)),/familia\/MUSICA DE VIDEO JUEGO.mp3$/);
  assert.equal(await page.evaluate(()=>(window.__gains[0]?.gain.value??window.__tracks[0].volume).toFixed(2)),'0.18');
  await page.locator('#rescue-pause').tap();
  assert.equal(await page.evaluate(()=>window.__tracks[0].paused),true);
  await page.locator('#rescue-continue').tap();
  await page.waitForFunction(()=>!window.__tracks[0].paused);
  assert.deepEqual(errors,[]);
  console.log(`PASS ${engine.name()}: real local MP3 playback, low map gain, once per session, game start/pause/resume and removed banners`);
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
