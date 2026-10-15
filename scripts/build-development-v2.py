"""Copy production into isolated development routes; never overwrite production."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]

def write(name,text):
    (ROOT/name).write_text(text,encoding='utf-8',newline='\n')

def replace_once(text,old,new):
    if text.count(old)!=1:
        raise ValueError(f'Expected one source anchor: {old[:70]}')
    return text.replace(old,new,1)

def development_html(source):
    text=(ROOT/source).read_text(encoding='utf-8')
    text=text.replace('href="../index.html"','href="../index_v2.html"').replace('href="index.html"','href="index_v2.html"')
    text=re.sub(r'<script defer src="((?:\.\./)?assets/)experience\.js\?v=\d+"></script>',
                r'<script defer src="\1journey-v2.js?v=1"></script><script defer src="\1experience-v2.js?v=1"></script>',text)
    text=text.replace('<body ','<body data-development="true" ',1)
    return text

source=(ROOT/'assets/experience.js').read_text(encoding='utf-8')
source=re.sub(r'const keys = \[.*?\];','const keys = DevelopmentJourney.keys;',source,count=1)
start=source.index('const chapters=[')
end=source.index('// Audio effects',start)
source=source[:start]+'''const chapters=DevelopmentJourney.chapters;
function chapterAvailable(i,now=new Date()){return DevelopmentJourney.available(i,now);}
'''+source[end:]
start=source.index('function saveStop(i)')
end=source.index('\ndocument.querySelectorAll',start)
source=source[:start]+'''function saveStop(i) {
 if(!DevelopmentJourney.complete(i)){toast('Primero completa la isla anterior.');return;}
 location.href='../index_v2.html?isla='+(i+1);
}
'''+source[end:]
start=source.index(' function update(){')
end=source.index(' function open(i){',start)
source=source[:start]+''' function update(){
  visited=keys.map((_,i)=>DevelopmentJourney.completed(i));
  [...islands.children].forEach((g,i)=>{
   const status=DevelopmentJourney.status(i),available=status==='available',complete=status==='complete';
   g.classList.toggle('complete',complete);g.classList.toggle('locked',!available);g.dataset.status=status;
   const source='assets/'+(available?landscapes[i].asset:landscapes[i].asset.replace('.webp','-locked.webp'));
   g.querySelector('.terrain image').setAttribute('href',source);
   g.setAttribute('aria-disabled',String(!available));g.querySelector('.check').textContent=complete?'✓':i+1;
   const label=complete?'completada, recuerdo guardado':available?'disponible':status==='previous'?'completa primero la isla anterior':'en preparación';
   g.setAttribute('aria-label',`${i+1}. ${stops[i].title}, ${label}`);
   const row=$('chapter-links').children[i];row.disabled=!available;
   row.querySelector('small').textContent=complete?'Completada · Recuerdo guardado':available?'Disponible para ti':status==='previous'?'Completa primero la isla anterior':'En preparación · un próximo mesario';
   row.querySelector('.chapter-link-symbol').textContent=complete?'✓':available?'→':'◇';
  });
  const count=visited.filter(Boolean).length,next=chapters.findIndex((_,i)=>chapterAvailable(i));
  $('journey-progress').textContent=`${count} / 6 recuerdos guardados · `+(next>=0?chapters[next].title+' te espera':'El siguiente capítulo está en preparación');
  const notice=document.querySelector('.voyage-intro-today');
  if(notice)notice.textContent=next>=0?(count?'Tu avance está guardado. Ahora te espera '+chapters[next].title+'.':'Hoy comenzamos con Izar las velas. Después te espera La torre de Gizmo.'):'Tus recuerdos están guardados. El siguiente capítulo sigue en preparación.';
  const current=next>=0?next:Math.max(0,visited.lastIndexOf(true));
  ship.style.left=stops[current].x+'px';ship.style.top=(stops[current].y+58)+'px';
 }
'''+source[end:]
source=replace_once(source,'  if(travel)return;',"  if(travel)return;\n  if(DevelopmentJourney.completed(i)){toast('Esta isla ya está completada. Tu recuerdo quedó guardado.');return;}")
source=source.replace("toast('Tu bebito está preparando esta sorpresa para un próximo mesario, un día 14.');", "toast(DevelopmentJourney.status(i)==='previous'?'Completa primero la isla anterior.':'Tu Antonio está preparando este capítulo para otro mesario.');")
source=source.replace("sessionStorage.setItem('valent-mesario-intro-v1'", "sessionStorage.setItem('valent-development-intro-v1'").replace("sessionStorage.getItem('valent-mesario-intro-v1'", "sessionStorage.getItem('valent-development-intro-v1'")
source=source.replace("window.addEventListener('storage',update);", "window.addEventListener('storage',update);window.addEventListener('development-progress',update);")
source=source.replace("storage.set('lucero-tesoro-v1','complete')", "DevelopmentJourney.complete(5)")
source=source.replace("location.replace('../index.html?pendiente='+(Number(pageIsland)+1));", "location.replace('../index_v2.html?'+(DevelopmentJourney.completed(Number(pageIsland))?'completada':'pendiente')+'='+(Number(pageIsland)+1));")
source=source.replace("location.href='islas/'+stop.file+'.html'","location.href='islas/'+stop.file+'.html?dev=2'")
source=source.replace("&&!location.search.includes('pendiente=')","&&!location.search.includes('pendiente=')&&!location.search.includes('completada=')")
source=source.replace(" if(location.search.includes('pendiente='))"," if(location.search.includes('completada=')){history.replaceState(null,'',location.pathname);setTimeout(()=>toast('Esta isla ya está completada. Tu recuerdo quedó guardado.'),200);}\n if(location.search.includes('pendiente='))")
source='/* Generated from production by scripts/build-development-v2.py. */\n'+source
write('assets/experience-v2.js',source)

page=development_html('index.html')
page=page.replace('<title>Mi lugar favorito es contigo · Nuestra aventura</title>','<title>Nuestra aventura · Desarrollo v2</title>')
page=page.replace('<small>Para amorcito</small>','<small>Desarrollo v2</small>')
page=page.replace('Hoy empezamos juntos con <strong>Izar las velas</strong>. Las demás sorpresas llegarán en nuestros próximos mesarios.',
                  'Tu avance queda guardado. Completa <strong>Izar las velas</strong> y sigue hacia <strong>La torre de Gizmo</strong>. Las siguientes islas llegarán en otros mesarios.')
page=page.replace('</head>','<link rel="stylesheet" href="assets/development-v2.css?v=1"></head>')
write('index_v2.html',page)

for source,target in [('encuentro','rescate'),('recuerdos','recuerdos'),('aventuras','aventuras'),('constelacion','constelacion'),('tesoro','tesoro')]:
    page=development_html(f'islas/{source}.html')
    if source=='encuentro':
        page=page.replace('assets/rescue.js?v=7','assets/rescue-v2.js?v=1')
    write(f'islas/{target}_v2.html',page)

rescue=(ROOT/'assets/rescue.js').read_text(encoding='utf-8')
rescue=replace_once(rescue,"  if (document.body.dataset.page !== 'rescue') return;","  if (document.body.dataset.page !== 'rescue' || !DevelopmentJourney.available(0)) return;")
rescue=replace_once(rescue,"    if(event.type==='win') {", "    if(event.type==='win') {\n      DevelopmentJourney.complete(0);")
write('assets/rescue-v2.js','/* Generated development copy; production rescue.js is unchanged. */\n'+rescue)
print('Generated development map, shared runtime, first rescue and four future routes. Production files unchanged.')
