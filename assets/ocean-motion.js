/* A photographic water surface: move existing foam, keeping land and horizon still. */
export function mountOcean(surface){
  const canvas=surface.querySelector('canvas');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
  if(!gl)return ()=>{}; // The original photograph remains visible without WebGL.
  const vertex=`attribute vec2 position;varying vec2 screen;void main(){screen=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment=`precision mediump float;
    uniform sampler2D photo;uniform vec2 crop;uniform float time;varying vec2 screen;
    void main(){
      vec2 uv=vec2(screen.x,1.-screen.y)*crop+(1.-crop)*.5;
      // Image coordinates make the water mask independent of the responsive crop.
      float water=smoothstep(.53,.72,uv.y);
      float foreground=smoothstep(.61,1.,uv.y);
      float swell=sin(uv.x*23.-uv.y*31.+time*1.32);
      float crossWave=sin(uv.x*47.+uv.y*56.-time*1.87);
      float ripples=sin(uv.x*95.-uv.y*118.+time*2.4);
      vec2 flow=vec2(swell*.0028+crossWave*.0012,
        swell*.0048+crossWave*.0021+ripples*.0007);
      flow*=water*(.4+foreground*.9);
      vec3 color=texture2D(photo,clamp(uv+flow,vec2(.001),vec2(.999))).rgb;
      // Soft, restrained reflection changes follow the wave rather than painting stripes.
      color*=.72*(1.+water*foreground*.012*crossWave);
      gl_FragColor=vec4(color,1.);
    }`;
  const shaders=[];
  function compile(type,source){const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Water shader unavailable');return shader;}
  let program,buffer,texture;
  try{
    program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Water program unavailable');
    gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  }catch{for(const shader of shaders)gl.deleteShader(shader);if(program)gl.deleteProgram(program);return ()=>{};}
  const clock=gl.getUniformLocation(program,'time'),crop=gl.getUniformLocation(program,'crop');
  let frame=0,last=0,elapsed=0,loaded=false,disposed=false;
  const photo=new Image();photo.decoding='async';
  function render(now){
    frame=0;if(disposed||!loaded||surface.dataset.paused==='true'||surface.dataset.offscreen==='true')return;
    if(now-last>=32){elapsed+=last?Math.min((now-last)/1000,.06):0;last=now;gl.uniform1f(clock,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);}
    frame=requestAnimationFrame(render);
  }
  function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(loaded&&!disposed&&surface.dataset.paused!=='true'&&surface.dataset.offscreen!=='true')frame=requestAnimationFrame(render);}
  function resize(){
    if(!loaded||disposed)return;
    const width=surface.clientWidth,height=surface.clientHeight;if(!width||!height)return;
    const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);
    const scale=Math.max(width/photo.width,height/photo.height);gl.uniform2f(crop,width/(photo.width*scale),height/(photo.height*scale));
    gl.uniform1f(clock,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(surface);
  const visibilityObserver=new MutationObserver(sync);visibilityObserver.observe(surface,{attributes:true,attributeFilter:['data-paused','data-offscreen']});
  photo.onload=()=>{if(disposed)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,photo);loaded=true;resize();surface.dataset.ready='true';sync();};
  photo.src='/assets/ocean-surf.webp';
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();surface.dataset.ready='false';cancelAnimationFrame(frame);});
  return ()=>{disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();visibilityObserver.disconnect();photo.onload=null;gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);for(const shader of shaders)gl.deleteShader(shader);gl.getExtension('WEBGL_lose_context')?.loseContext();};
}
