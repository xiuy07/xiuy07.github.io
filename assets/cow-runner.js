/* Original pixel art and forgiving runner physics, inspired by Chrome Dino. */
const canvas=document.querySelector('#cow-runner');
const ctx=canvas.getContext('2d');
const action=document.querySelector('[data-runner-action]');
const pause=document.querySelector('[data-runner-pause]');
const duckButton=document.querySelector('[data-runner-duck]');
const status=document.querySelector('#cow-game-status');
const scoreText=document.querySelector('[data-runner-score]');
const bestText=document.querySelector('[data-runner-best]');
const compactGame=matchMedia('(max-width:600px)');
const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)');
const ground=204;
let worldWidth=compactGame.matches?480:900;
canvas.width=worldWidth;
let best=0;
try{best=Number(localStorage.getItem('xiu-cow-runner-best'))||0;}catch{}
bestText.textContent=String(best).padStart(5,'0');
let state='idle',time=0,score=0,bonus=0,speed=240,distance=0,nextObstacle=1.8,last=0,frame=0,jumpBuffer=0;
let obstacles=[],dust=[],duckHeld=false;
const cow={x:compactGame.matches?34:72,y:ground-78,vy:0,w:90,h:78};
const spring={value:0,velocity:0};
const sprite=document.createElement('canvas');sprite.width=30;sprite.height=26;
const pixel=sprite.getContext('2d');
const colors=()=>document.documentElement.dataset.theme==='dark'?{ink:'#b7cdd0',faint:'#36565d',grass:'#73988b',hay:'#b09f72',cloud:'#335059'}:{ink:'#48676d',faint:'#cddcdd',grass:'#88a99b',hay:'#c3ae7c',cloud:'#e0e9e8'};
function rect(x,y,w,h,color){pixel.fillStyle=color;pixel.fillRect(x,y,w,h);}
function isDucking(){return duckHeld&&cow.y>=ground-cow.h-.1;}
function setDuck(held){duckHeld=held&&state==='playing';duckButton.setAttribute('aria-pressed',String(duckHeld));if(state==='playing')draw();}
function paintCow(){
  pixel.clearRect(0,0,30,26);
  const ink='#35454d',white='#fffdf1',pink='#efb4b6',hoof='#62717a';
  const onFloor=cow.y>=ground-cow.h-.1;
  const gait=state==='playing'&&onFloor?Math.floor(time*8)%2:0;
  const duck=isDucking(),bodyDrop=duck?5:0,headDrop=duck?8:0;
  // Four short legs, a curved tail, and a stepped silhouette keep the cow round.
  for(const [i,x] of [5,9,15,19].entries()){
    const lift=state==='playing'&&onFloor&&((i%2)===gait)?1:0;
    rect(x,duck?23:19,4,(duck?3:7)-lift,ink);rect(x+1,duck?23:20,2,(duck?1:4)-lift,white);rect(x,24-lift,4,2,hoof);
  }
  rect(1,12+bodyDrop,3,1,ink);rect(0,13+bodyDrop,1,4,ink);rect(0,16+bodyDrop,2,2,ink);
  rect(5,10+bodyDrop,13,duck?9:12,ink);rect(3,12+bodyDrop,18,duck?6:8,ink);
  rect(5,11+bodyDrop,12,duck?7:10,white);rect(4,13+bodyDrop,16,duck?4:6,white);
  rect(6,12+bodyDrop,4,4,ink);rect(7,16+bodyDrop,2,1,ink);rect(12,16+bodyDrop,4,duck?2:4,ink);rect(16,11+bodyDrop,3,3,ink);
  if(!duck){rect(10,21,6,2,pink);rect(11,23,1,1,pink);rect(14,23,1,1,pink);}
  // Oversized face, small horns, pink ears, bright eyes and a soft muzzle.
  const head=(x,y,w,h,color)=>rect(x-6,y+headDrop,w,h,color);
  head(20,5,4,4,ink);head(21,6,2,2,pink);head(33,5,3,4,ink);head(34,6,1,2,pink);
  head(25,1,2,4,'#c4b18b');head(31,1,2,4,'#c4b18b');head(25,1,1,1,'#e5d9ba');head(31,1,1,1,'#e5d9ba');
  head(24,4,9,13,ink);head(22,6,13,9,ink);
  head(25,5,7,11,white);head(23,7,11,7,white);
  head(25,5,4,3,ink);head(24,6,2,2,ink);
  const blink=state==='playing'&&time%4.6>4.42;
  head(27,10,2,blink?1:3,ink);head(32,10,2,blink?1:3,ink);
  if(!blink){head(27,10,1,1,'#fff');head(32,10,1,1,'#fff');}
  head(24,13,2,1,pink);head(27,14,8,3,pink);head(28,17,6,1,pink);
  head(29,15,1,1,'#b37982');head(33,15,1,1,'#b37982');head(31,17,1,1,'#b37982');
}
function collisionBox(){return {left:cow.x+12,right:cow.x+75,top:cow.y+(isDucking()?39:9),bottom:cow.y+cow.h-8};}
function hitsObstacle(o){
  const b=collisionBox(),top=o.kind==='bird'?o.y+4:ground-o.h+5,bottom=o.kind==='bird'?o.y+o.h-4:ground-3;
  return b.left<o.x+o.w-5&&b.right>o.x+5&&b.bottom>top&&b.top<bottom;
}
function puff(x,color){if(reduceMotion.matches)return;for(let i=0;i<4;i++)dust.push({x:x+i*8,y:ground-3,vx:-15-Math.random()*35,vy:-20-Math.random()*30,life:.32,color});}
function draw(){
  const c=colors();ctx.clearRect(0,0,worldWidth,260);ctx.imageSmoothingEnabled=false;
  ctx.fillStyle=c.cloud;
  for(let i=0;i<3;i++){const x=((240+i*300-distance*.1)%1050+1050)%1050-70,y=43+(i%2)*24;ctx.fillRect(x,y,65,9);ctx.fillRect(x+14,y-10,35,10);}
  ctx.fillStyle=c.ink;ctx.fillRect(0,ground,worldWidth,2);
  ctx.fillStyle=c.faint;
  for(let x=0;x<24;x++){const px=((x*47-distance)%1128+1128)%1128;ctx.fillRect(px,ground+13+(x%3)*9,x%2?8:15,2);}
  const shadow=Math.max(.55,1-(ground-cow.h-cow.y)/260);ctx.fillRect(cow.x+15+(1-shadow)*30,ground+4,60*shadow,3);
  ctx.fillStyle=c.grass;
  for(let i=0;i<7;i++){const x=((i*151+150-distance*.7)%1057+1057)%1057;ctx.fillRect(x,ground-7,2,7);ctx.fillRect(x-4,ground-4,3,2);ctx.fillRect(x+2,ground-5,3,2);}
  for(const o of obstacles){
    if(o.kind==='bird'){
      const flap=Math.floor(time*7)%2;ctx.fillStyle=c.ink;ctx.fillRect(o.x+9,o.y+10,23,10);ctx.fillRect(o.x+3,o.y+8,12,12);ctx.fillRect(o.x,o.y+14,7,3);
      ctx.fillRect(o.x+18,o.y+(flap?16:0),7,flap?12:14);ctx.fillRect(o.x+24,o.y+(flap?22:0),6,5);ctx.fillRect(o.x+32,o.y+8,8,4);
      ctx.fillStyle='#fffdf1';ctx.fillRect(o.x+6,o.y+11,3,3);
    }
    else if(o.kind==='fence'){ctx.fillStyle=c.ink;ctx.fillRect(o.x,ground-o.h,6,o.h);ctx.fillRect(o.x+o.w-6,ground-o.h,6,o.h);ctx.fillRect(o.x,ground-o.h+9,o.w,5);ctx.fillRect(o.x,ground-13,o.w,5);}
    else{ctx.fillStyle=c.hay;ctx.fillRect(o.x+3,ground-o.h,o.w-6,o.h);ctx.fillRect(o.x,ground-o.h+4,o.w,o.h-4);ctx.fillStyle=c.ink;ctx.fillRect(o.x+9,ground-o.h,2,o.h);ctx.fillRect(o.x+o.w-11,ground-o.h,2,o.h);ctx.fillRect(o.x+3,ground-11,o.w-6,2);}
  }
  for(const d of dust){ctx.globalAlpha=Math.max(0,d.life/.32);ctx.fillStyle=d.color;ctx.fillRect(Math.round(d.x),Math.round(d.y),3,3);}ctx.globalAlpha=1;
  paintCow();
  const stretch=reduceMotion.matches?0:spring.value;
  const w=cow.w*(1+stretch),h=cow.h/(1+stretch);
  const bob=state==='playing'&&cow.y>=ground-cow.h-.1&&!reduceMotion.matches?Math.sin(time*16)*1.2:0;
  ctx.drawImage(sprite,Math.round(cow.x+(cow.w-w)/2),Math.round(cow.y+cow.h-h+bob),Math.round(w),Math.round(h));
  if(state!=='playing'){ctx.fillStyle=c.ink;ctx.font='14px ui-monospace,Consolas,monospace';ctx.textAlign='center';ctx.fillText(state==='idle'?'READY TO MOO?':state==='paused'?'TAKE A BREAK':'ONE MORE MOO?',worldWidth*.62,100);}
}
function setState(value){
  state=value;canvas.dataset.state=value;
  action.textContent=value==='idle'?'开始跑跑':value==='over'?'再跑一次':value==='paused'?'继续':'跳跃';
  pause.hidden=value==='idle'||value==='over';pause.disabled=false;pause.textContent=value==='paused'?'重新开始':'暂停';
  duckButton.disabled=value!=='playing';if(value!=='playing'){duckHeld=false;duckButton.setAttribute('aria-pressed','false');}
  status.textContent=value==='idle'?'准备好了，就出发。':value==='playing'?'跳过草垛，低头躲鸟。':value==='paused'?'休息一下，准备好再继续。':'哞，碰到啦！再试一次。';
  draw();
}
function start(){
  cancelAnimationFrame(frame);time=0;score=0;bonus=0;distance=0;speed=compactGame.matches?205:240;nextObstacle=1.8;obstacles=[];dust=[];duckHeld=false;duckButton.setAttribute('aria-pressed','false');jumpBuffer=0;spring.value=0;spring.velocity=0;cow.y=ground-cow.h;cow.vy=0;last=0;scoreText.textContent='00000';setState('playing');frame=requestAnimationFrame(tick);
}
function jump(){cow.vy=-590;jumpBuffer=0;spring.velocity=-2.2;puff(cow.x+22,colors().faint);}
function requestJump(){if(duckHeld)return;jumpBuffer=.14;if(cow.y>=ground-cow.h-.1)jump();}
function act(){
  if(state==='idle'||state==='over'){start();return;}
  if(state==='paused'){setState('playing');last=0;frame=requestAnimationFrame(tick);return;}
  requestJump();
}
function togglePause(){if(state==='playing'){cancelAnimationFrame(frame);setState('paused');}else if(state==='paused')act();}
function gameOver(){
  if(score>best){best=score;bestText.textContent=String(best).padStart(5,'0');try{localStorage.setItem('xiu-cow-runner-best',String(best));}catch{}}
  setState('over');
}
function tick(now){
  if(state!=='playing')return;
  const dt=last?Math.min((now-last)/1000,.035):0;last=now;time+=dt;speed=Math.min(compactGame.matches?340:430,(compactGame.matches?205:240)+time*1.4);distance+=speed*dt;
  if(jumpBuffer>0&&cow.y>=ground-cow.h-.1)jump();jumpBuffer=Math.max(0,jumpBuffer-dt);
  const wasAirborne=cow.y<ground-cow.h-.1;
  cow.vy+=(duckHeld&&cow.vy>0?2800:1600)*dt;cow.y=Math.min(ground-cow.h,cow.y+cow.vy*dt);
  if(cow.y>=ground-cow.h&&cow.vy>=0){cow.vy=0;if(wasAirborne){spring.velocity=3;puff(cow.x+22,colors().faint);}}
  spring.velocity+=(-spring.value*120-spring.velocity*16)*dt;spring.value=Math.max(-.14,Math.min(.2,spring.value+spring.velocity*dt));
  nextObstacle-=dt;
  if(nextObstacle<=0){
    const roll=Math.random(),kind=score>150&&roll<.32?'bird':score>100&&roll<.65?'fence':'hay';
    // A low bird overlaps standing horns but clears the entire crouched silhouette.
    obstacles.push({x:worldWidth+30,w:kind==='bird'?40:35,h:kind==='bird'?28:kind==='fence'?39:27,y:ground-(Math.random()<.75?82:126),kind,passed:false});nextObstacle=1.6+Math.random()*.7;
  }
  for(const o of obstacles){
    o.x-=speed*dt;
    if(hitsObstacle(o)){gameOver();return;}
    if(!o.passed&&o.x+o.w<cow.x+12){o.passed=true;bonus+=25;}
  }
  obstacles=obstacles.filter(o=>o.x+o.w>0);
  for(const d of dust){d.life-=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=130*dt;}dust=dust.filter(d=>d.life>0);
  score=Math.floor(distance/10)+bonus;scoreText.textContent=String(score).padStart(5,'0');draw();frame=requestAnimationFrame(tick);
}
action.addEventListener('click',act);pause.addEventListener('click',()=>state==='paused'?start():togglePause());
duckButton.addEventListener('pointerdown',event=>{if(event.button!==0||state!=='playing')return;event.preventDefault();duckButton.setPointerCapture(event.pointerId);setDuck(true);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])duckButton.addEventListener(event,()=>setDuck(false));
duckButton.addEventListener('keydown',event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();setDuck(true);}});
duckButton.addEventListener('keyup',event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();setDuck(false);}});
duckButton.addEventListener('blur',()=>setDuck(false));
canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;canvas.focus({preventScroll:true});if(state==='idle'||state==='over'){start();requestJump();}else act();});
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,textarea,a,[contenteditable="true"]'))return;
  if(event.code==='ArrowDown'){if(state==='playing'){event.preventDefault();setDuck(true);}return;}
  if(event.repeat)return;
  if(event.code==='ArrowUp'||event.code==='Space'&&!event.target.closest('button')){event.preventDefault();if(state==='idle'||state==='over'){start();requestJump();}else act();}
  if(event.code==='KeyP'||event.code==='Escape')togglePause();
});
document.addEventListener('keyup',event=>{if(event.code==='ArrowDown')setDuck(false);});
window.addEventListener('blur',()=>{setDuck(false);if(state==='playing')togglePause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});
compactGame.addEventListener('change',()=>{worldWidth=compactGame.matches?480:900;canvas.width=worldWidth;cow.x=compactGame.matches?34:72;obstacles=[];nextObstacle=1.8;if(state==='playing')togglePause();else draw();});
new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
setState('idle');
