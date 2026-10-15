"""Freeze the approved v2 journey as independent v3 development routes."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(name):return (ROOT/name).read_text(encoding='utf-8')
def write(name,text):(ROOT/name).write_text(text,encoding='utf-8',newline='\n')
def version(text):
    return (text.replace('index_v2.html','index_v3.html').replace('journey-v2.js?v=2','journey-v3.js?v=1')
        .replace('experience-v2.js?v=2','experience-v3.js?v=1').replace('rescue-v2.js?v=1','rescue-v3.js?v=1')
        .replace('stack-v2.js?v=2','stack-v3.js?v=1').replace('Desarrollo v2','Desarrollo v3').replace('desarrollo · v2','desarrollo · v3'))
journey=read('assets/journey-v2.js').replace('valent-development-island-${i+1}-v1','valent-development-v3-island-${i+1}-v1')
journey=journey.replace("file:'rescate_v2'","file:'rescate_v3'").replace("file:'encuentro_v2'","file:'encuentro_v3'")
journey=journey.replace("{title:'Nuestros recuerdos',type:'El álbum',file:'recuerdos_v2',ready:false", "{title:'La isla del amor de madre',type:'El tablero de los tóxicos',file:'amor_de_madre_v3',ready:true")
for name in ['aventuras','constelacion','tesoro']:journey=journey.replace(f"file:'{name}_v2'",f"file:'{name}_v3'")
journey=journey.replace('if(i<2)','if(i<3)').replace('first two prepared','first three prepared')
journey=journey.replace("function importProduction(){", "function importProduction(){\n    for(let i=0;i<2;i++)if(read(`valent-development-island-${i+1}-v1`)==='complete'&&read(keys[i])!=='complete')write(keys[i]);")
write('assets/journey-v3.js',journey)
experience=version(read('assets/experience-v2.js')).replace('valent-development-intro-v1','valent-development-v3-intro-v1')
experience=experience.replace('Generated from production by scripts/build-development-v2.py.','Frozen from v2 by scripts/build-development-v3.py; production and v2 unchanged.')
experience=experience.replace('.html?dev=2','.html?dev=3')
experience=experience.replace("  g.addEventListener('click'","  if(i===2){const name=g.querySelector('.name');name.setAttribute('y','131');name.style.fontSize='20px';name.innerHTML='<tspan x=\"0\">La isla del amor</tspan><tspan x=\"0\" dy=\"21\">de madre</tspan>';}\n  g.addEventListener('click'")
write('assets/experience-v3.js',experience)
write('assets/rescue-v3.js',version(read('assets/rescue-v2.js')))
write('assets/stack-v3.js',version(read('assets/stack-v2.js')))
page=version(read('index_v2.html')).replace('Las siguientes islas llegarán en otros mesarios.','Después llega <strong>La isla del amor de madre</strong>. Tres aventuras preparadas para nuestros próximos mesarios.')
write('index_v3.html',page)
for name in ['rescate','encuentro','aventuras','constelacion','tesoro']:
    write(f'islas/{name}_v3.html',version(read(f'islas/{name}_v2.html')))
print('Generated v3 map, isolated progression and five preserved routes. v2 and production unchanged.')
