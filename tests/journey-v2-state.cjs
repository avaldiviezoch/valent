const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../assets/journey-v2.js'),'utf8');
const values=new Map();
function load(){const context={Map,Date,Intl,Event,localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)},dispatchEvent:()=>{}};context.window=context;context.globalThis=context;vm.runInNewContext(source,context);return context.DevelopmentJourney;}
let journey=load();assert(journey.available(0));assert(!journey.available(1));assert(!journey.complete(1));
values.set('valent-izar-velas-v1','complete');assert(!journey.completed(0),'old demonstration progress must not migrate');
values.set('valent-rescate-familia-v1','complete');assert(journey.completed(0));assert(journey.available(1,new Date('2026-10-15T12:00:00Z')));
assert(!journey.available(0));assert(journey.complete(1));assert(journey.completed(1));assert(!journey.available(1));assert.equal(journey.status(2),'preparing');
assert(!values.has('valent-ruta-personal-v1'));assert(!values.has('valent-gizmo-v1'));
journey=load();assert(journey.completed(0)&&journey.completed(1),'completion survives reload');
journey.chapters[2].ready=true;assert(!journey.available(2,new Date('2026-12-14T04:59:59Z')));assert(journey.available(2,new Date('2026-12-14T05:00:00Z')));
journey.chapters[2].releaseOn='2020-01-14';assert(journey.complete(2));assert(!journey.available(2));assert.equal(journey.status(3),'preparing');
assert.equal(journey.chapters[1].title,'La torre de Gizmo');
console.log('PASS development migration, sequential access, persistent completion locks, no production writes and future mesario gating');
