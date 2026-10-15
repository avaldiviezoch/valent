const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../assets/journey-v3.js'),'utf8');const values=new Map();
function load(){const c={Map,Date,Intl,Event,localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)},dispatchEvent:()=>{}};c.window=c;c.globalThis=c;vm.runInNewContext(source,c);return c.DevelopmentJourney;}
let journey=load();assert(journey.available(0));assert(!journey.available(1));assert(!journey.available(2));assert(!journey.complete(2));
values.set('valent-development-island-1-v1','complete');assert(journey.completed(0));assert(journey.available(0));assert(journey.available(1));assert(!journey.available(2));
values.set('valent-development-island-2-v1','complete');assert(journey.completed(1));assert(journey.available(2,new Date('2026-10-15T12:00:00Z')));assert(journey.complete(2));
journey=load();assert(journey.completed(2));assert(journey.available(0)&&journey.available(1)&&journey.available(2));assert(!journey.available(3));
assert(!values.has('valent-development-island-3-v1'));assert(!values.has('valent-rescate-familia-v1'));assert(!values.has('valent-ruta-personal-v1'));
assert.equal(journey.chapters[2].title,'La isla del amor de madre');assert.equal(journey.chapters[2].file,'amor_de_madre_v3');
assert.equal(journey.chapters[1].releaseOn,'2026-11-14');assert.equal(journey.chapters[2].releaseOn,'2026-12-14');
values.clear();values.set('valent-rescate-familia-v1','complete');journey=load();assert(journey.completed(0));assert(!journey.completed(1));assert(!journey.available(2));
console.log('PASS isolated v3 wins, import proven v2 and production progress, sequential access, replay, monthly release metadata and future locks');
