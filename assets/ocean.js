/* Animate the actual water texture. Static/CSS fallback remains behind the canvas. */
(() => {
  'use strict';
  const surface=document.querySelector('.ocean');
  if(!surface)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const imageURL=new URL('ocean.webp',document.currentScript.src).href;
  let canvas,gl,program,frame=0,last=0,start=0,waterImage,resizeObserver,visibilityHandler,generation=0;

  function stop(){generation++;cancelAnimationFrame(frame);frame=0;resizeObserver?.disconnect();if(visibilityHandler)document.removeEventListener('visibilitychange',visibilityHandler);surface.classList.remove('live-water');canvas?.remove();canvas=null;gl=null;}
  function initialize(){
    if(motion.matches||canvas)return;
    const token=++generation;
    canvas=document.createElement('canvas');canvas.className='water-surface';canvas.setAttribute('aria-hidden','true');
    gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
    if(!gl){canvas=null;return;}
    const vertex='attribute vec2 a_position; varying vec2 v_uv; void main(){v_uv=(a_position+1.0)*0.5;gl_Position=vec4(a_position,0.0,1.0);}';
    const fragment=`precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_water;
      uniform float u_time;
      uniform vec2 u_crop;
      void main(){
        vec2 p=v_uv;
        float t=u_time;
        float a=sin(p.x*42.0+p.y*29.0-t*1.8);
        float b=sin(p.x*19.0-p.y*56.0+t*1.35);
        float c=cos(p.x*81.0+p.y*38.0-t*2.1);
        vec2 warp=vec2(a+b*0.45,b+c*0.35)*0.0065;
        vec2 uv=0.5+(p-0.5+warp)*u_crop;
        vec3 water=texture2D(u_water,clamp(uv,0.002,0.998)).rgb;
        vec2 shineUV=uv+vec2(c,a)*0.0025*u_crop;
        vec3 shimmer=texture2D(u_water,clamp(shineUV,0.002,0.998)).rgb;
        water=mix(water,shimmer,0.22);
        float glint=pow(max(0.0,a*0.5+b*0.3+c*0.2),6.0);
        water+=vec3(0.08,0.14,0.13)*glint;
        water*=0.99+0.025*sin(p.x*16.0+p.y*13.0-t*1.1);
        gl_FragColor=vec4(water,1.0);
      }`;
    function shader(type,source){const result=gl.createShader(type);gl.shaderSource(result,source);gl.compileShader(result);if(!gl.getShaderParameter(result,gl.COMPILE_STATUS))throw new Error('Water shader unavailable');return result;}
    try{
      program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Water rendering unavailable');
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      waterImage=new Image();waterImage.onload=()=>{
        if(token!==generation||!gl||motion.matches)return;
        try{
          gl.useProgram(program);
          const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,waterImage);
          gl.uniform1i(gl.getUniformLocation(program,'u_water'),0);
          surface.prepend(canvas);surface.classList.add('live-water');
          const timeLocation=gl.getUniformLocation(program,'u_time'),cropLocation=gl.getUniformLocation(program,'u_crop');
          function resize(){
            if(!gl)return;const r=surface.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.25);
            canvas.width=Math.max(1,Math.round(r.width*ratio));canvas.height=Math.max(1,Math.round(r.height*ratio));gl.viewport(0,0,canvas.width,canvas.height);
            const aspect=r.width/r.height,imageAspect=waterImage.width/waterImage.height;
            gl.uniform2f(cropLocation,aspect<imageAspect?aspect/imageAspect:1,aspect>imageAspect?imageAspect/aspect:1);
          }
          resize();resizeObserver=new ResizeObserver(resize);resizeObserver.observe(surface);
          function render(now){
            frame=0;if(!gl||motion.matches||document.hidden)return;
            if(!start)start=now;
            if(now-last>=32){gl.uniform1f(timeLocation,(now-start)/1000);gl.drawArrays(gl.TRIANGLES,0,6);last=now;}
            frame=requestAnimationFrame(render);
          }
          canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();});
          visibilityHandler=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else if(gl&&!frame){last=0;frame=requestAnimationFrame(render);}};
          document.addEventListener('visibilitychange',visibilityHandler);
          frame=requestAnimationFrame(render);
        }catch{stop();}
      };waterImage.onerror=stop;waterImage.src=imageURL;
    }catch{stop();}
  }
  motion.addEventListener('change',()=>motion.matches?stop():initialize());
  initialize();
})();
