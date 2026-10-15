/* Original transparent PNGs, grouped by level. Null keeps a text placeholder.
   Add the pending level-two mother and children here when their portraits arrive.
   Paths are relative to islas/amor_de_madre_v3.html. */
globalThis.PirateMotherPortraits={
  levels:[
    {
      mother:{label:'Mamá',initial:'M',name:'Jenny',src:'../familia/JENNY.png'},
      children:[
        {label:'Hijo',initial:'H',name:'Megan',src:'../familia/MEGAN.png'},
        {label:'Hijo',initial:'H',name:'Logan',src:'../familia/LOGAN.png'}
      ]
    },
    {
      mother:{label:'Mamá',initial:'M',src:null},
      children:[{label:'Hijo',initial:'H',src:null}]
    },
    {
      mother:{label:'Mamá',initial:'M',name:'Mamá',src:'../familia/MAMA.png'},
      children:[
        {label:'Hijo',initial:'H',name:'Iván',src:'../familia/IVAN.png'},
        {label:'Hijo',initial:'H',name:'Jhon',src:'../familia/JHON.png'},
        {label:'Hijo',initial:'H',name:'Harry',src:'../familia/HARRY.png'}
      ]
    }
  ]
};
