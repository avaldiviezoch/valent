/* Development progression is separate from production; only import proven wins. */
(() => {
  'use strict';
  const memory=new Map();
  const keys=Array.from({length:6},(_,i)=>`valent-development-v3-island-${i+1}-v1`);
  const chapters=[
    {title:'Izar las velas',type:'El rescate de la familia',file:'rescate_v3',ready:true,releaseOn:'2026-10-14'},
    {title:'La torre de Gizmo',type:'Veinte pisos por amor',file:'encuentro_v3',ready:true,releaseOn:'2026-11-14'},
    {title:'La isla del amor de madre',type:'El tablero de los tóxicos',file:'amor_de_madre_v3',ready:true,releaseOn:'2026-12-14'},
    {title:'La luz de encontrarnos',type:'El encuentro',file:'aventuras_v3',ready:false,releaseOn:'2027-01-14'},
    {title:'Un cielo para dos',type:'La constelación',file:'constelacion_v3',ready:false,releaseOn:'2027-02-14'},
    {title:'Nuestro tesoro',type:'El último destino',file:'tesoro_v3',ready:false,releaseOn:'2027-03-14'}
  ];
  function read(key){try{return localStorage.getItem(key)??memory.get(key);}catch{return memory.get(key);}}
  function write(key){memory.set(key,'complete');try{localStorage.setItem(key,'complete');}catch{}}
  function importProduction(){
    for(let i=0;i<2;i++)if(read(`valent-development-island-${i+1}-v1`)==='complete'&&read(keys[i])!=='complete')write(keys[i]);
    if(read('valent-rescate-familia-v1')==='complete'&&read(keys[0])!=='complete')write(keys[0]);
  }
  function completed(i){importProduction();return !!keys[i]&&read(keys[i])==='complete';}
  function ready(i,now=new Date()){
    if(!chapters[i]?.ready)return false;
    // The first three prepared games are explicitly open for development review.
    if(i<3)return true;
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const value=type=>parts.find(p=>p.type===type).value;
    return `${value('year')}-${value('month')}-${value('day')}`>=chapters[i].releaseOn;
  }
  function available(i,now){return ready(i,now)&&keys.slice(0,i).every((_,j)=>completed(j));}
  function complete(i){
    if(completed(i))return true;
    if(!available(i))return false;
    write(keys[i]);window.dispatchEvent(new Event('development-progress'));return true;
  }
  function status(i){
    if(completed(i))return 'complete';
    if(available(i))return 'available';
    if(!ready(i))return 'preparing';
    return 'previous';
  }
  globalThis.DevelopmentJourney={keys,chapters,completed,available,complete,status};
  importProduction();
})();
