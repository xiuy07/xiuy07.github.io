/* Original canvas runner and pixel cow; inspired by the Chrome-style 404 game. */
const canvas=document.querySelector('#cow-runner');
const ctx=canvas.getContext('2d');
const action=document.querySelector('[data-runner-action]');
const pause=document.querySelector('[data-runner-pause]');
const status=document.querySelector('#cow-game-status');
const scoreText=document.querySelector('[data-runner-score]');
const bestText=document.querySelector('[data-runner-best]');
const ground=204;
const compactGame=matchMedia('(max-width:600px)');
let worldWidth=compactGame.matches?480:900;
canvas.width=worldWidth;
let best=0;
try{best=Number(localStorage.getItem('xiu-cow-runner-best'))||0;}catch{}
bestText.textContent=String(best).padStart(5,'0');
let state='idle',time=0,score=0,speed=285,distance=0,nextObstacle=1.5,last=0,frame=0;
let obstacles=[];
const cow={x:compactGame.matches?42:83,y:ground-60,vy:0,w:90,h:60};
const sprite=[
  '                      hh   hh ',
  '                     hhwwwhh  ',
  '                    kwwwwwkk  ',
  '    wwwwwwwwwwwwwwwwwwwkwkw  ',
  '   wwwkkkwwwwwwkkwwwwwwwwww  ',
  '  wwwkkkkwwwwwkkkwwwwwpppppp ',
  '  wwwkkkkwwwwwwkwwwwwwpppppp ',
  ' kwwwwkkwwwwwwwwwwwwwppnppnp ',
  ' kwwwwwwwwwwwwwwwwwwwwpppppp ',
  ' kwwwwwwwwkkkwwwwwwwwwwwwww  ',
  ' kwwwwwwwwkkkkwwwwwwwww       ',
  ' kwwwwwwwwkkkwwwwwwwwww       ',
  '  wwwwwwwwwwwwwwwwwwww       ',
  '  wwwwwwwwwwwwwwwwwwww       ',
  '   wwwwwwwppppwwwwwww        ',
  '   wwwwwww pp wwwwwww        ',
  '    wwwww      wwwww         ',
  '    wwww        wwww         ',
  '    kkkk        kkkk         ',
  '    kkkk        kkkk         '
];
const palette={w:'#f3f5ed',k:'#2c4149',p:'#e8a7aa',n:'#956e78',h:'#c0aa7e'};
function colors(){return document.documentElement.dataset.theme==='dark'?{ink:'#b7cdd0',faint:'#36565d',grass:'#73988b',hay:'#b09f72',cloud:'#335059'}:{ink:'#48676d',faint:'#cddcdd',grass:'#88a99b',hay:'#c3ae7c',cloud:'#e0e9e8'};}
function pixelCow(){
  const running=state==='playing'&&cow.y>=ground-cow.h-1;
  const phase=Math.floor(time*10)%2;
  ctx.fillStyle=palette.k;
  sprite.forEach((row,y)=>[...row].forEach((key,x)=>{
    if(!palette[key])return;
    const shift=y>=16&&running?(x<14?(phase?2:-1):(phase?-1:2)):0;
    ctx.fillRect(Math.round(cow.x+x*3+shift)-1,Math.round(cow.y+y*3)-1,5,5);
  }));
  sprite.forEach((row,y)=>[...row].forEach((key,x)=>{
    if(!palette[key])return;
    let legShift=y>=16&&running?(x<14?(phase?2:-1):(phase?-1:2)):0;
    ctx.fillStyle=palette[key];ctx.fillRect(Math.round(cow.x+x*3+legShift),Math.round(cow.y+y*3),3,3);
  }));
  // The tail is separate so the silhouette stays readable at phone widths.
  ctx.fillStyle=palette.k;ctx.fillRect(cow.x-5,Math.round(cow.y+13),6,3);ctx.fillRect(cow.x-8,Math.round(cow.y+13),3,17);
}
function draw(){
  const c=colors();ctx.clearRect(0,0,worldWidth,260);ctx.imageSmoothingEnabled=false;
  ctx.fillStyle=c.cloud;
  for(let i=0;i<3;i++){const x=((240+i*300-distance*.13)%1050+1050)%1050-70;const y=43+(i%2)*24;ctx.fillRect(x,y,65,9);ctx.fillRect(x+14,y-10,35,10);}
  ctx.fillStyle=c.ink;ctx.fillRect(0,ground,worldWidth,2);
  ctx.fillStyle=c.faint;
  for(let x=0;x<24;x++){const px=((x*47-distance)%1128+1128)%1128;ctx.fillRect(px,ground+13+(x%3)*9,x%2?8:15,2);}
  ctx.fillStyle=c.grass;
  for(let i=0;i<7;i++){const x=((i*151+150-distance*.7)%1057+1057)%1057;ctx.fillRect(x,ground-7,2,7);ctx.fillRect(x-4,ground-4,3,2);ctx.fillRect(x+2,ground-5,3,2);}
  for(const obstacle of obstacles){
    if(obstacle.kind==='fence'){
      ctx.fillStyle=c.ink;ctx.fillRect(obstacle.x,ground-obstacle.h,6,obstacle.h);ctx.fillRect(obstacle.x+obstacle.w-6,ground-obstacle.h,6,obstacle.h);ctx.fillRect(obstacle.x,ground-obstacle.h+9,obstacle.w,6);ctx.fillRect(obstacle.x,ground-15,obstacle.w,6);
    }else{
      ctx.fillStyle=c.hay;ctx.fillRect(obstacle.x,ground-obstacle.h,obstacle.w,obstacle.h);ctx.fillStyle=c.ink;ctx.fillRect(obstacle.x+8,ground-obstacle.h,3,obstacle.h);ctx.fillRect(obstacle.x+obstacle.w-11,ground-obstacle.h,3,obstacle.h);ctx.fillRect(obstacle.x,ground-13,obstacle.w,2);
    }
  }
  pixelCow();
  if(state!=='playing'){
    ctx.fillStyle=c.ink;ctx.font='14px ui-monospace,Consolas,monospace';ctx.textAlign='center';ctx.fillText(state==='idle'?'READY TO MOO?':state==='paused'?'PAUSED':'MOO… TRY AGAIN',worldWidth*.59,112);
  }
}
function setState(value){
  state=value;canvas.dataset.state=value;
  action.textContent=value==='idle'?'开始跑跑':value==='over'?'再跑一次':value==='paused'?'继续跑跑':'跳跃';
  pause.disabled=value==='idle'||value==='over';pause.textContent=value==='paused'?'继续':'暂停';
  status.textContent=value==='idle'?'准备好了，就出发。':value==='playing'?'跳过前面的栅栏和草垛。':value==='paused'?'休息一下，准备好再继续。':'碰到了，没关系，再跑一次。';
  draw();
}
function start(){
  cancelAnimationFrame(frame);time=0;score=0;distance=0;speed=285;nextObstacle=1.5;obstacles=[];cow.y=ground-cow.h;cow.vy=0;last=0;scoreText.textContent='00000';setState('playing');frame=requestAnimationFrame(tick);
}
function act(){
  if(state==='idle'||state==='over'){start();return;}
  if(state==='paused'){setState('playing');last=0;frame=requestAnimationFrame(tick);return;}
  if(cow.y>=ground-cow.h-1)cow.vy=-650;
}
function togglePause(){
  if(state==='playing'){cancelAnimationFrame(frame);setState('paused');}
  else if(state==='paused')act();
}
function gameOver(){
  if(score>best){best=score;bestText.textContent=String(best).padStart(5,'0');try{localStorage.setItem('xiu-cow-runner-best',String(best));}catch{}}
  setState('over');
}
function tick(now){
  if(state!=='playing')return;
  const dt=last?Math.min((now-last)/1000,.035):0;last=now;time+=dt;speed=Math.min(500,285+time*2.4);distance+=speed*dt;
  cow.vy+=1750*dt;cow.y=Math.min(ground-cow.h,cow.y+cow.vy*dt);if(cow.y>=ground-cow.h)cow.vy=0;
  nextObstacle-=dt;
  if(nextObstacle<=0){const kind=Math.random()<.55?'fence':'hay';obstacles.push({x:worldWidth+30,w:kind==='fence'?36:39,h:kind==='fence'?44:31,kind});nextObstacle=1.25+Math.random()*.65;}
  for(const obstacle of obstacles){obstacle.x-=speed*dt;const hit=cow.x+10<obstacle.x+obstacle.w-4&&cow.x+cow.w-4>obstacle.x+4&&cow.y+cow.h-5>ground-obstacle.h+5;if(hit){gameOver();return;}}
  obstacles=obstacles.filter(o=>o.x+o.w>0);score=Math.floor(distance/10);scoreText.textContent=String(score).padStart(5,'0');draw();frame=requestAnimationFrame(tick);
}
action.addEventListener('click',act);pause.addEventListener('click',togglePause);
canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;canvas.focus({preventScroll:true});act();});
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,textarea,a,button,[contenteditable="true"]')||event.repeat)return;
  if(event.code==='Space'||event.code==='ArrowUp'){event.preventDefault();act();}
  if(event.code==='KeyP'||event.code==='Escape')togglePause();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});
compactGame.addEventListener('change',()=>{
  worldWidth=compactGame.matches?480:900;canvas.width=worldWidth;cow.x=compactGame.matches?42:83;obstacles=[];nextObstacle=1.5;
  if(state==='playing')togglePause();else draw();
});
new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
setState('idle');
